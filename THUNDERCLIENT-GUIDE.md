# 🚕 Guide ThunderClient - Taxi Cagnes-sur-Mer API

## 📋 Routes disponibles

### 1️⃣ **POST** - Créer une réservation

**URL:** `http://localhost:3000/users/reservation`  
**Méthode:** POST  
**Headers:** `Content-Type: application/json`

**Body (JSON):**

```json
{
  "nom": "Dupont Jean",
  "indicatifPays": "+33",
  "telephone": "612345678",
  "email": "jean.dupont@example.com",
  "date": "2025-10-15",
  "heure": "14:30",
  "adresseDepart": "Aéroport Nice Côte d'Azur",
  "adresseArrivee": "Cagnes-sur-Mer, 06800",
  "nombreBagages": "2",
  "nombrePassagers": "3",
  "commentaires": "Vol Air France AF7654"
}
```

**Réponse attendue (201):**

```json
{
  "result": true,
  "message": "Réservation créée avec succès",
  "reservation": {
    "_id": "670abc123def456...",
    "nom": "Dupont Jean",
    "telephoneComplet": "+33612345678",
    ...
  }
}
```

---

### 2️⃣ **GET** - Récupérer toutes les réservations

**URL:** `http://localhost:3000/users/reservations`  
**Méthode:** GET

**Réponse attendue (200):**

```json
{
  "result": true,
  "count": 3,
  "reservations": [...]
}
```

---

### 3️⃣ **GET** - Récupérer une réservation par ID

**URL:** `http://localhost:3000/users/reservation/:id`  
**Méthode:** GET

**Exemple:** `http://localhost:3000/users/reservation/670abc123def456`

**Réponse attendue (200):**

```json
{
  "result": true,
  "reservation": {...}
}
```

---

### 4️⃣ **DELETE** - Supprimer une réservation

**URL:** `http://localhost:3000/users/reservation/:id`  
**Méthode:** DELETE

**Réponse attendue (200):**

```json
{
  "result": true,
  "message": "Réservation supprimée avec succès"
}
```

---

## ✅ Champs requis

- `nom` (String)
- `telephone` (String - 8 à 15 chiffres)
- `date` (Date - Format: YYYY-MM-DD)
- `heure` (String - Format: HH:MM)
- `adresseDepart` (String)
- `adresseArrivee` (String)
- `nombreBagages` (String)
- `nombrePassagers` (String)

## 📌 Champs optionnels

- `email` (String)
- `commentaires` (String)
- `indicatifPays` (String - Par défaut: "+33")

---

## 🧪 Exemples de tests

### ✅ Test 1 - Réservation complète

```json
{
  "nom": "Martin Sophie",
  "indicatifPays": "+33",
  "telephone": "698765432",
  "email": "sophie.martin@gmail.com",
  "date": "2025-10-16",
  "heure": "09:00",
  "adresseDepart": "Gare SNCF Cagnes-sur-Mer",
  "adresseArrivee": "Monaco, Place du Casino",
  "nombreBagages": "1",
  "nombrePassagers": "2",
  "commentaires": "Préférence véhicule électrique"
}
```

### ✅ Test 2 - Réservation minimale

```json
{
  "nom": "Bernard Paul",
  "telephone": "645123789",
  "date": "2025-11-05",
  "heure": "16:00",
  "adresseDepart": "Juan-les-Pins Centre",
  "adresseArrivee": "Nice Promenade des Anglais",
  "nombreBagages": "0",
  "nombrePassagers": "1"
}
```

### ✅ Test 3 - Indicatif international

```json
{
  "nom": "Smith John",
  "indicatifPays": "+44",
  "telephone": "7700900123",
  "email": "john.smith@example.co.uk",
  "date": "2025-10-20",
  "heure": "18:45",
  "adresseDepart": "Hôtel Cagnes-sur-Mer",
  "adresseArrivee": "Aéroport Nice Terminal 2",
  "nombreBagages": "4",
  "nombrePassagers": "2",
  "commentaires": "Véhicule spacieux requis"
}
```

---

## ⚠️ Validations

- **indicatifPays:** Doit commencer par `+` suivi de 1 à 4 chiffres
- **telephone:** Entre 8 et 15 chiffres (sans espaces)
- **date:** Format ISO (YYYY-MM-DD)
- **heure:** Format 24h (HH:MM)

---

## 🚀 Instructions ThunderClient

1. **Ouvrir ThunderClient** dans VS Code (icône éclair dans la barre latérale)
2. Cliquer sur **"New Request"**
3. Sélectionner la méthode (GET, POST, DELETE)
4. Entrer l'URL
5. Pour POST: aller dans l'onglet **"Body"** → **"JSON"** et coller le JSON
6. Cliquer sur **"Send"**

---

## 🔗 Routes complètes

| Méthode | Route                    | Description                    |
| ------- | ------------------------ | ------------------------------ |
| POST    | `/users/reservation`     | Créer une réservation          |
| GET     | `/users/reservations`    | Lister toutes les réservations |
| GET     | `/users/reservation/:id` | Récupérer une réservation      |
| DELETE  | `/users/reservation/:id` | Supprimer une réservation      |
| GET     | `/date`                  | Obtenir la date actuelle       |

---

## 💡 Astuce

Après avoir créé une réservation avec POST, copiez l'`_id` de la réponse pour tester les routes GET et DELETE !

Exemple d'ID: `670abc123def456789012345`
