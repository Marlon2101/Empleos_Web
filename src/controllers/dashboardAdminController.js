import { getResumenAdmin } from "../models/dashboardAdminModel.js";

export const obtenerDashboardAdmin = async (req, res) => {
  try {
    const data = await getResumenAdmin();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener dashboard admin",
      error: error.message
    });
  }
};