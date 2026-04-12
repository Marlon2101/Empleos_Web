import {
  getPostulacionesUsuario,
  getDetallePostulacionUsuario
} from "../models/usuarioPostulacionesModel.js";

export const obtenerMisPostulaciones = async (req, res) => {
  try {
    const data = await getPostulacionesUsuario(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener postulaciones del usuario",
      error: error.message
    });
  }
};

export const obtenerDetalleMiPostulacion = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await getDetallePostulacionUsuario(id, req.user.id);

    if (!data) {
      return res.status(404).json({
        mensaje: "Postulación no encontrada para este usuario"
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