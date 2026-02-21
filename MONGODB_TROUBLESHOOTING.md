# 🔧 Dépannage MongoDB - Erreur 503

## Problème

Erreur `503 - Service temporairement indisponible. Connexion à la base de données en cours...`

## Causes possibles

### 1. ✅ Whitelist IP MongoDB Atlas

**IMPORTANT** : MongoDB Atlas bloque les connexions par défaut. Vous devez autoriser Vercel.

**Solution :**
1. Aller sur https://cloud.mongodb.com
2. Sélectionner votre cluster
3. Aller dans "Network Access" (ou "IP Access List")
4. Cliquer sur "Add IP Address"
5. Cliquer sur "Allow Access from Anywhere" (0.0.0.0/0) OU ajouter les IPs Vercel
6. Sauvegarder

**Note** : Pour la sécurité, vous pouvez aussi ajouter uniquement les IPs Vercel, mais "Allow Access from Anywhere" est plus simple pour commencer.

### 2. ✅ Variables d'environnement MongoDB

Vérifier que la connexion string est correcte dans `models/connection.js` ou utiliser une variable d'environnement :

**Sur Vercel :**
1. Aller dans Settings → Environment Variables
2. Ajouter `MONGODB_URI` avec votre connection string complète
3. Redéployer

### 3. ✅ Timeout de connexion

Sur Vercel (serverless), les connexions peuvent être plus lentes. Le code a été optimisé avec :
- `serverSelectionTimeoutMS: 10000` (10 secondes)
- Gestion des reconnexions automatiques
- Logs détaillés pour diagnostiquer

### 4. ✅ Vérifier les logs Vercel

Pour voir exactement ce qui se passe :
1. Aller sur Vercel → Votre projet backend
2. Deployments → Dernier déploiement
3. Function Logs
4. Chercher les messages :
   - `✅ MongoDB connecté avec succès`
   - `❌ Erreur de connexion à MongoDB`
   - `🔍 État de connexion MongoDB`

## Test rapide

1. Vérifier la whitelist IP sur MongoDB Atlas (le plus important !)
2. Redéployer le backend sur Vercel
3. Faire une réservation de test
4. Vérifier les logs Vercel pour voir l'erreur exacte

## Solution alternative : Utiliser une variable d'environnement

Si vous préférez ne pas hardcoder la connection string :

1. Dans MongoDB Atlas → Database → Connect → Drivers
2. Copier la connection string
3. Sur Vercel → Environment Variables → Ajouter `MONGODB_URI`
4. Le code utilisera automatiquement cette variable si elle existe
