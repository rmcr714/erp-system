@echo off
echo ==========================================
echo Starting ERP System Servers
echo ==========================================
echo.
echo NOTE: To stop the servers later, simply close the two new black windows that will appear.
echo.

echo Starting Java Spring Boot Backend...
set "JAVA_HOME="
start "ERP Backend (Java 8080)" cmd /k "cd erp-backend && ..\mvnw.cmd spring-boot:run"

echo Starting React Frontend...
start "ERP Frontend (React 5173)" cmd /k "cd erp-frontend && npm run dev"

echo.
echo Launch commands executed! The applications are now spinning up in their own windows.
echo You may close this launcher window at any time.
echo.
pause
