@echo off
echo ===================================================
echo Déploiement du Bot Discord Python de la Ferme O'Neil
echo ===================================================
echo.

REM Vérification de Python
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Python n'est pas installé ou n'est pas dans le PATH.
    echo Veuillez installer Python depuis https://www.python.org/downloads/
    echo Assurez-vous de cocher l'option "Add Python to PATH" pendant l'installation.
    pause
    exit /b 1
)

REM Création du dossier pour le bot Python s'il n'existe pas
if not exist "python-bot" (
    echo Création du dossier python-bot...
    mkdir python-bot
)

REM Création ou vérification de l'environnement virtuel
cd python-bot
if not exist "venv" (
    echo Création d'un environnement virtuel Python...
    python -m venv venv
)

REM Activation de l'environnement virtuel et installation des dépendances
echo Activation de l'environnement virtuel et installation des dépendances...
call venv\Scripts\activate.bat
pip install -U discord.py python-dotenv

REM Création du fichier .env s'il n'existe pas
if not exist ".env" (
    echo Création du fichier de configuration .env...
    echo # Configuration du bot Discord > .env
    echo # Remplacez votre_token_ici par le token de votre bot >> .env
    echo TOKEN=votre_token_ici >> .env
)

REM Création du fichier bot.py s'il n'existe pas
if not exist "bot.py" (
    echo Création du fichier principal bot.py...
    echo import os >> bot.py
    echo import discord >> bot.py
    echo from discord.ext import commands >> bot.py
    echo from dotenv import load_dotenv >> bot.py
    echo. >> bot.py
    echo # Chargement des variables d'environnement >> bot.py
    echo load_dotenv() >> bot.py
    echo. >> bot.py
    echo # Configuration du bot >> bot.py
    echo intents = discord.Intents.default() >> bot.py
    echo intents.message_content = True >> bot.py
    echo bot = commands.Bot(command_prefix='!', intents=intents) >> bot.py
    echo. >> bot.py
    echo @bot.event >> bot.py
    echo async def on_ready(): >> bot.py
    echo     print(f'Bot connecté en tant que {bot.user.name}') >> bot.py
    echo     print('---') >> bot.py
    echo. >> bot.py
    echo @bot.command() >> bot.py
    echo async def bonjour(ctx): >> bot.py
    echo     """Commande simple qui répond avec un message de bienvenue""" >> bot.py
    echo     await ctx.send('Bonjour! Je suis le bot de la Ferme O\'Neil!') >> bot.py
    echo. >> bot.py
    echo # Lancement du bot avec le token depuis .env >> bot.py
    echo bot.run(os.getenv('TOKEN')) >> bot.py
)

REM Création du fichier start-python-bot.bat
cd ..
echo Création du script de démarrage...
echo @echo off > start-python-bot.bat
echo echo Démarrage du bot Discord Python de la Ferme O'Neil... >> start-python-bot.bat
echo cd "%~dp0python-bot" >> start-python-bot.bat
echo call venv\Scripts\activate.bat >> start-python-bot.bat
echo python bot.py >> start-python-bot.bat
echo pause >> start-python-bot.bat

echo.
echo ===================================================
echo Déploiement terminé!
echo.
echo Pour configurer votre bot:
echo 1. Modifiez le fichier python-bot\.env avec votre token Discord
echo 2. Personnalisez votre bot dans python-bot\bot.py
echo.
echo Pour démarrer votre bot, utilisez le fichier start-python-bot.bat
echo ===================================================
pause