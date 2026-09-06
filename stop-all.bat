@echo off
echo Stopping Smart AI Banking System services...
taskkill /FI "WINDOWTITLE eq EUREKA - 8761" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq AUTH SERVICE - 8084" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq AI RAG - 8086" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq CORE BANKING - 8080" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq USER SERVICE - 8081" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq FUND TRANSFER - 8082" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq UTILITY PAYMENT - 8083" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq API GATEWAY - 8085" /T /F >nul 2>&1
echo Done.
pause
