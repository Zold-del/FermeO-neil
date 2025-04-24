import os
import discord
from discord.ext import commands
from dotenv import load_dotenv

# Chargement des variables d'environnement
load_dotenv()

# Configuration du bot
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_ready():
    print(f'Bot connecté en tant que {bot.user.name}')
    print(f'ID: {bot.user.id}')
    print('---')
    
    # Définition du statut du bot
    await bot.change_presence(activity=discord.Game(name="Ferme O'Neil"))

@bot.command()
async def bonjour(ctx):
    """Commande simple qui répond avec un message de bienvenue"""
    await ctx.send("Bonjour! Je suis le bot de la Ferme O'Neil!")

@bot.command()
async def info(ctx):
    """Affiche des informations sur la Ferme O'Neil"""
    embed = discord.Embed(
        title="Ferme O'Neil",
        description="Bienvenue à la Ferme O'Neil, votre destination pour des produits frais et locaux!",
        color=discord.Color.green()
    )
    embed.add_field(name="Horaires", value="Lundi-Vendredi: 9h-18h\nSamedi: 9h-16h\nDimanche: Fermé", inline=False)
    embed.add_field(name="Adresse", value="123 Chemin de la Ferme, 75000 Paris", inline=False)
    embed.add_field(name="Contact", value="Tel: 01 23 45 67 89\nEmail: contact@fermeoneil.fr", inline=False)
    embed.set_footer(text="Ferme O'Neil - Des produits frais et locaux depuis 2005")
    
    await ctx.send(embed=embed)

@bot.command()
async def produits(ctx):
    """Affiche les produits disponibles à la ferme"""
    embed = discord.Embed(
        title="Nos produits",
        description="Voici les produits actuellement disponibles à la Ferme O'Neil",
        color=discord.Color.green()
    )
    embed.add_field(name="Fruits", value="🍎 Pommes\n🍐 Poires\n🍓 Fraises\n🫐 Myrtilles", inline=True)
    embed.add_field(name="Légumes", value="🥕 Carottes\n🥔 Pommes de terre\n🍅 Tomates\n🥬 Salades", inline=True)
    embed.add_field(name="Produits laitiers", value="🧀 Fromages\n🥛 Lait\n🧈 Beurre\n🍦 Yaourts", inline=True)
    
    await ctx.send(embed=embed)

# Lancement du bot avec le token depuis .env
bot.run(os.getenv('TOKEN'))