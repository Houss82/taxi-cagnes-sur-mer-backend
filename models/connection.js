const mongoose = require("mongoose");

const connectionString =
  "mongodb+srv://mansourhoussem1982:0LshwJSY0rc7rFQ1@cluster0.5lywams.mongodb.net/taxi-cagnes-sur-mer";

const connectDB = async () => {
  try {
    // Vérifier si déjà connecté
    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB déjà connecté 👍");
      return;
    }

    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 30000, // Augmenté à 30 secondes
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
    });
    console.log("MongoDB connecté avec succès 👍");
  } catch (error) {
    console.error("Erreur de connexion à MongoDB:", error.message);
    // Ne pas arrêter le processus, permettre au serveur de continuer
    // La connexion sera réessayée à la prochaine requête
  }
};

module.exports = connectDB;
