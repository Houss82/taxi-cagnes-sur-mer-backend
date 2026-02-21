# 🧪 Test de l'envoi d'email Resend

## ✅ Vérifications avant test

1. **Variables d'environnement configurées sur Vercel :**
   - ✅ `RESEND_API_KEY` = votre clé API Resend
   - ✅ `EMAIL_TO` = votre email de réception

2. **Backend déployé :**
   - ✅ Le backend a été redéployé après l'ajout des variables d'environnement
   - ✅ Le package `resend` est installé (vérifié dans `package.json`)

## 🧪 Test

### 1. Faire une réservation de test

1. Aller sur votre site : https://taxi-cagnes-sur-mer.fr/reservation
2. Remplir le formulaire avec des données de test
3. Soumettre la réservation

### 2. Vérifier les logs Vercel

1. Aller sur https://vercel.com
2. Ouvrir le projet backend `taxi-cagnes-sur-mer-backend`
3. Aller dans "Deployments" → cliquer sur le dernier déploiement
4. Ouvrir "Function Logs"

**Logs attendus en cas de succès :**
```
✅ Réservation créée avec succès: { id: '...', nom: '...', ... }
✅ Email de réservation envoyé avec succès via Resend
```

**Logs en cas d'erreur :**
```
❌ Échec envoi email Resend: [message d'erreur]
```

### 3. Vérifier votre boîte email

- Vérifier votre boîte de réception (et spam) à l'adresse configurée dans `EMAIL_TO`
- Vous devriez recevoir un email formaté avec toutes les informations de réservation

## 🔍 Dépannage

### Si vous ne recevez pas l'email :

1. **Vérifier les logs Vercel** pour voir l'erreur exacte
2. **Vérifier votre compte Resend** :
   - Aller sur https://resend.com/emails
   - Vérifier si l'email apparaît dans l'historique
   - Vérifier le statut (delivered, bounced, etc.)
3. **Vérifier les variables d'environnement** :
   - Dans Vercel → Settings → Environment Variables
   - Vérifier que `RESEND_API_KEY` commence bien par `re_`
   - Vérifier que `EMAIL_TO` est correct

### Erreurs courantes :

- **"RESEND_API_KEY non configurée"** → Vérifier que la variable est bien ajoutée sur Vercel
- **"Package Resend non installé"** → Le backend doit être redéployé après l'ajout de `resend` au package.json
- **"Invalid API key"** → Vérifier que votre clé API Resend est correcte

## 📊 Suivi

Après chaque réservation, vous pouvez :
1. Vérifier les logs Vercel pour confirmer l'envoi
2. Vérifier votre boîte email
3. Vérifier le dashboard Resend pour voir les statistiques d'envoi
