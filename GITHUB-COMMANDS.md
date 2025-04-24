# Guide des commandes GitHub pour la Ferme O'Neil

Ce document contient toutes les commandes Git et GitHub nécessaires pour gérer le projet de la Ferme O'Neil, incluant le déploiement du bot Discord et la mise à jour du site web.

## Configuration initiale

### Cloner le dépôt
```bash
git clone https://github.com/username/ferme-oneil.git
cd ferme-oneil
```

### Configurer Git
```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre-email@example.com"
```

## Commandes quotidiennes

### Voir l'état des fichiers
```bash
git status
```

### Mettre à jour le dépôt local
```bash
git pull origin main
```

### Ajouter des modifications
```bash
# Ajouter tous les fichiers modifiés
git add .

# Ajouter des fichiers spécifiques
git add python-bot/bot.py website/index.html
```

### Créer un commit
```bash
git commit -m "Description des changements"
```

### Envoyer les modifications sur GitHub
```bash
git push origin main
```

## Gestion des branches

### Créer une nouvelle branche
```bash
git checkout -b nom-de-la-branche
```

### Changer de branche
```bash
git checkout nom-de-la-branche
```

### Fusionner une branche
```bash
git checkout main
git merge nom-de-la-branche
```

### Supprimer une branche
```bash
# Branche locale
git branch -d nom-de-la-branche

# Branche distante
git push origin --delete nom-de-la-branche
```

## Déploiement du bot Discord

### Mettre à jour le bot Python
```bash
# Ajouter les modifications
git add python-bot/

# Créer un commit
git commit -m "Mise à jour du bot Python"

# Envoyer sur GitHub
git push origin main
```

### Lancer le bot via GitHub Actions
1. Accédez à votre dépôt GitHub
2. Cliquez sur l'onglet "Actions"
3. Sélectionnez le workflow "Run Discord Bot"
4. Cliquez sur "Run workflow"
5. Sélectionnez:
   - Branch: main
   - Environment: production
   - Bot type: python
6. Cliquez sur "Run workflow"

## Mise à jour du site web

### Mettre à jour le site web
```bash
# Ajouter les modifications
git add website/

# Créer un commit
git commit -m "Mise à jour du site web"

# Envoyer sur GitHub
git push origin main
```

## Gestion de GitHub Actions

### Configurer les secrets GitHub
1. Accédez à votre dépôt GitHub
2. Cliquez sur "Settings" (Paramètres)
3. Dans le menu de gauche, cliquez sur "Secrets and variables" puis "Actions"
4. Cliquez sur "New repository secret"
5. Ajoutez les secrets nécessaires:
   - DISCORD_BOT_TOKEN: Token du bot Discord
   - SSH_HOST: Adresse du serveur SSH
   - SSH_USERNAME: Nom d'utilisateur SSH
   - SSH_PRIVATE_KEY: Clé privée SSH

### Voir les logs d'exécution des workflows
1. Accédez à votre dépôt GitHub
2. Cliquez sur l'onglet "Actions"
3. Sélectionnez un workflow récent
4. Cliquez sur un job pour voir les détails et les logs

## Commandes avancées

### Annuler le dernier commit (avant push)
```bash
git reset --soft HEAD~1
```

### Voir l'historique des commits
```bash
git log
```

### Créer une version (tag)
```bash
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0
```

### Résoudre les conflits de fusion
```bash
git pull
# Résoudre les conflits dans les fichiers
git add .
git commit -m "Résolution des conflits"
git push
```

## Cas d'usage courants

### Déployer une nouvelle fonctionnalité du bot
```bash
# Créer une branche pour la fonctionnalité
git checkout -b nouvelle-commande-bot

# Modifier les fichiers
# ...

# Ajouter, committer et pousser
git add python-bot/
git commit -m "Ajout d'une nouvelle commande"
git push origin nouvelle-commande-bot

# Créer une Pull Request sur GitHub
# Après validation, fusionner sur main
git checkout main
git pull origin main
```

### Mettre à jour le site avec de nouvelles images
```bash
# Ajouter les nouvelles images
git add website/images/
git commit -m "Ajout de nouvelles images"
git push origin main
```