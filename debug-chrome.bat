@echo off
REM Adjust path if Chrome is installed elsewhere
set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"

"%CHROME_PATH%" --remote-debugging-port=9222 --user-data-dir="C:\chrome-debug" http://localhost:3000
