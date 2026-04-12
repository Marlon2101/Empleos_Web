import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        mensaje: "Token no proporcionado"
      });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({
        mensaje: "Formato de token inválido"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      mensaje: "Token inválido o expirado",
      error: error.message
    });
  }
};

export const verificarTokenOpcional = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

export const autorizarRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          mensaje: "Usuario no autenticado"
        });
      }

      if (!rolesPermitidos.includes(req.user.tipo)) {
        return res.status(403).json({
          mensaje: "No tienes permisos para acceder a esta ruta"
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        mensaje: "Error al validar permisos",
        error: error.message
      });
    }
  };
};