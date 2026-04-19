import {
  getNotificaciones,
  getResumenNotificaciones,
  crearNotificacion,
  marcarNotificacionLeida,
  marcarNotificacionNoLeida,
  marcarTodasLeidas,
  eliminarNotificacion
} from "../models/notificacionesModel.js";

const getAuthTarget = (req) => ({
  tipo_usuario: req.user.tipo,
  id_destinatario: req.user.id
});

export const obtenerMisNotificaciones = async (req, res) => {
  try {
    const target = getAuthTarget(req);
    const data = await getNotificaciones(target.tipo_usuario, target.id_destinatario, req.query);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener notificaciones",
      error: error.message
    });
  }
};

export const obtenerResumenNotificaciones = async (req, res) => {
  try {
    const target = getAuthTarget(req);
    const data = await getResumenNotificaciones(target.tipo_usuario, target.id_destinatario);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener el resumen de notificaciones",
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
      mensaje,
      tipo_notificacion,
      enlace,
      metadata
    } = req.body;

    const data = await crearNotificacion({
      tipo_usuario,
      id_destinatario,
      titulo,
      mensaje,
      tipo_notificacion,
      enlace,
      metadata
    });

    res.status(201).json({
      mensaje: "Notificacion creada correctamente",
      data
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear notificacion",
      error: error.message
    });
  }
};

export const marcarLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const target = getAuthTarget(req);
    const data = await marcarNotificacionLeida(id, target.tipo_usuario, target.id_destinatario);

    if (!data) {
      return res.status(404).json({
        mensaje: "Notificacion no encontrada"
      });
    }

    res.json({
      mensaje: "Notificacion marcada como leida",
      data
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al marcar la notificacion",
      error: error.message
    });
  }
};

export const marcarNoLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const target = getAuthTarget(req);
    const data = await marcarNotificacionNoLeida(id, target.tipo_usuario, target.id_destinatario);

    if (!data) {
      return res.status(404).json({
        mensaje: "Notificacion no encontrada"
      });
    }

    res.json({
      mensaje: "Notificacion marcada como no leida",
      data
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar la notificacion",
      error: error.message
    });
  }
};

export const marcarTodas = async (req, res) => {
  try {
    const target = getAuthTarget(req);
    await marcarTodasLeidas(target.tipo_usuario, target.id_destinatario);

    res.json({
      mensaje: "Todas las notificaciones fueron marcadas como leidas"
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al marcar todas las notificaciones",
      error: error.message
    });
  }
};

export const eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const target = getAuthTarget(req);
    const data = await eliminarNotificacion(id, target.tipo_usuario, target.id_destinatario);

    if (!data) {
      return res.status(404).json({
        mensaje: "Notificacion no encontrada"
      });
    }

    res.json({
      mensaje: "Notificacion eliminada correctamente",
      data
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar la notificacion",
      error: error.message
    });
  }
};

