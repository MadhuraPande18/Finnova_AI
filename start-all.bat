@echo off
setlocal
title Smart AI Banking System

echo.
echo ================================================
echo       SMART AI BANKING SYSTEM - STARTING
echo ================================================
echo.
echo Prerequisite: MySQL must be running, and databases
echo created (run create-databases.bat first).
echo MySQL user/password currently configured: root/root
echo Optional: Ollama running locally for the AI chat service.
echo.

echo [1/9] Starting Eureka Service Registry...
start "EUREKA - 8761" cmd /k "cd /d %~dp0service-registry && gradlew.bat bootRun"

echo Waiting 15 seconds for Eureka...
timeout /t 15 /nobreak >nul

echo [2/9] Starting Auth Service...
start "AUTH SERVICE - 8084" cmd /k "cd /d %~dp0auth-service-fixed\auth-service && gradlew.bat bootRun"

echo [3/9] Starting Core Banking Service...
start "CORE BANKING - 8080" cmd /k "cd /d %~dp0core-banking-service && gradlew.bat bootRun"

echo [4/9] Starting User Service...
start "USER SERVICE - 8081" cmd /k "cd /d %~dp0user-service && gradlew.bat bootRun"

echo [5/9] Starting Fund Transfer Service...
start "FUND TRANSFER - 8082" cmd /k "cd /d %~dp0fund-transfer-service && gradlew.bat bootRun"

echo [6/9] Starting Utility Payment Service...
start "UTILITY PAYMENT - 8083" cmd /k "cd /d %~dp0utility-payment-service && gradlew.bat bootRun"

echo Waiting 20 seconds for the core services to fully register with Eureka
echo before starting AI RAG (it depends on core-banking-service being ready)...
timeout /t 20 /nobreak >nul

echo [7/9] Starting AI RAG Service (needs Ollama running locally)...
start "AI RAG - 8086" cmd /k "cd /d %~dp0ai-rag-service\ai-rag-service && gradlew.bat bootRun"

echo Waiting 10 seconds before starting the gateway...
timeout /t 10 /nobreak >nul

echo [8/9] Starting API Gateway...
start "API GATEWAY - 8085" cmd /k "cd /d %~dp0api-gateway && gradlew.bat bootRun"

echo [9/9] Starting Frontend (Vite dev server)...
if not exist "%~dp0smart-bank-frontend\node_modules" (
  echo First run detected - installing frontend dependencies, this can take a minute...
  pushd "%~dp0smart-bank-frontend"
  call npm install
  popd
)
start "FRONTEND - 5173" cmd /k "cd /d %~dp0smart-bank-frontend && npm run dev"

echo.
echo ================================================
echo All services have been launched.
echo Eureka:          http://localhost:8761
echo Auth Service:    http://localhost:8084
echo Core Banking:    http://localhost:8080
echo User Service:    http://localhost:8081
echo Fund Transfer:   http://localhost:8082
echo Utility Payment: http://localhost:8083
echo AI RAG Service:  http://localhost:8086
echo API Gateway:     http://localhost:8085  (frontend calls this)
echo Frontend:        http://localhost:5173  (open this in your browser)
echo ================================================
echo.
echo Keep all opened service windows running.
pause
