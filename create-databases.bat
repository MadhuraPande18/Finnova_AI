@echo off
echo Creating Smart AI Banking databases...
echo This uses MySQL user root and will ask for the password.
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS core_banking; CREATE DATABASE IF NOT EXISTS user_service; CREATE DATABASE IF NOT EXISTS fund_transfer; CREATE DATABASE IF NOT EXISTS utility_payment; CREATE DATABASE IF NOT EXISTS auth_service;"
if errorlevel 1 (
  echo.
  echo Could not run mysql. Make sure MySQL client is installed and 'mysql' is in PATH.
  pause
  exit /b 1
)
echo Databases are ready.
pause
