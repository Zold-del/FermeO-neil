FROM python:3.10-slim

WORKDIR /app

# Copier les fichiers de dépendances
COPY python-bot/requirements.txt ./requirements.txt

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste du code
COPY python-bot/ .

# Commande pour exécuter le bot
CMD ["python", "bot.py"]