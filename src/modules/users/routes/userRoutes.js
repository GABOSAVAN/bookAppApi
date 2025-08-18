import { Router } from "express";
import {
  register,
  login,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = Router();

// Auth
router.post("/register", register);
router.post("/login", login);

// CRUD
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);



export default router;
