import { getResumenUsuario } from "../models/dashboardUsuarioModel.js";

export const obtenerDashboardUsuario = async (req, res) => {
  try {
    const data = await getResumenUsuario(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener dashboard de usuario",
      error: error.message
    });
  }
};