#!/usr/bin/env bash
set -e

TOKEN="${SONAR_TOKEN:-$1}"
HOST_URL="${SONAR_HOST_URL:-http://localhost:9000}"
BRANCH="${2:-main}"

echo "====================================================="
echo "   Automated SonarQube Runner for Kanban Thunder"
echo "====================================================="

# 1. Check Docker
echo "[1/4] Checking Docker daemon..."
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running! Please start Docker and retry."
    exit 1
fi
echo "Docker is active."

# 2. Check Git Branch
echo "[2/4] Checking git branch ($BRANCH)..."
current_branch=$(git branch --show-current)
if [ "$current_branch" != "$BRANCH" ]; then
    echo "Switching to $BRANCH..."
    git checkout "$BRANCH"
else
    echo "Already on branch '$BRANCH'."
fi

# 3. Start local container if needed
if [[ "$HOST_URL" == *"localhost"* || "$HOST_URL" == *"127.0.0.1"* ]]; then
    echo "[3/4] Checking local SonarQube container..."
    if [ "$(docker inspect -f '{{.State.Running}}' kanban_sonarqube 2>/dev/null)" != "true" ]; then
        echo "Starting SonarQube via docker-compose.sonar.yml..."
        docker compose -f docker-compose.sonar.yml up -d
        echo "Waiting for SonarQube server to become ready..."
        until curl -s http://localhost:9000/api/system/status | grep -q '"status":"UP"'; do
            sleep 3
            printf "."
        done
        echo ""
        echo "SonarQube is ready at http://localhost:9000."
    else
        echo "SonarQube container is already running."
    fi
fi

# 4. Token prompt
if [ -z "$TOKEN" ]; then
    read -rp "Please enter your SonarQube Token: " TOKEN
fi

if [ -z "$TOKEN" ]; then
    echo "Error: No SonarQube token provided."
    exit 1
fi

# 5. Run scanner
echo "[4/4] Executing SonarQube Scanner..."
DOCKER_HOST_URL=$(echo "$HOST_URL" | sed 's/localhost/host.docker.internal/' | sed 's/127.0.0.1/host.docker.internal/')

docker run --rm \
    -e SONAR_HOST_URL="$DOCKER_HOST_URL" \
    -e SONAR_TOKEN="$TOKEN" \
    -v "$(pwd):/usr/src" \
    sonarsource/sonar-scanner-cli

echo "SonarQube analysis finished! View results at $HOST_URL/dashboard?id=Kanban-Thunder"
