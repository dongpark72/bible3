@echo off
setlocal

:: Server Information
set REMOTE_USER=dongpark72
set REMOTE_HOST=175.126.187.59
set REMOTE_PATH=/volume1/docker/bible

if "%~1"=="" (
    echo Usage: deploy.bat [File or Directory]
    exit /b 1
)

echo Deploying %~1 to %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%...

:: Using -O flag for legacy SCP protocol (essential for this NAS)
scp -O -o StrictHostKeyChecking=no -r "%~1" %REMOTE_USER%@%REMOTE_HOST%:%REMOTE_PATH%

if %errorlevel% equ 0 (
    echo Deployment successful.
) else (
    echo Deployment failed.
)

pause
