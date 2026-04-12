import {
  getNotificaciones,
  crearNotificacion,
  marcarNotificacionLeida,
  marcarTodasLeidas
} from "../models/notificacionesModel.js";

export const obtenerMisNotificaciones = async (req, res) => {
  try {
    const data = await getNotificaciones(req.user.tipo, req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener notificaciones",
      error: error.message
    });
  }
};

export const crearNotificacionManual = async (req, res) => {
  try {
    const {
      tipo_usuario,
      id_destinatario,
      titulo,
      mensaje
    } = req.body;

    const data = await crearNotificacion({
      tipo_usuario,
      id_destinatario,
      titulo,
      mensaje
    });

    res.status(201).json({
      mensaje: "Notificación creada correctamente",
      data
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear notificación",
      error: error.message
    });
  }
};

export const marcarLeida = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await marcarNotificacionLeida(id, req.user.tipo, req.user.id);

    if (!data) {
      return res.status(404).json({
        mensaje: "Notificación no encontrada"
      });
    }

    res.json({
      mensaje: "Notificación marcada como leída",
      data
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al marcar notificación",
      error: error.message
    });
  }
};

export const marcarTodas = async (req, res) => {
  try {
    await marcarTodasLeidas(req.user.tipo, req.user.id);

    res.json({
      mensaje: "Todas las notificaciones fueron marcadas como leídas"
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al marcar todas las notificaciones",
      error: error.message
    });
  }
};