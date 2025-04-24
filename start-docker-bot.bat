@echo off
echo ===================================================
echo Démarrage du bot Discord Python avec Docker
echo ===================================================
echo.

REM Vérification de Docker
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Docker n'est pas installé ou n'est pas dans le PATH.
    echo Veuillez installer Docker Desktop depuis https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo Construction et démarrage du conteneur...
cd "%~dp0"
docker-compose up -d --build

echo.
echo ===================================================
echo Le bot Discord est maintenant en cours d'exécution!
echo Pour voir les logs: docker-compose logs -f
echo Pour arrêter le bot: docker-compose down
echo ===================================================
pause