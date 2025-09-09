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
    const { name, phone, password, profileImage } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ error: "Numéro déjà utilisé" });

    const newUser = new User({ 
      name, 
      phone, 
      password, 
      profileImage: profileImage || "",
      role: "user", // Par défaut
      blocked: false // Par défaut
    });
    await newUser.save();

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        id: newUser._id,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
        blocked: newUser.blocked,
        profileImage: newUser.profileImage
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
    
    // Vérifier si le compte est bloqué
    if (user.blocked) return res.status(403).json({ error: "Votre compte a été bloqué" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ error: "Identifiants invalides" });

    res.json({
      message: "Connexion réussie",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        blocked: user.blocked,
        profileImage: user.profileImage
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// @desc    Mettre à jour un utilisateur
// @route   PUT /users/:id
export const updateUser = async (req, res) => {
  try {
    const { name, address, profileImage } = req.body;
    
    // Seul l'admin peut changer le rôle ou le statut blocked
    let updateData = { name, address, profileImage };
    
    if (req.user.role === "admin") {
      updateData = { ...updateData, role: req.body.role, blocked: req.body.blocked };
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });

    res.json({
      message: "Utilisateur mis à jour avec succès",
      user
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// @desc    Supprimer son compte
// @route   DELETE /users/:id
export const deleteUser = async (req, res) => {
  try {
    // L'admin peut supprimer n'importe quel compte, un utilisateur ne peut supprimer que son propre compte
    if (req.user.role !== "admin" && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: "Accès refusé" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Utilisateur supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// @desc    Créer un administrateur (pour usage interne)
// @route   POST /users/admin
export const createAdmin = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) return res.status(400).json({ error: "Numéro déjà utilisé" });

    const newUser = new User({ 
      name, 
      phone, 
      password, 
      role: "admin",
      blocked: false
    });
    await newUser.save();

    res.status(201).json({
      message: "Administrateur créé avec succès",
      user: {
        id: newUser._id,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};