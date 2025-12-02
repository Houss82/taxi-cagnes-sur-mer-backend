const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
  },
  indicatifPays: {
    type: String,
    required: true,
    default: "+33", // France par défaut
    validate: {
      validator: function (v) {
        return /^\+\d{1,4}$/.test(v);
      },
      message: "L'indicatif doit commencer par + suivi de 1 à 4 chiffres",
    },
  },
  telephone: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{8,15}$/.test(v);
      },
      message: "Le numéro de téléphone doit contenir entre 8 et 15 chiffres",
    },
  },
  email: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    required: true,
  },
  heure: {
    type: String,
    required: true,
  },
  adresseDepart: {
    type: String,
    required: true,
  },
  adresseArrivee: {
    type: String,
    required: true,
  },
  nombreBagages: {
    type: String,
    required: true,
  },
  nombrePassagers: {
    type: String,
    required: true,
  },
  vehicule: {
    type: String,
    required: false,
    default: null,
  },
  commentaires: {
    type: String,
    required: false,
  },
});

// Méthode virtuelle pour obtenir le numéro complet
userSchema.virtual("telephoneComplet").get(function () {
  return this.indicatifPays + this.telephone;
});

// S'assurer que les champs virtuels sont inclus dans la sérialisation JSON
userSchema.set("toJSON", { 
  virtuals: true,
  transform: function(doc, ret) {
    // Inclure tous les champs, même s'ils sont undefined
    if (ret.vehicule === undefined) {
      ret.vehicule = null;
    }
    return ret;
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
