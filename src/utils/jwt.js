import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generarToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "8h"
  });
};