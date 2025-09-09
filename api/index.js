import express from 'express';
import user from '../routes/user.js';
import dotenv from "dotenv";
import connectDB from "../config/db.js";
dotenv.config(); // charge les variables d'environnement
const app = express();
// Connexion DB
connectDB();

// Middleware pour analyser les requêtes en JSON
app.use(express.json());

// Exemple de route GET
app.get('/', (req, res) => {
  res.send({ message: '🚀 API en ligne' });
});
app.use("/users", user);

const start = async () => {
  try {
    const PORT = process.env.PORT || 5000;

    // Lancement du serveur
    app.listen(PORT, () => {
      console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur :', error.message);
    process.exit(1); // On arrête le process en cas d’erreur critique
  }
};

start();
