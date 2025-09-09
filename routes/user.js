// routes/user.js
import express from "express";
import { protect, admin } from '../middleware/auth.js'; 
import {
  getUsers,
  getUserById,
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  createAdmin
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", protect, getUsers);
router.get("/:id", protect, getUserById);
router.post("/", registerUser);
router.post("/login", loginUser);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);
router.post("/admin", createAdmin); // Route pour créer un admin (à protéger si nécessaire)

export default router;