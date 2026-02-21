# Configuration Resend pour l'envoi d'emails

## 📧 Pourquoi Resend ?

Resend est plus fiable que Formspree et offre :
- ✅ 3000 emails gratuits/mois (vs 50 pour Formspree)
- ✅ Plus fiable et rapide
- ✅ API moderne et simple
- ✅ Meilleure délivrabilité

## 🚀 Configuration rapide

### 1. Créer un compte Resend

1. Aller sur https://resend.com
2. Créer un compte gratuit
3. Vérifier votre email

### 2. Obtenir votre API Key

1. Dans le dashboard Resend, aller dans "API Keys"
2. Cliquer sur "Create API Key"
3. Donner un nom (ex: "Taxi Cagnes-sur-Mer")
4. Copier la clé API (commence par `re_...`)

### 3. Configurer les variables d'environnement

#### Sur Vercel (Production) :

1. Aller sur https://vercel.com
2. Ouvrir votre projet backend `taxi-cagnes-sur-mer-backend`
3. Aller dans "Settings" → "Environment Variables"
4. Ajouter :
   - `RESEND_API_KEY` = votre clé API Resend (ex: `re_abc123...`)
   - `EMAIL_TO` = votre email de réception (ex: `taxicagnessurmer2025@gmail.com`)

#### En local (Développement) :

Créer un fichier `.env` dans le dossier `backend/` :

```env
RESEND_API_KEY=re_votre_cle_api_ici
EMAIL_TO=taxicagnessurmer2025@gmail.com
```

### 4. Installer la dépendance

```bash
cd backend
npm install
```

### 5. Vérifier que ça fonctionne

Après avoir configuré les variables d'environnement et déployé :
- Faire une réservation de test
- Vérifier que vous recevez l'email
- Vérifier les logs Vercel pour voir les messages `✅ Email envoyé via Resend`

## 📝 Note importante

Par défaut, Resend utilise `onboarding@resend.dev` comme expéditeur. Pour utiliser votre propre domaine :

1. Dans Resend, aller dans "Domains"
2. Ajouter votre domaine (ex: `taxi-cagnes-sur-mer.fr`)
3. Suivre les instructions DNS pour vérifier le domaine
4. Modifier la ligne dans `routes/users.js` :
   ```javascript
   from: "Taxi Cagnes-sur-Mer <reservations@taxi-cagnes-sur-mer.fr>",
   ```

## 🔍 Dépannage

Si les emails ne partent pas :

1. Vérifier que `RESEND_API_KEY` est bien configurée dans Vercel
2. Vérifier les logs Vercel pour voir les erreurs
3. Vérifier que votre compte Resend est actif
4. Vérifier que vous n'avez pas dépassé la limite gratuite (3000/mois)
