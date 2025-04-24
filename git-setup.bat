@echo off
echo ===================================================
echo Configuration Git pour la Ferme O'Neil
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

echo Configuration du dépôt Git...
cd "%~dp0"

REM Vérification si le dépôt Git est déjà initialisé
if exist .git (
    echo Le dépôt Git existe déjà.
) else (
    echo Initialisation du dépôt Git...
    git init
    
    echo Création du fichier .gitignore...
    echo .env > .gitignore
    echo *.log >> .gitignore
    echo node_modules/ >> .gitignore
    echo __pycache__/ >> .gitignore
    echo venv/ >> .gitignore
    echo sensitive-data.txt >> .gitignore
)

REM Ajout du dépôt distant
echo Ajout du dépôt distant...
git remote -v | find "origin" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    git remote add origin https://github.com/Zold-del/FermeO-neil.git
    echo Dépôt distant ajouté: https://github.com/Zold-del/FermeO-neil.git
) else (
    echo Le dépôt distant existe déjà, mise à jour...
    git remote set-url origin https://github.com/Zold-del/FermeO-neil.git
    echo Dépôt distant mis à jour: https://github.com/Zold-del/FermeO-neil.git
)

REM Ajout des fichiers
echo.
echo Ajout des fichiers au dépôt...
git add .
git add -f python-bot/requirements.txt
git add -f python-bot/bot.py
git add -f discord-bot/index.js
git add -f discord-bot/package.json

REM Commit des changements
echo.
SET /P COMMIT_MSG="Entrez un message de commit (par défaut: 'Initialisation du projet Ferme O'Neil'): "
if "%COMMIT_MSG%"=="" SET COMMIT_MSG=Initialisation du projet Ferme O'Neil

echo.
echo Commit des changements...
git commit -m "%COMMIT_MSG%"

REM Création de la branche main
echo.
echo Création et passage à la branche main...
git branch -M main

REM Push vers GitHub
echo.
echo Push des changements vers GitHub...
git push -u origin main

echo.
echo ===================================================
echo Configuration Git terminée avec succès!
echo.
echo Votre code est maintenant disponible sur:
echo https://github.com/Zold-del/FermeO-neil.git
echo ===================================================
pause