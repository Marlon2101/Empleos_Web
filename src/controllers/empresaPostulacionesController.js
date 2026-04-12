import {
  getPostulacionesEmpresa,
  getDetallePostulacionEmpresa
} from "../models/empresaPostulacionesModel.js";

export const obtenerPostulacionesEmpresa = async (req, res) => {
  try {
    const data = await getPostulacionesEmpresa(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener postulaciones de la empresa",
      error: error.message
    });
  }
};

export const obtenerDetallePostulacionEmpresa = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await getDetallePostulacionEmpresa(id, req.user.id);

    if (!data) {
      return res.status(404).json({
        mensaje: "Postulación no encontrada para esta empresa"
      });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener detalle de la postulación",
      error: error.message
    });
  }
};