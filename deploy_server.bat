@echo off
setlocal

set REMOTE_USER=dongpark72
set REMOTE_HOST=175.126.187.59
set REMOTE_PATH=/volume1/docker/bible
set PASSWORD=timess9746

echo ========================================================
echo [1/2] Deploying files to %REMOTE_HOST%...
echo ========================================================

:: Create directories
plink -batch -ssh -pw %PASSWORD% %REMOTE_USER%@%REMOTE_HOST% "mkdir -p %REMOTE_PATH%/server %REMOTE_PATH%/js %REMOTE_PATH%/icons %REMOTE_PATH%/data"

:: Upload Server Files (Avoid overwriting db.json if it exists locally, though it shouldn't)
pscp -batch -pw %PASSWORD% server/index.js %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/server/index.js
pscp -batch -pw %PASSWORD% server/package.json %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/server/package.json

:: Upload Frontend Directories
pscp -batch -r -pw %PASSWORD% js %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/
pscp -batch -r -pw %PASSWORD% icons %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/
pscp -batch -r -pw %PASSWORD% data %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/

:: Upload Root Files
pscp -batch -pw %PASSWORD% index.html %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/index.html
pscp -batch -pw %PASSWORD% styles.css %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/styles.css
pscp -batch -pw %PASSWORD% manifest.json %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/manifest.json
pscp -batch -pw %PASSWORD% sw.js %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/sw.js
pscp -batch -pw %PASSWORD% Dockerfile.frontend %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/Dockerfile.frontend
pscp -batch -pw %PASSWORD% Dockerfile.backend %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/Dockerfile.backend
pscp -batch -pw %PASSWORD% docker-compose.yml %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/docker-compose.yml
pscp -batch -pw %PASSWORD% default.conf %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%/default.conf

echo.
echo ========================================================
echo [2/2] Restarting containers on remote server...
echo ========================================================
:: Restart Docker Service
plink -batch -ssh -pw %PASSWORD% %REMOTE_USER%@%REMOTE_HOST% "cd %REMOTE_PATH% && if [ -x /usr/local/bin/docker-compose ]; then DC=/usr/local/bin/docker-compose; else DC=docker-compose; fi; echo %PASSWORD% | sudo -S $DC down; echo %PASSWORD% | sudo -S $DC up --build -d"

echo.
echo [SUCCESS] Deployment and Restart Complete!
