# La Ferme O'Neil - Système de Commande pour GTA RP

Un système de commande complet pour la Ferme O'Neil dans GTA RP, permettant aux joueurs de commander des produits agricoles et de recevoir des notifications via Discord.

![Ferme O'Neil](website/images/background/farm-background.jpg)

## Fonctionnalités

- 🌱 Interface web responsive pour passer des commandes
- 🤖 Bot Discord intégré pour traiter les commandes
- 📱 Notifications en temps réel via messages privés Discord
- 📊 Système de gestion des commandes pour les administrateurs
- 🔄 Suivi d'état des commandes (acceptée, en production, en livraison, terminée)

## Structure du Projet

- `website/` - Le site web de commande
- `discord-bot/` - Le bot Discord pour gérer les commandes

## Installation et Configuration

### Prérequis
- Node.js (v14 ou supérieur)
- Un compte Discord et un bot configuré

### Configuration du Bot Discord

1. Créez un fichier `.env` dans le dossier `discord-bot/` avec les informations suivantes:
```
DISCORD_TOKEN=votre_token_discord
GUILD_ID=id_de_votre_serveur
NOTIFICATION_CHANNEL_ID=id_du_canal_de_notification
```

2. Installez les dépendances:
```bash
cd discord-bot
npm install
```

3. Démarrez le bot:
```bash
node index.js
```
Ou utilisez le script fourni `start-bot.bat`.

### Démarrage du Site Web

Ouvrez le fichier `website/index.html` dans votre navigateur ou utilisez le script `open-website.bat`.

## Utilisation

1. Les joueurs remplissent le formulaire de commande sur le site web
2. Ils fournissent leur ID Discord pour recevoir des notifications
3. Une fois la commande envoyée, le joueur reçoit un message privé sur Discord avec le récapitulatif
4. Les administrateurs peuvent gérer les commandes depuis le canal de notification Discord
5. À chaque changement d'état, le joueur est notifié automatiquement

## Sécurité

- Ne partagez jamais votre token Discord. Il est stocké dans un fichier `.env` qui est ignoré par Git.
- Assurez-vous que seuls les administrateurs ont accès au canal de notification.

## Licence

© 2025 La Ferme O'Neil - Tous droits réservés

---

*Développé pour améliorer l'expérience RP sur votre serveur GTA*