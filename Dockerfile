# Stage 1: Retrieve Caddy binary from official image
FROM caddy:2-alpine AS caddy_bin

# Stage 2: Build the main Python application image
FROM python:3.11-slim

# Copy the static Caddy binary into the runtime environment
COPY --from=caddy_bin /usr/bin/caddy /usr/bin/caddy

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

# Define working directory
WORKDIR /app

# Install standard dependencies
RUN pip install --no-cache-dir flask flask-socketio eventlet websockets requests

# Copy source tree
COPY . .

# Expose HTTP port (Render will override $PORT env var dynamically)
EXPOSE 8080

# Execute orchestration script to run Caddy, HTTP/Socket.IO, and WebSocket servers
CMD ["python", "run_all.py"]
