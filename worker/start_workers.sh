#!/bin/bash

# AI Mixer Pro Worker Startup Script
# This script starts the BullMQ worker processes

echo "Starting AI Mixer Pro workers..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 not found. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: node not found. Please install Node.js."
    exit 1
fi

# Check if Redis is running
if ! command -v redis-cli &> /dev/null; then
    echo "Warning: redis-cli not found. Redis might not be installed."
    echo "Please install Redis for queue functionality."
fi

# Install Python dependencies
echo "Installing Python dependencies..."
cd worker
pip3 install -r requirements.txt
cd ..

# Start the main worker process
echo "Starting queue workers..."
node lib/queue.js &

# Store the PID
WORKER_PID=$!
echo "Worker started with PID: $WORKER_PID"

# Save PID to file for cleanup
echo $WORKER_PID > /tmp/ai-mixer-workers.pid

# Handle cleanup on exit
cleanup() {
    echo "Stopping workers..."
    if [ -f /tmp/ai-mixer-workers.pid ]; then
        kill $(cat /tmp/ai-mixer-workers.pid) 2>/dev/null
        rm -f /tmp/ai-mixer-workers.pid
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "Workers started successfully!"
echo "Press Ctrl+C to stop"

# Wait for workers
wait $WORKER_PID