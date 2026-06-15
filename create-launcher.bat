@echo off
setlocal
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0create-launcher.ps1" %*
if errorlevel 1 goto failed
goto end

:failed
echo [ERROR] Failed to create launcher shortcut.
pause

:end
endlocal
