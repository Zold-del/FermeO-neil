@echo off
echo ===================================================
echo Lancement du site et du bot Discord de la Ferme O'Neil
echo ===================================================
echo.

REM Vérification de Git
git --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Git n'est pas installé ou n'est pas dans le PATH.
    echo Veuillez installer Git depuis https://git-scm.com/downloads
    pause
    exit /b 1
)

echo Configuration du dépôt Git avec protection des données sensibles...
cd "%~dp0"

REM Vérification du fichier .gitignore
if not exist .gitignore (
    echo Création du fichier .gitignore...
    echo # Fichiers d'environnement contenant des données sensibles > .gitignore
    echo .env >> .gitignore
    echo */.env >> .gitignore
    echo sensitive-data.txt >> .gitignore
    echo. >> .gitignore
    echo # Dossiers node_modules >> .gitignore
    echo node_modules/ >> .gitignore
    echo. >> .gitignore
    echo # Fichiers de log >> .gitignore
    echo *.log >> .gitignore
    echo. >> .gitignore
    echo # Fichiers système >> .gitignore
    echo .DS_Store >> .gitignore
    echo Thumbs.db >> .gitignore
    echo. >> .gitignore
    echo # Dossiers de dépendances >> .gitignore
    echo __pycache__/ >> .gitignore
    echo *.py[cod] >> .gitignore
    echo *$py.class >> .gitignore
)

REM Vérification si le dépôt Git est déjà initialisé
if not exist .git (
    echo Initialisation du dépôt Git...
    git init
)

REM Ajout du dépôt distant s'il n'existe pas déjà
git remote -v | find "origin" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    git remote add origin https://github.com/Zold-del/FermeO-neil.git
    echo Dépôt distant ajouté: https://github.com/Zold-del/FermeO-neil.git
)

REM Vérification du modèle .env.example
if not exist discord-bot\.env.example (
    echo Création du modèle .env.example...
    echo # Configuration du bot Discord pour la Ferme O'Neil > discord-bot\.env.example
    echo # Token de votre bot Discord (à remplacer par votre token) >> discord-bot\.env.example
    echo DISCORD_TOKEN=votre_token_ici >> discord-bot\.env.example
    echo. >> discord-bot\.env.example
    echo # ID du serveur Discord >> discord-bot\.env.example
    echo GUILD_ID=votre_guild_id >> discord-bot\.env.example
    echo. >> discord-bot\.env.example
    echo # ID de la catégorie pour les canaux de commande >> discord-bot\.env.example
    echo CATEGORY_ID=votre_category_id >> discord-bot\.env.example
    echo. >> discord-bot\.env.example
    echo # ID du canal pour les notifications de nouvelles commandes >> discord-bot\.env.example
    echo NOTIFICATION_CHANNEL_ID=votre_notification_channel_id >> discord-bot\.env.example
    echo. >> discord-bot\.env.example
    echo # Port du serveur web >> discord-bot\.env.example
    echo PORT=3001 >> discord-bot\.env.example
)

REM Ajout de tous les fichiers sauf ceux exclus par .gitignore
echo.
echo Ajout des fichiers au dépôt (les fichiers sensibles sont exclus par .gitignore)...
git add .

REM Commit des changements
echo.
SET /P COMMIT_MSG="Entrez un message de commit (par défaut: 'Mise à jour du projet Ferme O'Neil'): "
if "%COMMIT_MSG%"=="" SET COMMIT_MSG=Mise à jour du projet Ferme O'Neil

echo.
echo Commit des changements...
git commit -m "%COMMIT_MSG%"

REM Création de la branche main si nécessaire
git show-ref --verify --quiet refs/heads/main
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Création et passage à la branche main...
    git branch -M main
)

REM Push vers GitHub
echo.
echo Push des changements vers GitHub...
git push -u origin main

echo.
echo ===================================================
echo Lancement du site web de la Ferme O'Neil...
echo ===================================================

start cmd /k "cd %~dp0website && python -m http.server 8000"
echo Le site web est accessible à l'adresse: http://localhost:8000

echo.
echo ===================================================
echo Lancement du bot Discord de la Ferme O'Neil...
echo ===================================================

start cmd /k "cd %~dp0discord-bot && node index.js"

echo.
echo ===================================================
echo Site web et bot Discord lancés avec succès!
echo Ne fermez pas les fenêtres du terminal pour maintenir les services en cours d'exécution.
echo ===================================================
echo.