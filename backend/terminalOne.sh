#!/bin/bash

# "chmod +x terminalOne.sh" **make sure to run this the first time**
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000