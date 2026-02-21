const mongoose = require("mongoose");

// Utiliser une variable d'environnement si disponible, sinon utiliser la valeur par défaut
const connectionString =
  process.env.MONGODB_URI ||
  "mongodb+srv://mansourhoussem1982:0LshwJSY0rc7rFQ1@cluster0.5lywams.mongodb.net/taxi-cagnes-sur-mer?retryWrites=true&w=majority";

// Variable pour suivre l'état de connexion
let isConnecting = false;
let connectionPromise = null;

const connectDB = async () => {
  try {
    // Vérifier si déjà connecté
    if (mongoose.connection.readyState === 1) {
      console.log("✅ MongoDB déjà connecté");
      return true;
    }

    // Si une connexion est déjà en cours, attendre qu'elle se termine
    if (connectionPromise) {
      console.log("⏳ Connexion MongoDB déjà en cours, attente...");
      return await connectionPromise;
    }

    // Éviter les tentatives simultanées de connexion
    if (isConnecting) {
      console.log("⏳ Connexion MongoDB en cours...");
      let attempts = 0;
      while (isConnecting && attempts < 100) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
        if (mongoose.connection.readyState === 1) {
          return true;
        }
      }
      if (mongoose.connection.readyState !== 1) {
        throw new Error("Timeout lors de l'attente de la connexion");
      }
      return true;
    }

    isConnecting = true;
    console.log("🔄 Tentative de connexion à MongoDB...");
    console.log("Connection string:", connectionString.replace(/\/\/.*@/, "//***:***@"));

    // Créer une promesse de connexion partagée
    connectionPromise = mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 15000, // 15 secondes pour Vercel
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      maxPoolSize: 5, // Réduit pour Vercel serverless
      minPoolSize: 0, // Pas de pool minimum pour serverless
      retryWrites: true,
      w: "majority",
    }).then(() => {
      console.log("✅ MongoDB connecté avec succès");
      isConnecting = false;
      connectionPromise = null;
      return true;
    }).catch((err) => {
      isConnecting = false;
      connectionPromise = null;
      console.error("❌ Erreur de connexion à MongoDB:", err.message);
      console.error("Détails:", {
        name: err.name,
        code: err.code,
        errorType: err.constructor.name,
        connectionString: connectionString.replace(/\/\/.*@/, "//***:***@"),
      });
      throw err;
    });

    return await connectionPromise;
  } catch (error) {
    isConnecting = false;
    connectionPromise = null;
    console.error("❌ Erreur de connexion à MongoDB:", error.message);
    console.error("Stack:", error.stack);
    throw error; // Propager l'erreur pour que l'appelant puisse la gérer
  }
};

// Gérer la déconnexion proprement
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB déconnecté");
  isConnecting = false;
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Erreur MongoDB:", err.message);
  isConnecting = false;
});

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnecté");
});

module.exports = connectDB;
