# La Ferme O'Neil - Système de Commande GTA RP

Ce projet est un système de commande en ligne pour la Ferme O'Neil dans GTA RP, comprenant un site web pour passer commande et un bot Discord pour gérer les commandes.

## Structure du Projet

- **website/** - Site web de la Ferme O'Neil
  - **css/** - Styles CSS du site
  - **js/** - Scripts JavaScript
  - **images/** - Images et ressources graphiques
- **discord-bot/** - Bot Discord pour la gestion des commandes

## Installation et Configuration

### Bot Discord

1. Naviguez vers le dossier du bot Discord
   ```
   cd discord-bot
   ```

2. Installez les dépendances
   ```
   npm install
   ```

3. Configurez le fichier `.env` avec vos identifiants Discord
   - DISCORD_TOKEN - Token de votre bot Discord
   - GUILD_ID - ID de votre serveur Discord
   - CATEGORY_ID - ID de la catégorie pour les commandes
   - NOTIFICATION_CHANNEL_ID - ID du canal pour les notifications

4. Démarrez le bot
   ```
   node index.js
   ```

### Site Web

1. Ouvrez le fichier `website/index.html` dans votre navigateur
2. Le site est prêt à être utilisé pour passer des commandes

## Fonctionnalités

- **Site Web** : Interface utilisateur permettant aux clients de passer commande
- **Bot Discord** : Création automatique d'un canal pour chaque commande
- **Notification** : Alerte dans un canal principal pour chaque nouvelle commande

## Technologies Utilisées

- HTML/CSS/JavaScript pour le site web
- Node.js et Discord.js pour le bot Discord
- Express pour l'API de communication

## Licence

Ce projet est à usage privé pour la Ferme O'Neil dans le cadre de GTA RP.