// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Vérifier et décoder le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Ajouter l'utilisateur à la requête (sans password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) return res.status(401).json({ error: "Utilisateur non trouvé" });

      next();
    } catch (error) {
      return res.status(401).json({ error: "Token invalide ou expiré" });
    }
  } else {
    return res.status(401).json({ error: "Pas de token, accès refusé" });
  }
};

export default protect;
