var express = require("express");
var router = express.Router();
const User = require("../models/users");

// POST - Créer une nouvelle réservation
router.post("/reservation", async (req, res) => {
  try {
    // Vérifier la connexion MongoDB avant de traiter la requête
    const mongoose = require("mongoose");
    const connectDB = require("../models/connection");
    
    // Si pas connecté, essayer de se connecter
    if (mongoose.connection.readyState !== 1) {
      const connected = await connectDB();
      
      // Si toujours pas connecté après tentative, attendre un peu plus
      if (!connected && mongoose.connection.readyState !== 1) {
        // Attendre jusqu'à 5 secondes supplémentaires
        let attempts = 0;
        while (mongoose.connection.readyState !== 1 && attempts < 10) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          attempts++;
        }
        
        // Si toujours pas connecté, retourner erreur
        if (mongoose.connection.readyState !== 1) {
          return res.status(503).json({
            result: false,
            error: "Service temporairement indisponible. Connexion à la base de données en cours...",
          });
        }
      }
    }

    // Log pour déboguer
    console.log("Données reçues:", req.body);
    console.log("Véhicule reçu:", req.body.vehicule);
    
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

module.exports = router;
