// Bot Discord pour la Ferme O'Neil - Gestion des commandes
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const express = require('express');

// Afficher les variables d'environnement pour le débogage (à supprimer en production)
console.log('DISCORD_TOKEN présent:', !!process.env.DISCORD_TOKEN);
console.log('GUILD_ID:', process.env.GUILD_ID);
console.log('CATEGORY_ID:', process.env.CATEGORY_ID);
console.log('NOTIFICATION_CHANNEL_ID:', process.env.NOTIFICATION_CHANNEL_ID);

// Configuration du bot Discord avec tous les intents nécessaires
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember]
});

// Stockage des informations sur les commandes
const orderDatabase = new Map();

// Configuration du serveur web pour recevoir les commandes
const app = express();

// Configuration CORS pour permettre les requêtes depuis le site web
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    // Gestion des requêtes OPTIONS (pre-flight)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

app.use(express.json());
const PORT = process.env.PORT || 3001;

// Variables de configuration
const GUILD_ID = process.env.GUILD_ID; // ID du serveur Discord
const CATEGORY_ID = process.env.CATEGORY_ID; // ID de la catégorie pour les commandes
const NOTIFICATION_CHANNEL_ID = process.env.NOTIFICATION_CHANNEL_ID; // ID du canal de notification

// Connexion du bot Discord
client.once(Events.ClientReady, () => {
    console.log(`Bot connecté en tant que ${client.user.tag}!`);
});

// Gestion des erreurs de connexion
client.on('error', (error) => {
    console.error('Erreur du bot Discord:', error);
});

// Interception des interactions avec les boutons - utilisation de Events.InteractionCreate
client.on(Events.InteractionCreate, async interaction => {
    // Afficher des informations de débogage sur l'interaction reçue
    console.log(`Interaction reçue de type: ${interaction.type}`);
    
    if (!interaction.isButton()) {
        console.log('Ce n\'est pas une interaction de bouton');
        return;
    }
    
    console.log(`Bouton cliqué: ${interaction.customId}`);
    
    // Récupération des informations de la commande
    const parts = interaction.customId.split('_');
    const action = parts[0];
    const orderId = parts[1];
    
    console.log(`Action: ${action}, OrderID: ${orderId}`);
    
    // Tentative de récupération depuis la base de données en mémoire
    let orderInfo = orderDatabase.get(orderId);
    
    // Si la commande n'est pas trouvée dans la base de données (après redémarrage du bot),
    // on reconstruit les informations à partir du message Discord
    if (!orderInfo && interaction.message.embeds.length > 0) {
        console.log('Commande non trouvée dans la base de données, reconstruction à partir du message...');
        
        try {
            const embed = interaction.message.embeds[0];
            const title = embed.title || '';
            let name = title.replace('🚜 Commande de ', '').trim();
            
            // Extraction des informations du client
            const clientField = embed.fields.find(f => f.name.includes('Client'));
            let phone = 'Non fourni';
            let discord = 'Non fourni';
            
            if (clientField) {
                const clientLines = clientField.value.split('\n');
                for (const line of clientLines) {
                    if (line.startsWith('Nom:')) name = line.replace('Nom:', '').trim();
                    if (line.startsWith('Téléphone:')) phone = line.replace('Téléphone:', '').trim();
                    if (line.startsWith('Discord:')) discord = line.replace('Discord:', '').trim();
                }
            }
            
            // Extraction des produits
            let productsDescription = '';
            const productsField = embed.fields.find(f => f.name.includes('Produits'));
            if (productsField) {
                productsDescription = productsField.value;
            }
            
            // Extraction du total
            let totalPrice = 0;
            const totalField = embed.fields.find(f => f.name.includes('Total'));
            if (totalField) {
                totalPrice = parseInt(totalField.value) || 0;
            }
            
            // Extraction des commentaires
            let comments = '';
            const commentsField = embed.fields.find(f => f.name.includes('Commentaires'));
            if (commentsField) {
                comments = commentsField.value;
            }
            
            // Reconstruction de l'objet orderInfo
            orderInfo = {
                id: orderId,
                name: name,
                phone: phone,
                discord: discord,
                productsDescription: productsDescription,
                totalPrice: totalPrice,
                comments: comments,
                status: 'pending',
                channelId: interaction.channelId,
                date: new Date(),
                isReconstructed: true
            };
            
            // Sauvegarde dans la base de données
            orderDatabase.set(orderId, orderInfo);
            console.log('Commande reconstruite avec succès:', orderInfo);
        } catch (error) {
            console.error('Erreur lors de la reconstruction des informations de commande:', error);
            return await interaction.reply({ 
                content: '❌ Impossible de traiter cette commande. Le bot a peut-être été redémarré et ne peut pas récupérer toutes les informations nécessaires.',
                ephemeral: true 
            });
        }
    }
    
    if (!orderInfo) {
        console.log(`Commande ${orderId} non trouvée dans la base de données et impossible à reconstruire`);
        return await interaction.reply({ 
            content: '❌ Impossible de trouver cette commande dans la base de données.',
            ephemeral: true 
        });
    }
    
    try {
        switch (action) {
            case 'accept':
                console.log(`Traitement de l'acceptation de la commande ${orderId}`);
                await handleAcceptOrder(interaction, orderInfo);
                break;
            case 'decline':
                console.log(`Traitement du refus de la commande ${orderId}`);
                await handleDeclineOrder(interaction, orderInfo);
                break;
            case 'production':
                console.log(`Passage de la commande ${orderId} en production`);
                await handleProductionStatus(interaction, orderInfo);
                break;
            case 'delivery':
                console.log(`Passage de la commande ${orderId} en livraison`);
                await handleDeliveryStatus(interaction, orderInfo);
                break;
            case 'complete':
                console.log(`Finalisation de la commande ${orderId}`);
                await handleCompleteOrder(interaction, orderInfo);
                break;
            default:
                console.log(`Action inconnue: ${action}`);
                await interaction.reply({ content: '❌ Action non reconnue.', ephemeral: true });
        }
    } catch (error) {
        console.error(`Erreur lors du traitement de l'action ${action} pour la commande ${orderId}:`, error);
        try {
            await interaction.reply({ content: '❌ Une erreur est survenue lors du traitement de cette action.', ephemeral: true });
        } catch (replyError) {
            console.error('Erreur lors de la réponse à l\'interaction:', replyError);
        }
    }
});

// Fonction pour gérer l'acceptation d'une commande
async function handleAcceptOrder(interaction, orderInfo) {
    // Mise à jour du statut de la commande
    orderInfo.status = 'accepted';
    orderDatabase.set(orderInfo.id, orderInfo);
    
    console.log(`Commande ${orderInfo.id} acceptée`);
    
    // Mise à jour de l'embed avec le nouveau statut
    const updatedEmbed = createOrderEmbed(orderInfo)
        .setColor(0x4CAF50) // Vert
        .addFields({ name: '📋 Statut', value: '✅ Commande acceptée', inline: false });
    
    // Création des boutons pour la commande acceptée
    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`production_${orderInfo.id}`)
                .setLabel('🔧 En production')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`delivery_${orderInfo.id}`)
                .setLabel('🚚 En livraison')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`complete_${orderInfo.id}`)
                .setLabel('✓ Commande terminée')
                .setStyle(ButtonStyle.Success)
        );
    
    // Mettre à jour le message original
    await interaction.update({ embeds: [updatedEmbed], components: [buttons] });
    
    // Notifier le client que sa commande a été acceptée
    notifyCustomer(orderInfo, 'accept');
}

// Fonction pour gérer le refus d'une commande
async function handleDeclineOrder(interaction, orderInfo) {
    // Mise à jour du statut de la commande
    orderInfo.status = 'declined';
    orderDatabase.set(orderInfo.id, orderInfo);
    
    console.log(`Commande ${orderInfo.id} refusée`);
    
    // Mise à jour de l'embed avec le nouveau statut
    const updatedEmbed = createOrderEmbed(orderInfo)
        .setColor(0xE74C3C) // Rouge
        .addFields({ name: '📋 Statut', value: '❌ Commande refusée', inline: false });
    
    // Pas de boutons pour une commande refusée
    await interaction.update({ embeds: [updatedEmbed], components: [] });
    
    // Notifier le client que sa commande a été refusée
    notifyCustomer(orderInfo, 'decline');
}

// Fonction pour gérer le statut "En production"
async function handleProductionStatus(interaction, orderInfo) {
    // Mise à jour du statut de la commande
    orderInfo.status = 'production';
    orderDatabase.set(orderInfo.id, orderInfo);
    
    console.log(`Commande ${orderInfo.id} en production`);
    
    // Mise à jour de l'embed avec le nouveau statut
    const updatedEmbed = createOrderEmbed(orderInfo)
        .setColor(0x3498DB) // Bleu
        .addFields({ name: '📋 Statut', value: '🔧 En cours de production', inline: false });
    
    // Conserver les mêmes boutons
    const buttons = interaction.message.components[0];
    
    // Mettre à jour le message original
    await interaction.update({ embeds: [updatedEmbed], components: [buttons] });
    
    // Notifier le client que sa commande est en production
    notifyCustomer(orderInfo, 'production');
}

// Fonction pour gérer le statut "En livraison"
async function handleDeliveryStatus(interaction, orderInfo) {
    // Mise à jour du statut de la commande
    orderInfo.status = 'delivery';
    orderDatabase.set(orderInfo.id, orderInfo);
    
    console.log(`Commande ${orderInfo.id} en livraison`);
    
    // Mise à jour de l'embed avec le nouveau statut
    const updatedEmbed = createOrderEmbed(orderInfo)
        .setColor(0xF39C12) // Orange
        .addFields({ name: '📋 Statut', value: '🚚 En cours de livraison', inline: false });
    
    // Conserver les mêmes boutons
    const buttons = interaction.message.components[0];
    
    // Mettre à jour le message original
    await interaction.update({ embeds: [updatedEmbed], components: [buttons] });
    
    // Notifier le client que sa commande est en livraison
    notifyCustomer(orderInfo, 'delivery');
}

// Fonction pour gérer le statut "Commande terminée"
async function handleCompleteOrder(interaction, orderInfo) {
    // Mise à jour du statut de la commande
    orderInfo.status = 'completed';
    orderDatabase.set(orderInfo.id, orderInfo);
    
    console.log(`Commande ${orderInfo.id} terminée`);
    
    // Mise à jour de l'embed avec le nouveau statut
    const updatedEmbed = createOrderEmbed(orderInfo)
        .setColor(0x9B59B6) // Violet
        .addFields({ name: '📋 Statut', value: '✓ Commande terminée - Merci de votre achat !', inline: false });
    
    // Pas de boutons pour une commande terminée
    await interaction.update({ embeds: [updatedEmbed], components: [] });
    
    // Notifier le client que sa commande est terminée
    notifyCustomer(orderInfo, 'complete');
}

// Fonction pour notifier le client de l'état de sa commande
async function notifyCustomer(orderInfo, status) {
    try {
        // Récupération du serveur
        const guild = client.guilds.cache.get(GUILD_ID);
        if (!guild) {
            console.log('Guild non trouvé');
            return;
        }
        
        // Recherche de l'utilisateur par le tag Discord
        const discordTag = orderInfo.discord;
        if (!discordTag) {
            console.log('Pas de tag Discord fourni');
            return; // Pas de notification si pas de tag Discord
        }
        
        console.log(`Tentative de notification à l'utilisateur Discord: ${discordTag}`);
        
        // Construction du message
        let message;
        
        switch (status) {
            case 'accept':
                message = `🌱 **La Ferme O'Neil** : Bonjour ${orderInfo.name}, votre commande a été acceptée ! Nous la préparons pour vous.`;
                break;
            case 'decline':
                message = `🌱 **La Ferme O'Neil** : Bonjour ${orderInfo.name}, malheureusement votre commande a été refusée. Veuillez nous contacter pour plus d'informations.`;
                break;
            case 'production':
                message = `🌱 **La Ferme O'Neil** : Bonjour ${orderInfo.name}, votre commande est en cours de préparation !`;
                break;
            case 'delivery':
                message = `🌱 **La Ferme O'Neil** : Bonjour ${orderInfo.name}, votre commande est en cours de livraison ! Nous arrivons bientôt.`;
                break;
            case 'complete':
                message = `🌱 **La Ferme O'Neil** : Bonjour ${orderInfo.name}, votre commande est terminée. Merci pour votre achat et à bientôt !`;
                break;
        }
        
        // Tentative d'envoi du message direct
        try {
            // On cherche d'abord le membre
            const members = await guild.members.fetch();
            console.log(`Recherche de l'utilisateur ${discordTag} parmi ${members.size} membres`);
            
            const member = members.find(m => {
                const username = m.user.username.toLowerCase();
                const nickname = m.nickname ? m.nickname.toLowerCase() : '';
                const searchTag = discordTag.toLowerCase();
                
                console.log(`Comparaison avec: ${username} / ${nickname}`);
                
                return username.includes(searchTag) || 
                       searchTag.includes(username) || 
                       (nickname && (nickname.includes(searchTag) || searchTag.includes(nickname)));
            });
            
            if (member) {
                console.log(`Membre trouvé: ${member.user.tag}`);
                await member.send(message);
                console.log(`Message envoyé à ${discordTag}`);
            } else {
                console.log(`Membre non trouvé pour ${discordTag}`);
                // Alternative: envoyer le message dans le canal de commande
                const channel = guild.channels.cache.get(orderInfo.channelId);
                if (channel) {
                    await channel.send(`⚠️ Impossible de notifier le client directement. Message qui aurait été envoyé : ${message}`);
                }
            }
        } catch (dmError) {
            console.error(`Impossible d'envoyer un DM à ${discordTag}:`, dmError);
            
            // Si on ne peut pas envoyer un DM, on envoie une notification dans le canal de la commande
            const channel = guild.channels.cache.get(orderInfo.channelId);
            if (channel) {
                await channel.send(`⚠️ Impossible de notifier le client directement. Message : ${message}`);
            }
        }
    } catch (error) {
        console.error(`Erreur lors de la notification au client pour la commande ${orderInfo.id}:`, error);
    }
}

// Création d'un embed pour une commande
function createOrderEmbed(orderInfo) {
    const embed = new EmbedBuilder()
        .setTitle(`🚜 Commande de ${orderInfo.name}`)
        .setColor(0x4CAF50) // Vert par défaut
        .addFields(
            { name: '👤 Client', value: `Nom: ${orderInfo.name}\nTéléphone: ${orderInfo.phone || 'Non fourni'}\nDiscord: ${orderInfo.discord || 'Non fourni'}`, inline: false },
            { name: '🧾 Produits Commandés', value: orderInfo.productsDescription || 'Aucun produit sélectionné', inline: false },
            { name: '💰 Total', value: `${orderInfo.totalPrice}$`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'La Ferme O\'Neil - GTA RP' });
    
    // Ajouter les commentaires si présents
    if (orderInfo.comments && orderInfo.comments.trim() !== '') {
        embed.addFields({ name: '📝 Commentaires', value: orderInfo.comments, inline: false });
    }
    
    return embed;
}

// Démarrage du serveur web
app.listen(PORT, () => {
    console.log(`Serveur d'API en écoute sur le port ${PORT}`);
});

// Connexion du bot avec le token
console.log('Tentative de connexion du bot...');
client.login(process.env.DISCORD_TOKEN).catch(error => {
    console.error('Erreur lors de la connexion du bot:', error.message);
});

// Gestionnaire de routes pour les commandes
app.post('/api/commande', async (req, res) => {
    try {
        console.log('Nouvelle commande reçue:', JSON.stringify(req.body, null, 2));
        
        const orderData = req.body;
        
        if (!orderData || !orderData.name || !orderData.products || Object.keys(orderData.products).length === 0) {
            console.log('Données de commande invalides');
            return res.status(400).json({ error: 'Données de commande invalides.' });
        }
        
        // Vérification de l'ID Discord
        if (!orderData.discord) {
            console.log('ID Discord manquant');
            return res.status(400).json({ error: 'Un ID Discord est nécessaire pour passer une commande.' });
        }
        
        // Récupération du serveur
        const guild = client.guilds.cache.get(GUILD_ID);
        if (!guild) {
            console.log('Guild non trouvé avec ID:', GUILD_ID);
            return res.status(500).json({ error: 'Serveur Discord non trouvé.' });
        }
        
        // Formatage des produits commandés pour l'affichage
        let productsDescription = '';
        let totalPrice = 0;
        
        for (const [productName, quantity] of Object.entries(orderData.products)) {
            const productPrice = getProductPrice(productName);
            const productTotal = quantity * productPrice;
            totalPrice += productTotal;
            
            productsDescription += `**${formatProductName(productName)}**: ${quantity} × ${productPrice}$ = ${productTotal}$\n`;
        }
        
        // Créer un ID unique pour la commande
        const orderId = `order_${Date.now()}`;
        
        console.log(`ID de commande généré: ${orderId}`);
        
        // Stocker les informations de la commande dans notre base de données
        const orderInfo = {
            id: orderId,
            name: orderData.name,
            phone: orderData.phone || 'Non fourni',
            discord: orderData.discord || 'Non fourni',
            products: orderData.products,
            productsDescription: productsDescription,
            totalPrice: totalPrice,
            comments: orderData.comments,
            status: 'pending',
            date: new Date()
        };
        
        orderDatabase.set(orderId, orderInfo);
        console.log(`Commande ${orderId} enregistrée dans la base de données`);
        
        // Envoi d'un message privé à l'utilisateur Discord
        try {
            // On cherche d'abord le membre
            const members = await guild.members.fetch();
            console.log(`Recherche de l'utilisateur ${orderData.discord} parmi ${members.size} membres`);
            
            const member = members.find(m => {
                const username = m.user.username.toLowerCase();
                const nickname = m.nickname ? m.nickname.toLowerCase() : '';
                const searchTag = orderData.discord.toLowerCase();
                
                return username.includes(searchTag) || 
                       searchTag.includes(username) || 
                       (nickname && (nickname.includes(searchTag) || searchTag.includes(nickname)));
            });
            
            if (member) {
                console.log(`Membre trouvé: ${member.user.tag}`);
                
                // Création de l'embed avec les détails de la commande pour le message privé
                const embed = new EmbedBuilder()
                    .setTitle(`🚜 Votre commande à la Ferme O'Neil`)
                    .setColor(0x4CAF50) // Vert
                    .addFields(
                        { name: '👤 Vos informations', value: `Nom: ${orderInfo.name}\nTéléphone: ${orderInfo.phone || 'Non fourni'}\nDiscord: ${orderInfo.discord}`, inline: false },
                        { name: '🧾 Produits Commandés', value: productsDescription, inline: false },
                        { name: '💰 Total', value: `${totalPrice}$`, inline: true },
                        { name: '📋 Statut', value: `🕒 En attente de validation`, inline: false }
                    )
                    .setTimestamp()
                    .setFooter({ text: 'La Ferme O\'Neil - GTA RP' });
                
                // Ajouter les commentaires si présents
                if (orderInfo.comments && orderInfo.comments.trim() !== '') {
                    embed.addFields({ name: '📝 Commentaires', value: orderInfo.comments, inline: false });
                }
                
                // Envoyer le message privé avec l'embed
                await member.send({ content: `🌱 **La Ferme O'Neil** : Bonjour ${orderInfo.name}, votre commande a été reçue ! Nous la traiterons dans les plus brefs délais.`, embeds: [embed] });
                console.log(`Message privé envoyé à ${orderData.discord}`);
                
                // Notification dans le canal principal pour les administrateurs
                const notificationChannel = guild.channels.cache.get(NOTIFICATION_CHANNEL_ID);
                if (notificationChannel) {
                    // Créer un embed pour la notification d'admin
                    const adminEmbed = createOrderEmbed(orderInfo);
                    
                    // Création des boutons pour accepter ou refuser la commande
                    const buttons = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(`accept_${orderId}`)
                                .setLabel('✅ Accepter')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId(`decline_${orderId}`)
                                .setLabel('❌ Refuser')
                                .setStyle(ButtonStyle.Danger)
                        );
                        
                    await notificationChannel.send({ 
                        content: `📢 Nouvelle commande reçue de **${orderData.name}** (${orderData.discord})!`, 
                        embeds: [adminEmbed], 
                        components: [buttons] 
                    });
                    console.log('Notification envoyée dans le canal principal');
                } else {
                    console.log('Canal de notification non trouvé avec ID:', NOTIFICATION_CHANNEL_ID);
                }
                
                return res.status(200).json({ 
                    success: true, 
                    message: 'Commande reçue et message privé envoyé avec succès.',
                    orderId: orderId
                });
            } else {
                console.log(`Membre non trouvé pour ${orderData.discord}`);
                return res.status(404).json({ 
                    error: 'Utilisateur Discord non trouvé. Veuillez vérifier l\'ID Discord fourni.'
                });
            }
        } catch (dmError) {
            console.error(`Impossible d'envoyer un DM à ${orderData.discord}:`, dmError);
            return res.status(500).json({ 
                error: 'Impossible d\'envoyer un message privé à l\'utilisateur Discord. Veuillez vérifier l\'ID Discord.'
            });
        }
    } catch (error) {
        console.error('Erreur lors du traitement de la commande:', error);
        return res.status(500).json({ 
            error: 'Une erreur est survenue lors du traitement de la commande.' 
        });
    }
});

// Fonction pour formater les noms des produits
function formatProductName(productName) {
    const nameMap = {
        'salades': 'Salades',
        'tomates': 'Tomates',
        'oignons': 'Oignons',
        'carottes': 'Carottes',
        'fraises': 'Fraises',
        'lait': 'Lait',
        'courges': 'Courges',
        'ble': 'Blé',
        'bananes': 'Bananes',
        'agaves': 'Agaves',
        'pommes': 'Pommes de terres',
        'oeufs': 'Œufs',
        'fertilisants': 'Fertilisants'
    };
    
    return nameMap[productName] || productName;
}

// Fonction pour obtenir le prix des produits
function getProductPrice(productName) {
    const prices = {
        'salades': 5,
        'tomates': 5,
        'oignons': 5,
        'carottes': 5,
        'fraises': 8,
        'lait': 7,
        'courges': 8,
        'ble': 6,
        'bananes': 7,
        'agaves': 7,
        'pommes': 6,
        'oeufs': 7,
        'fertilisants': 250
    };
    
    return prices[productName] || 0;
}