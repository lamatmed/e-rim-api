// routes/user.js
import express from "express";
import protect from "../middleware/auth.js";
import {
  getUsers,
  getUserById,
  registerUser,
  loginUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", registerUser);
router.post("/login", loginUser);
router.delete("/:id", protect, deleteUser);

export default router;
