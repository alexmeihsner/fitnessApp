from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
)
#basic template
@app.get("/")
def home():
    return {"message": "Hello world"}
