const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/skilldb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connecté à MongoDB');
}).catch((error) => {
    console.error('Erreur de connexion à MongoDB:', error);
});

// Définir un modèle pour les inscriptions
const InscriptionSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    experience: String
});

const Inscription = mongoose.model('Inscription', InscriptionSchema);

// Configurer Twilio
const accountSid = 'youraccount'; // Remplacez par votre SID de compte
const authToken = 'youraccount'; // Remplacez par votre token d'authentification
const client = twilio(accountSid, authToken);
const serviceSid = 'youraccount'; // Remplacez par votre SID de service de vérification

// Route POST pour envoyer le code de vérification
app.post('/api/send-verification', async (req, res) => {
    const { phone } = req.body;
    console.log('Numéro de téléphone reçu:', phone); // Debug log

    try {
        
        await client.verify.v2.services(serviceSid)
            .verifications
            .create({ to: phone, channel: 'sms' });
        res.status(200).json({ message: 'Code de vérification envoyé.' });
    } catch (error) {
        console.error('Erreur lors de l\'envoi du SMS:', error); // Log the error
        res.status(500).json({ error: 'Erreur lors de l\'envoi du SMS.' });
    }
});


// Route POST pour vérifier le code de vérification et enregistrer l'inscription
app.post('/api/inscriptions', async (req, res) => {
    const { name, email, phone, experience, verificationCode } = req.body;

    try {
        // Vérifier le code de vérification
        const verificationCheck = await client.verify.v2.services(serviceSid)
            .verificationChecks
            .create({ to: phone, code: verificationCode });

        if (verificationCheck.status !== 'approved') {
            return res.status(400).json({ error: 'Code de vérification invalide.' });
        }

        // Vérifiez si l'email ou le numéro de téléphone existe déjà
        const existingInscription = await Inscription.findOne({ $or: [{ email }, { phone }] });

        if (existingInscription) {
            if (existingInscription.email === email) {
                return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
            }
            if (existingInscription.phone === phone) {
                return res.status(400).json({ error: 'Ce numéro de téléphone est déjà utilisé.' });
            }
        }

        // Création d'une nouvelle inscription
        const newInscription = new Inscription({
            name,
            email,
            phone,
            experience
        });
        
        // Sauvegarder dans MongoDB
        await newInscription.save();
        res.status(201).json({ message: "Inscription réussie" });
    } catch (error) {
        if (error.code === 11000) {
            if (error.keyPattern.email) {
                res.status(400).json({ error: 'Cet email est déjà utilisé.' });
            } else if (error.keyPattern.phone) {
                res.status(400).json({ error: 'Ce numéro de téléphone est déjà utilisé.' });
            }
        } else {
            res.status(500).json({ error: 'Erreur lors de l’inscription.' });
        }
    }
});


// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
