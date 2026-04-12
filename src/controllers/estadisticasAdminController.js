import { getEstadisticasAdmin } from "../models/estadisticasAdminModel.js";

export const obtenerEstadisticasAdmin = async (req, res) => {
  try {
    const data = await getEstadisticasAdmin();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener estadísticas admin",
      error: error.message
    });
  }
};