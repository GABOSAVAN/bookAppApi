import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export default {
  encode: (_id) => {
    console.log("pasando por encode...")
    return jwt.sign({ _id: _id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  },

  decode: async (token) => {
    try {
        const secret = process.env.JWT_SECRET;
        const { _id } = jwt.verify(token, secret);
        console.log("validando token en decode...", _id);
      const user = await User.findOne({ _id: _id });
      if (user) {
        return user;
      }      
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  },
};
