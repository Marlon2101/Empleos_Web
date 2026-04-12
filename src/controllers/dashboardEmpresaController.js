import { getResumenEmpresa } from "../models/dashboardEmpresaModel.js";

export const obtenerDashboardEmpresa = async (req, res) => {
  try {
    const data = await getResumenEmpresa(req.user.id);

    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener dashboard de empresa",
      error: error.message
    });
  }
};