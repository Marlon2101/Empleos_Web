import { generarToken } from "../utils/jwt.js";

export const loginAdminTemporal = async (req, res) => {
  try {
    const { usuario, clave } = req.body;
    const usuarioNormalizado = (usuario || "").trim().toLowerCase();

    if (!["admin", "admin@workly.com"].includes(usuarioNormalizado) || clave !== "admin123") {
      return res.status(401).json({
        mensaje: "Credenciales de admin invalidas"
      });
    }

    const token = generarToken({
      id: 1,
      tipo: "admin",
      email_verificado: true
    });

    res.json({
      mensaje: "Login admin correcto",
      token,
      tipo: "admin",
      data: {
        id: 1,
        usuario: usuarioNormalizado,
        tipo: "admin",
        email_verificado: true
      }
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al iniciar sesion como admin",
      error: error.message
    });
  }
};
