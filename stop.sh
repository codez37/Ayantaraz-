#!/bin/bash
PID=$(lsof -t -i:3001)
if [ -z "$PID" ]; then
    echo "No process running on port 3001"
else
    echo "Stopping process on port 3001 (PID: $PID)..."
    kill -15 $PID
    sleep 5
    if kill -0 $PID 2>/dev/null; then
        echo "Process did not stop gracefully, killing..."
        kill -9 $PID
    else
        echo "✓ Process stopped"
    fi
fi