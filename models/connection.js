const mongoose = require("mongoose");

const connectionString =
  "mongodb+srv://mansourhoussem1982:0LshwJSY0rc7rFQ1@cluster0.5lywams.mongodb.net/taxi-cagnes-sur-mer";

// Configuration optimisée pour Vercel/serverless
mongoose.set("strictQuery", false);

// Gérer les événements de connexion
mongoose.connection.on("connected", () => {
  console.log("MongoDB connecté avec succès 👍");
});

mongoose.connection.on("error", (err) => {
  console.error("Erreur MongoDB:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB déconnecté");
});

const connectDB = async () => {
  try {
    // Vérifier si déjà connecté
    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB déjà connecté 👍");
      return true;
    }

    // Si en cours de connexion, attendre
    if (mongoose.connection.readyState === 2) {
      console.log("Connexion MongoDB en cours...");
      // Attendre jusqu'à 10 secondes pour la connexion
      let attempts = 0;
      while (mongoose.connection.readyState !== 1 && attempts < 20) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        attempts++;
      }
      if (mongoose.connection.readyState === 1) {
        return true;
      }
    }

    // Nouvelle connexion
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 1,
    });
    console.log("MongoDB connecté avec succès 👍");
    return true;
  } catch (error) {
    console.error("Erreur de connexion à MongoDB:", error.message);
    return false;
  }
};

module.exports = connectDB;
