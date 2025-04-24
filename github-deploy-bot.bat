@echo off
echo ===================================================
echo Mise à jour du code sur GitHub et lancement du bot
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

echo Configuration Git...
cd "%~dp0"

REM Vérification si le dépôt Git est déjà initialisé
if not exist ".git" (
    echo Initialisation du dépôt Git...
    git init
    
    echo Création du fichier .gitignore...
    echo .env > .gitignore
    echo *.log >> .gitignore
    echo node_modules/ >> .gitignore
    echo __pycache__/ >> .gitignore
    echo venv/ >> .gitignore
    echo sensitive-data.txt >> .gitignore
    
    echo Ajout d'un dépôt distant...
    SET /P REPO_URL="Entrez l'URL de votre dépôt GitHub (par exemple https://github.com/username/repo.git): "
    git remote add origin %REPO_URL%
)

echo.
echo Ajout des fichiers modifiés...
git add .
git add -f python-bot/requirements.txt
git add -f python-bot/bot.py

echo.
SET /P COMMIT_MSG="Entrez un message de commit (par défaut: 'Mise à jour du bot Discord'): "
if "%COMMIT_MSG%"=="" SET COMMIT_MSG=Mise à jour du bot Discord

echo.
echo Commit des changements...
git commit -m "%COMMIT_MSG%"

echo.
echo Quelle branche souhaitez-vous utiliser?
echo 1. main
echo 2. master
echo 3. autre
SET /P BRANCH_CHOICE="Entrez votre choix (1-3): "

if "%BRANCH_CHOICE%"=="1" (
    SET BRANCH=main
) else if "%BRANCH_CHOICE%"=="2" (
    SET BRANCH=master
) else (
    SET /P BRANCH="Entrez le nom de la branche: "
)

echo.
echo Vérification de l'existence de la branche %BRANCH%...
git show-ref --verify --quiet refs/heads/%BRANCH%
if %ERRORLEVEL% NEQ 0 (
    echo Création de la branche %BRANCH%...
    git branch %BRANCH%
)

echo.
echo Passage à la branche %BRANCH%...
git checkout %BRANCH%

echo.
echo Push des changements vers GitHub...
git push -u origin %BRANCH%

echo.
echo ===================================================
echo Code mis à jour sur GitHub avec succès!
echo.
echo Pour lancer le bot via GitHub Actions:
echo 1. Allez sur votre dépôt GitHub
echo 2. Cliquez sur l'onglet "Actions"
echo 3. Sélectionnez le workflow "Run Discord Bot"
echo 4. Cliquez sur "Run workflow"
echo 5. Choisissez la branche et le type de bot, puis cliquez sur "Run workflow"
echo ===================================================
echo.
echo Notez que vous devez configurer le secret DISCORD_BOT_TOKEN dans les paramètres
echo de votre dépôt GitHub pour que le bot fonctionne correctement.
echo.
echo Pour configurer ce secret:
echo 1. Allez sur votre dépôt GitHub
echo 2. Cliquez sur "Settings" (Paramètres)
echo 3. Dans le menu de gauche, cliquez sur "Secrets and variables" puis "Actions"
echo 4. Cliquez sur "New repository secret"
echo 5. Nom: DISCORD_BOT_TOKEN
echo 6. Valeur: [Votre token Discord]
echo 7. Cliquez sur "Add secret"
echo ===================================================
pause