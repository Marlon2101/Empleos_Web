import { generarToken } from "../utils/jwt.js";

export const loginAdminTemporal = async (req, res) => {
  try {
    const { usuario, clave } = req.body;

    if (usuario !== "admin" || clave !== "admin123") {
      return res.status(401).json({
        mensaje: "Credenciales de admin inválidas"
      });
    }

    const token = generarToken({
      id: 1,
      tipo: "admin"
    });

    res.json({
      mensaje: "Login admin correcto",
      token,
      data: {
        id: 1,
        usuario: "admin",
        tipo: "admin"
      }
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al iniciar sesión como admin",
      error: error.message
    });
  }
};