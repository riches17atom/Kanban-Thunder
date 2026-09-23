<#
.SYNOPSIS
    Automated SonarQube Scanner for Kanban Thunder (main branch).
.DESCRIPTION
    Checks out or verifies the git branch, starts the SonarQube container if not running,
    waits for it to be ready, and runs the scanner container automatically.
.PARAMETER Token
    Your SonarQube user/project token. Can also be set via $env:SONAR_TOKEN.
.PARAMETER HostUrl
    The SonarQube server URL. Defaults to http://localhost:9000.
.PARAMETER Branch
    Branch to scan. Defaults to main.
#>
param (
    [string]$Token = $env:SONAR_TOKEN,
    [string]$HostUrl = $env:SONAR_HOST_URL,
    [string]$Branch = "main"
)

if (-not $HostUrl) {
    $HostUrl = "http://localhost:9000"
}

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   Automated SonarQube Runner for Kanban Thunder" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Check Docker status
Write-Host "[1/4] Checking Docker daemon..." -ForegroundColor Yellow
docker info > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker is not running! Please start Docker Desktop and retry."
    exit 1
}
Write-Host " Docker is active." -ForegroundColor Green

# 2. Check Git Branch
Write-Host "[2/4] Checking git branch ($Branch)..." -ForegroundColor Yellow
$currentBranch = (git branch --show-current).Trim()
if ($currentBranch -ne $Branch) {
    Write-Host "Switching from $currentBranch to $Branch..." -ForegroundColor Yellow
    git checkout $Branch
} else {
    Write-Host " Already on branch '$Branch'." -ForegroundColor Green
}

# 3. Ensure SonarQube Server is running (if local)
if ($HostUrl -like "*localhost*" -or $HostUrl -like "*127.0.0.1*") {
    Write-Host "[3/4] Checking local SonarQube server..." -ForegroundColor Yellow
    $containerState = docker inspect -f '{{.State.Running}}' kanban_sonarqube 2>$null
    if ($containerState -ne "true") {
        Write-Host "Starting SonarQube container via docker-compose.sonar.yml..." -ForegroundColor Cyan
        docker compose -f docker-compose.sonar.yml up -d
        Write-Host "Waiting for SonarQube server to initialize (this can take 30-60s on first run)..." -ForegroundColor Yellow
        $ready = $false
        for ($i = 0; $i -lt 30; $i++) {
            Start-Sleep -Seconds 3
            try {
                $status = Invoke-RestMethod -Uri "http://localhost:9000/api/system/status" -TimeoutSec 3 -ErrorAction SilentlyContinue
                if ($status.status -eq "UP") {
                    $ready = $true
                    break
                }
            } catch {
                Write-Host "." -NoNewline
            }
        }
        Write-Host ""
        if (-not $ready) {
            Write-Warning "SonarQube is still booting up. Proceeding to scan attempt..."
        } else {
            Write-Host " SonarQube is UP and ready at http://localhost:9000." -ForegroundColor Green
        }
    } else {
        Write-Host " SonarQube container is already running." -ForegroundColor Green
    }
}

# 4. Prompt for Token if not provided
if (-not $Token) {
    Write-Host "`nSonarQube Token is required." -ForegroundColor Yellow
    Write-Host "If this is your first run, log in at $HostUrl (admin/admin), go to:" -ForegroundColor DarkGray
    Write-Host "  Administration -> Security -> Users -> Tokens (or Project settings)" -ForegroundColor DarkGray
    $Token = Read-Host "Please enter your SonarQube Token"
}

if (-not $Token) {
    Write-Error "Scan aborted: No SonarQube token was provided."
    exit 1
}

# 5. Run the SonarScanner Container
Write-Host "`n[4/4] Executing SonarQube Scanner..." -ForegroundColor Yellow

# Replace localhost with host.docker.internal when scanner container communicates to host
$dockerHostUrl = $HostUrl -replace "localhost", "host.docker.internal" -replace "127.0.0.1", "host.docker.internal"

docker run --rm `
    -e SONAR_HOST_URL="$dockerHostUrl" `
    -e SONAR_TOKEN="$Token" `
    -v "${PWD}:/usr/src" `
    sonarsource/sonar-scanner-cli

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n SonarQube analysis completed successfully!" -ForegroundColor Green
    Write-Host "View results at: $HostUrl/dashboard?id=Kanban-Thunder" -ForegroundColor Cyan
} else {
    Write-Error "`nSonarQube analysis failed. Check the output above for details."
}
