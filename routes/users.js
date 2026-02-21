var express = require("express");
var router = express.Router();
const User = require("../models/users");

// Charger Resend une seule fois au démarrage (si disponible)
let ResendClass = null;
try {
  const resendModule = require("resend");
  ResendClass = resendModule.Resend;
} catch (err) {
  console.warn("⚠️ Package 'resend' non installé. Exécutez: npm install resend");
}

// Fonction pour envoyer un email de réservation via Resend
async function sendReservationEmail(reservation) {
  // Vérifier si Resend est configuré
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const EMAIL_TO = process.env.EMAIL_TO || "taxicagnessurmer2025@gmail.com";
  
  if (!RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY non configurée, email non envoyé");
    return { success: false, error: "RESEND_API_KEY non configurée" };
  }

  if (!ResendClass) {
    console.warn("⚠️ Package Resend non disponible, email non envoyé");
    return { success: false, error: "Package Resend non installé" };
  }

  try {
    const resend = new ResendClass(RESEND_API_KEY);

    // Formater la date et l'heure
    const dateFormatted = new Date(reservation.date).toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    
    const telephoneComplet = `${reservation.indicatifPays || "+33"} ${reservation.telephone}`;

    // Créer le contenu de l'email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
          .info { background: #fff; padding: 15px; margin: 10px 0; border-left: 4px solid #007bff; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🚕 Nouvelle Réservation - Taxi Cagnes-sur-Mer</h2>
          </div>
          
          <div class="info">
            <strong>👤 Client:</strong> ${reservation.nom}
          </div>
          
          <div class="info">
            <strong>📞 Téléphone:</strong> ${telephoneComplet}
          </div>
          
          ${reservation.email ? `<div class="info"><strong>📧 Email:</strong> ${reservation.email}</div>` : ''}
          
          <div class="info">
            <strong>📅 Date:</strong> ${dateFormatted}
          </div>
          
          <div class="info">
            <strong>🕐 Heure:</strong> ${reservation.heure}
          </div>
          
          <div class="info">
            <strong>📍 Départ:</strong> ${reservation.adresseDepart}
          </div>
          
          <div class="info">
            <strong>🎯 Destination:</strong> ${reservation.adresseArrivee}
          </div>
          
          <div class="info">
            <strong>👥 Passagers:</strong> ${reservation.nombrePassagers}
          </div>
          
          <div class="info">
            <strong>🧳 Bagages:</strong> ${reservation.nombreBagages}
          </div>
          
          ${reservation.vehicule ? `<div class="info"><strong>🚗 Véhicule:</strong> ${reservation.vehicule}</div>` : ''}
          
          ${reservation.commentaires ? `<div class="info"><strong>📝 Notes:</strong> ${reservation.commentaires}</div>` : ''}
          
          <div class="footer">
            <p>Réservation créée le ${new Date().toLocaleString("fr-FR")}</p>
            <p>ID Réservation: ${reservation._id}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
Nouvelle Réservation - Taxi Cagnes-sur-Mer

Client: ${reservation.nom}
Téléphone: ${telephoneComplet}
${reservation.email ? `Email: ${reservation.email}` : ''}

Date: ${dateFormatted}
Heure: ${reservation.heure}

Départ: ${reservation.adresseDepart}
Destination: ${reservation.adresseArrivee}

Passagers: ${reservation.nombrePassagers}
Bagages: ${reservation.nombreBagages}
${reservation.vehicule ? `Véhicule: ${reservation.vehicule}` : ''}
${reservation.commentaires ? `Notes: ${reservation.commentaires}` : ''}

ID Réservation: ${reservation._id}
    `;

    const result = await resend.emails.send({
      from: "Taxi Cagnes-sur-Mer <onboarding@resend.dev>", // À changer avec votre domaine vérifié
      to: [EMAIL_TO], // Resend attend un tableau
      replyTo: reservation.email || undefined,
      subject: `Nouvelle réservation - ${reservation.nom}`,
      html: emailHtml,
      text: emailText,
    });

    console.log("✅ Email envoyé via Resend avec succès:", result);
    return { success: true, result };
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi d'email Resend:", error);
    return { success: false, error: error.message };
  }
}

// POST - Créer une nouvelle réservation
router.post("/reservation", async (req, res) => {
  try {
    // Vérifier la connexion MongoDB avant de traiter la requête
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) {
      // Essayer de se reconnecter
      const connectDB = require("../models/connection");
      await connectDB();
      
      // Vérifier à nouveau après tentative de reconnexion
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          result: false,
          error: "Service temporairement indisponible. Connexion à la base de données en cours...",
        });
      }
    }

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
    
    // Envoyer l'email de réservation via Resend (en parallèle, ne bloque pas)
    sendReservationEmail(savedUser.toObject({ virtuals: true }))
      .then((emailResult) => {
        if (emailResult.success) {
          console.log("✅ Email de réservation envoyé avec succès via Resend");
        } else {
          console.error("❌ Échec envoi email Resend:", emailResult.error);
        }
      })
      .catch((err) => {
        console.error("❌ Erreur lors de l'envoi d'email:", err);
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
