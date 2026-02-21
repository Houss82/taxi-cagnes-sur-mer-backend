# 🔴 URGENT : Vérifier MongoDB Atlas Whitelist IP

## Le problème

Vous avez toujours l'erreur **503 - Service temporairement indisponible** car MongoDB Atlas **bloque les connexions depuis Vercel**.

## ✅ Solution IMMÉDIATE (5 minutes)

### Étape 1 : Aller sur MongoDB Atlas

1. Ouvrir https://cloud.mongodb.com
2. Se connecter avec votre compte
3. Sélectionner votre cluster (probablement "Cluster0")

### Étape 2 : Configurer Network Access (Whitelist IP)

1. Dans le menu de gauche, cliquer sur **"Network Access"** (ou "IP Access List")
2. Vous verrez probablement une liste vide ou avec seulement votre IP personnelle
3. Cliquer sur **"Add IP Address"** (bouton vert)
4. Dans la popup :
   - Cliquer sur **"Allow Access from Anywhere"** 
   - OU entrer manuellement : `0.0.0.0/0`
   - Cliquer sur **"Confirm"**
5. **ATTENDRE 1-2 minutes** pour que les changements prennent effet

### Étape 3 : Vérifier

1. Revenir sur votre site
2. Faire une réservation de test
3. L'erreur 503 devrait disparaître

## 🔍 Comment vérifier que c'est bien le problème

### Option 1 : Vérifier les logs Vercel

1. Aller sur https://vercel.com
2. Ouvrir votre projet backend
3. Deployments → Dernier déploiement → Function Logs
4. Chercher les messages :
   - `❌ Erreur de connexion à MongoDB`
   - Si vous voyez "timeout" ou "ENETUNREACH" → c'est bien un problème de whitelist IP

### Option 2 : Tester depuis votre machine locale

Si ça fonctionne en local mais pas sur Vercel → c'est bien un problème de whitelist IP.

## ⚠️ Sécurité

**"Allow Access from Anywhere" (0.0.0.0/0)** permet à n'importe qui de se connecter si quelqu'un a votre connection string.

**Pour plus de sécurité** (optionnel) :
- Utiliser uniquement les IPs Vercel (mais elles changent souvent)
- Utiliser MongoDB Atlas VPC Peering (avancé)

Pour l'instant, **0.0.0.0/0 est acceptable** car votre connection string est déjà dans le code.

## 📝 Après avoir configuré

1. ✅ Whitelist IP configurée sur MongoDB Atlas
2. ⏳ Attendre 1-2 minutes
3. 🧪 Tester une réservation
4. ✅ Vérifier les logs Vercel pour voir `✅ MongoDB connecté avec succès`

## 🆘 Si ça ne fonctionne toujours pas

1. Vérifier que le cluster MongoDB est actif (pas en pause)
2. Vérifier que votre connection string est correcte
3. Vérifier les logs Vercel pour voir l'erreur exacte
4. Me partager les logs Vercel pour diagnostic
