import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { obtenerEstadoVerificacionCuenta } from "../models/usuarioModel.js";

dotenv.config();

const buildPendingRedirect = (correo_electronico, tipo) =>
  `/views/public/verificacion-pendiente/index.html?email=${encodeURIComponent(correo_electronico || "")}&tipo=${encodeURIComponent(tipo || "")}`;

export const verificarToken = async (req, res, next) => {
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
        mensaje: "Formato de token invalido"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    if (decoded.tipo !== "admin") {
      const cuenta = await obtenerEstadoVerificacionCuenta(decoded.id, decoded.tipo);

      if (!cuenta) {
        return res.status(401).json({
          mensaje: "La cuenta asociada al token no existe"
        });
      }

      req.user.correo_electronico = cuenta.correo_electronico;
      req.user.email_verificado = Boolean(cuenta.email_verificado);

      if (!req.user.email_verificado) {
        return res.status(403).json({
          mensaje: "Debes verificar tu email antes de continuar",
          code: "EMAIL_NO_VERIFICADO",
          tipo: decoded.tipo,
          correo_electronico: cuenta.correo_electronico,
          redirect: buildPendingRedirect(cuenta.correo_electronico, decoded.tipo)
        });
      }
    } else {
      req.user.email_verificado = true;
    }

    next();
  } catch (error) {
    return res.status(401).json({
      mensaje: "Token invalido o expirado",
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
  } catch {
    req.user = null;
    next();
  }
};

export const verificarEmailConfirmado = async (req, res, next) => {
  try {
    if (!req.user || req.user.tipo === "admin") {
      return next();
    }

    const cuenta = await obtenerEstadoVerificacionCuenta(req.user.id, req.user.tipo);

    if (!cuenta) {
      return res.status(401).json({
        mensaje: "La cuenta asociada al token no existe"
      });
    }

    if (!cuenta.email_verificado) {
      return res.status(403).json({
        mensaje: "Debes verificar tu email antes de continuar",
        code: "EMAIL_NO_VERIFICADO",
        tipo: req.user.tipo,
        correo_electronico: cuenta.correo_electronico,
        redirect: buildPendingRedirect(cuenta.correo_electronico, req.user.tipo)
      });
    }

    req.user.email_verificado = true;
    req.user.correo_electronico = cuenta.correo_electronico;

    next();
  } catch (error) {
    return res.status(500).json({
      mensaje: "Error al validar la verificacion del correo",
      error: error.message
    });
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
