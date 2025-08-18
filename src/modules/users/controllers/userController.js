import User from "../models/userModel.js";
import { authService } from "../services/authService.js";

// Crear usuario (registro)
export const register = async (req, res) => {
  try {
    console.log("registrando user...", req.body)
    const { email, password } = req.body;
    const user = await authService.registerUser({ email, password });
    res.status(201).json(user);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    console.log("logiando user...", req.body)
    const { email, password } = req.body;
    const user = await authService.loginUser({ email, password });
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
  try {
    console.log("obteniendo users...")
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener un usuario por ID
export const getUserById = async (req, res) => {
  try {
    console.log("obteniendo user por id...")
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar usuario
export const updateUser = async (req, res) => {
  try {
    console.log("actualizando user...", req.params.id, "DATA:   ", req.body)
    const { email, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    if (email) user.email = email;
    if (password) user.password = password; // se re-encripta con pre-save

    await user.save();
    res.json({ id: user._id, email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    console.log("eliminando user...", req.params.id)
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const testValidator = async (req, res) => {
  try {
    return res.json({ message: "Usuario validado" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
