import sqlite3
from datetime import datetime, timedelta, time
from pathlib import Path
from urllib.parse import urlencode
from zoneinfo import ZoneInfo

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
import requests
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = Path(__file__).with_name("fitness.db")
STRAVA_REQUIRED_SCOPES = ["read", "activity:read_all"]


class WorkoutCreate(BaseModel):
    date: str
    name: str
    type: str
    sets: int
    reps: str
    calories: int
    completedAt: str


def get_db_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with get_db_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS workout_ledger (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                sets INTEGER NOT NULL,
                reps TEXT NOT NULL,
                calories INTEGER NOT NULL DEFAULT 0,
                completed_at TEXT NOT NULL
            )
            """
        )
        columns = connection.execute(
            "PRAGMA table_info(workout_ledger)"
        ).fetchall()
        column_names = {column["name"] for column in columns}

        if "calories" not in column_names:
            connection.execute(
                "ALTER TABLE workout_ledger ADD COLUMN calories INTEGER NOT NULL DEFAULT 0"
            )


def serialize_workout(row):
    return {
        "id": row["id"],
        "date": row["date"],
        "name": row["name"],
        "type": row["type"],
        "sets": row["sets"],
        "reps": row["reps"],
        "calories": row["calories"],
        "completedAt": row["completed_at"],
    }


init_db()

#basic template
@app.get("/")
def home():
    return {"message": "Hello world"}

url = "https://www.strava.com/api/v3/athlete/activities"
def get_strava_key():
    vals = []
    with open("../stravaAPIFile.txt", "r") as f:
        for line in f:
            vals.append(line.strip())
        return vals
#making strava calls


@app.get("/strava-auth-url")
def get_strava_auth_url(client_id: str, redirect_uri: str = "http://localhost"):
    params = {
        "client_id": client_id,
        "response_type": "code",
        "redirect_uri": redirect_uri,
        "approval_prompt": "force",
        "scope": ",".join(STRAVA_REQUIRED_SCOPES),
    }

    return {
        "authorizationUrl": f"https://www.strava.com/oauth/authorize?{urlencode(params)}",
        "requiredScopes": STRAVA_REQUIRED_SCOPES,
    }

#getting the API KEY
@app.get("/activities")
def get_activities():
    auth_url = "https://www.strava.com/oauth/token"
    vals = get_strava_key()
    payload = {
        "client_id": vals[0],
        "client_secret": vals[1],
        "refresh_token": vals[2],
        "grant_type": "refresh_token",
    }

    token_response = requests.post(auth_url, data=payload)
    url = f"https://www.strava.com/api/v3/athlete?access_token={token_response}"

    headers = {
        "access_token": f"{token_response}"
    }

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print(response.text)
        print("didnt work")
        raise HTTPException(
            status_code=response.status_code,
            detail=response.text
        )
    print("worked")
    return response.json()
@app.get("/runs")
def get_runs():
    auth_url = "https://www.strava.com/oauth/token"
    activities_url = "https://www.strava.com/api/v3/athlete/activities"
    vals = get_strava_key()
    payload = {
        "client_id": vals[0],
        "client_secret": vals[1],
        "refresh_token": vals[2],
        "grant_type": "refresh_token",
    }

    token_response = requests.post(auth_url, data=payload)

    if token_response.status_code != 200:
        raise HTTPException(
            status_code=token_response.status_code,
            detail=token_response.text,
        )

    token_data = token_response.json()
    access_token = token_data.get("access_token")

    if not access_token:
        raise HTTPException(
            status_code=400,
            detail=token_data,
        )

    timezone = ZoneInfo("America/Chicago")
    today = datetime.now(timezone).date()
    start_of_today = datetime.combine(today, time.min, tzinfo=timezone)
    start_of_tomorrow = start_of_today + timedelta(days=1)

    headers = {"Authorization": f"Bearer {access_token}"}
    params = {
        "before": int(start_of_tomorrow.timestamp()),
        "after": int(start_of_today.timestamp()),
        "page": 1,
        "per_page": 30,
    }
    activities_response = requests.get(
        activities_url,
        headers=headers,
        params=params,
    )
    print("ACTIVITIES STATUS:", activities_response.status_code)
    print("ACTIVITIES RESPONSE:", activities_response.text)

    if activities_response.status_code != 200:
        raise HTTPException(
            status_code=activities_response.status_code,
            detail=activities_response.text,
        )

    activities = activities_response.json()
    today_run = next(
        (
            activity for activity in activities
            if activity.get("type") == "Run"
        ),
        None,
    )

    return {"run": today_run}


@app.get("/working")
def home():
    return {"message": "is working"}


@app.get("/workouts")
def get_workouts(date: str):
    with get_db_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, date, name, type, sets, reps, calories, completed_at
            FROM workout_ledger
            WHERE date = ?
            ORDER BY id DESC
            """,
            (date,),
        ).fetchall()

    return [serialize_workout(row) for row in rows]


@app.post("/workouts", status_code=201)
def create_workout(workout: WorkoutCreate):
    with get_db_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO workout_ledger (date, name, type, sets, reps, calories, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                workout.date,
                workout.name,
                workout.type,
                workout.sets,
                workout.reps,
                workout.calories,
                workout.completedAt,
            ),
        )
        row = connection.execute(
            """
            SELECT id, date, name, type, sets, reps, calories, completed_at
            FROM workout_ledger
            WHERE id = ?
            """,
            (cursor.lastrowid,),
        ).fetchone()

    return serialize_workout(row)


@app.delete("/workouts/{workout_id}")
def delete_workout(workout_id: int):
    with get_db_connection() as connection:
        cursor = connection.execute(
            "DELETE FROM workout_ledger WHERE id = ?",
            (workout_id,),
        )

    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Workout not found")

    return {"deleted": True, "id": workout_id}
get_runs()