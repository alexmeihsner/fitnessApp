from fastapi import FastAPI, HTTPException
from starlette.middleware.cors import CORSMiddleware
import requests

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
)
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