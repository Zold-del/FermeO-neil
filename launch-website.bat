@echo off
echo ===================================================
echo Lancement du site web de la Ferme O'Neil
echo ===================================================
echo.

REM Vérification de Python pour le serveur HTTP simple
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python n'est pas installé ou n'est pas dans le PATH.
    echo Utilisation du navigateur par défaut pour ouvrir le fichier HTML directement.
    start "" "website\index.html"
) else (
    echo Lancement du serveur HTTP Python...
    echo.
    echo Le site web sera accessible à l'adresse: http://localhost:8000
    echo.
    echo Pour arrêter le serveur, appuyez sur Ctrl+C dans cette fenêtre
    echo ===================================================
    cd website
    python -m http.server 8000
)