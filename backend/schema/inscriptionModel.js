const mongoose = require('mongoose');

// Définir le schéma pour les inscriptions
const InscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Contrainte d'unicité sur l'email
    },
    phone: {
        type: String,
        required: true,
        unique: true // Contrainte d'unicité sur le numéro de téléphone
    },
    experience: {
        type: String,
        required: true
    }
});

// Créer un modèle basé sur le schéma
const Inscription = mongoose.model('Inscription', InscriptionSchema);

// Exporter le modèle pour l'utiliser ailleurs
module.exports = Inscription;
