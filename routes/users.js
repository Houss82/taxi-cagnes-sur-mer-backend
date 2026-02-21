var express = require("express");
var router = express.Router();
const User = require("../models/users");

// POST - Créer une nouvelle réservation
router.post("/reservation", async (req, res) => {
  try {
    // Vérifier la connexion MongoDB avant de traiter la requête
    const mongoose = require("mongoose");
    const connectionState = mongoose.connection.readyState;
    
    console.log(`🔍 État de connexion MongoDB: ${connectionState} (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)`);
    
    if (connectionState !== 1) {
      console.log("🔄 Tentative de connexion à MongoDB...");
      // Essayer de se reconnecter
      const connectDB = require("../models/connection");
      try {
        await connectDB();
      } catch (connectError) {
        console.error("❌ Erreur lors de la tentative de connexion:", {
          message: connectError.message,
          name: connectError.name,
          code: connectError.code,
          errorType: connectError.constructor.name,
        });
        
        // Message d'erreur plus détaillé pour aider au diagnostic
        let errorMessage = "Service temporairement indisponible. Connexion à la base de données en cours...";
        
        if (connectError.message.includes("ENOTFOUND") || connectError.message.includes("getaddrinfo")) {
          errorMessage = "Erreur DNS - Vérifiez votre connexion internet et la configuration MongoDB Atlas";
        } else if (connectError.message.includes("authentication") || connectError.code === 8000) {
          errorMessage = "Erreur d'authentification MongoDB - Vérifiez vos identifiants";
        } else if (connectError.message.includes("timeout") || connectError.code === "ETIMEDOUT") {
          errorMessage = "Timeout de connexion - Vérifiez la whitelist IP sur MongoDB Atlas (Network Access)";
        } else if (connectError.code === "ENETUNREACH") {
          errorMessage = "Réseau inaccessible - Vérifiez la whitelist IP sur MongoDB Atlas";
        }
        
        return res.status(503).json({
          result: false,
          error: errorMessage,
          details: process.env.NODE_ENV === "development" ? connectError.message : undefined,
        });
      }
      
      // Vérifier à nouveau après tentative de reconnexion
      const newState = mongoose.connection.readyState;
      console.log(`🔍 Nouvel état de connexion: ${newState}`);
      
      if (newState !== 1) {
        console.error("❌ Impossible de se connecter à MongoDB après tentative");
        return res.status(503).json({
          result: false,
          error: "Service temporairement indisponible. Connexion à la base de données en cours...",
        });
      }
    }
    
    console.log("✅ Connexion MongoDB OK, traitement de la réservation...");

    // Log pour déboguer
    console.log("Données reçues:", req.body);
    console.log("Téléphone reçu:", req.body.telephone);
    console.log("Indicatif pays reçu:", req.body.indicatifPays);
    console.log("Longueur téléphone:", req.body.telephone?.length);
    console.log("Téléphone ne contient que des chiffres:", /^\d+$/.test(req.body.telephone || ""));
    
    // Validation préalable du téléphone
    if (!req.body.telephone || !/^\d{8,15}$/.test(req.body.telephone)) {
      return res.status(400).json({
        result: false,
        error: `Le numéro de téléphone doit contenir entre 8 et 15 chiffres. Reçu: "${req.body.telephone}" (${req.body.telephone?.length || 0} caractères)`,
      });
    }
    
    const newUser = new User({
      nom: req.body.nom,
      indicatifPays: req.body.indicatifPays || "+33",
      telephone: req.body.telephone,
      email: req.body.email,
      date: req.body.date,
      heure: req.body.heure,
      adresseDepart: req.body.adresseDepart,
      adresseArrivee: req.body.adresseArrivee,
      nombreBagages: req.body.nombreBagages,
      nombrePassagers: req.body.nombrePassagers,
      vehicule: req.body.vehicule,
      commentaires: req.body.commentaires,
    });
    
    console.log("Véhicule dans newUser:", newUser.vehicule);

    const savedUser = await newUser.save();
    
    // Log pour confirmation
    console.log("✅ Réservation créée avec succès:", {
      id: savedUser._id,
      nom: savedUser.nom,
      telephone: savedUser.telephoneComplet,
      date: savedUser.date,
      heure: savedUser.heure,
      timestamp: new Date().toISOString(),
    });
    
    // Convertir en objet JSON pour s'assurer que tous les champs sont inclus
    const reservationObj = savedUser.toObject({ virtuals: true });
    
    // S'assurer que le champ vehicule est toujours présent dans la réponse
    if (!('vehicule' in reservationObj)) {
      reservationObj.vehicule = savedUser.vehicule || null;
    }
    
    res.status(201).json({
      result: true,
      message: "Réservation créée avec succès",
      reservation: reservationObj,
    });
  } catch (error) {
    res.status(400).json({
      result: false,
      error: error.message,
    });
  }
});

// GET - Récupérer toutes les réservations
router.get("/reservations", async (req, res) => {
  try {
    const users = await User.find();
    res.json({
      result: true,
      count: users.length,
      reservations: users,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      error: error.message,
    });
  }
});

// GET - Récupérer une réservation par ID
router.get("/reservation/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        result: false,
        message: "Réservation non trouvée",
      });
    }
    res.json({
      result: true,
      reservation: user,
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      error: error.message,
    });
  }
});

// DELETE - Supprimer une réservation
router.delete("/reservation/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({
        result: false,
        message: "Réservation non trouvée",
      });
    }
    res.json({
      result: true,
      message: "Réservation supprimée avec succès",
    });
  } catch (error) {
    res.status(500).json({
      result: false,
      error: error.message,
    });
  }
});

// POST - Logger les erreurs d'envoi d'email depuis le frontend
router.post("/log-email-error", async (req, res) => {
  try {
    const { reservationId, error, details, timestamp } = req.body;
    
    console.error("❌ [EMAIL ERROR] Erreur d'envoi d'email détectée:", {
      reservationId: reservationId || "N/A",
      error: error || "Erreur inconnue",
      details: details || {},
      timestamp: timestamp || new Date().toISOString(),
      receivedAt: new Date().toISOString(),
    });
    
    // Retourner un succès pour ne pas bloquer le frontend
    res.status(200).json({
      result: true,
      message: "Erreur loggée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors du logging:", error);
    res.status(500).json({
      result: false,
      error: error.message,
    });
  }
});

module.exports = router;
