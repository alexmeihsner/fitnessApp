#!/bin/bash

# "chmod +x terminalTwo.sh" **make sure to run this the first time**
cloudflared tunnel --url http://localhost:8000
#copy the address it gives and put it into the variables page on github