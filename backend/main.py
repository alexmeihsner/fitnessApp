import sqlite3
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
import requests

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = Path(__file__).with_name("fitness.db")


class WorkoutCreate(BaseModel):
    date: str
    name: str
    type: str
    sets: int
    reps: str
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
                completed_at TEXT NOT NULL
            )
            """
        )


def serialize_workout(row):
    return {
        "id": row["id"],
        "date": row["date"],
        "name": row["name"],
        "type": row["type"],
        "sets": row["sets"],
        "reps": row["reps"],
        "completedAt": row["completed_at"],
    }


init_db()

#basic template
@app.get("/")
def home():
    return {"message": "Hello world"}

url = "https://www.strava.com/api/v3/athlete/activities"
def get_strava_key():
    with open("../stravaAPIFile.txt", "r") as f:
        return f.readline().strip()
#making strava calls

#getting the API KEY
@app.get("/activities")
def get_activities():
    url = f"https://www.strava.com/api/v3/athlete?access_token={get_strava_key()}"

    headers = {
        "access_token": f"{get_strava_key()}"
    }

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print(response.text)
        raise HTTPException(
            status_code=response.status_code,
            detail=response.text
        )
    return response.json()

@app.get("/working")
def home():
    return {"message": "is working"}


@app.get("/workouts")
def get_workouts(date: str):
    with get_db_connection() as connection:
        rows = connection.execute(
            """
            SELECT id, date, name, type, sets, reps, completed_at
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
            INSERT INTO workout_ledger (date, name, type, sets, reps, completed_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                workout.date,
                workout.name,
                workout.type,
                workout.sets,
                workout.reps,
                workout.completedAt,
            ),
        )
        row = connection.execute(
            """
            SELECT id, date, name, type, sets, reps, completed_at
            FROM workout_ledger
            WHERE id = ?
            """,
            (cursor.lastrowid,),
        ).fetchone()

    return serialize_workout(row)
