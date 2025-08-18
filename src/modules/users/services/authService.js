import token from "./token.js";
import User from "../models/userModel.js";

// Registrar usuario
export const registerUser = async ({ email, password }) => {
  const userExists = await User.findOne({ email });
  if (userExists) throw new Error("El usuario ya existe");

  const user = await User.create({ email, password });
  return { id: user._id, email: user.email, token: token.encode(user._id) };
};

// Login de usuario
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Usuario no encontrado");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error("Contraseña incorrecta");

  return { id: user._id, email: user.email, token: token.encode(user._id) };
};

export const authService = {
  registerUser,
  loginUser,
};
