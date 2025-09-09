// controllers/userController.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";

// Générer un token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc    Obtenir tous les utilisateurs
// @route   GET /users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// @desc    Obtenir un utilisateur par ID
// @route   GET /users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// @desc    Créer un utilisateur (register)
// @route   POST /users
export const registerUser = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ error: "Numéro déjà utilisé" });

    const newUser = new User({ name, phone, password });
    await newUser.save();

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: newUser._id,
        name: newUser.name,
        phone: newUser.phone,
      },
      token: generateToken(newUser._id),
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// @desc    Login utilisateur
// @route   POST /users/login
export const loginUser = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ error: "Identifiants invalides" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ error: "Identifiants invalides" });

    res.json({
      message: "Connexion réussie",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// @desc    Supprimer son compte
// @route   DELETE /users/:id
export const deleteUser = async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: "Accès refusé : vous ne pouvez supprimer que votre propre compte" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
