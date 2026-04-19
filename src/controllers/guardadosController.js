import {
  getGuardadosByUsuario,
  getGuardadoByUsuarioVacante,
  createGuardado,
  deleteGuardado
} from "../models/guardadosModel.js";
import { getVacanteById } from "../models/vacantesModel.js";
import { crearNotificacion } from "../models/notificacionesModel.js";

export const obtenerMisGuardados = async (req, res) => {
  try {
    const data = await getGuardadosByUsuario(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener vacantes guardadas",
      error: error.message
    });
  }
};

export const validarGuardado = async (req, res) => {
  try {
    const { id_vacante } = req.params;
    const guardado = await getGuardadoByUsuarioVacante(req.user.id, id_vacante);

    res.json({
      guardado: Boolean(guardado),
      data: guardado
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al validar guardado",
      error: error.message
    });
  }
};

export const guardarVacante = async (req, res) => {
  try {
    const idVacante = Number(req.body.id_vacante_fk || req.params.id_vacante);
    const vacante = await getVacanteById(idVacante);

    if (!vacante) {
      return res.status(404).json({
        mensaje: "Vacante no encontrada"
      });
    }

    const data = await createGuardado(req.user.id, idVacante);

    await crearNotificacion({
      tipo_usuario: "usuario",
      id_destinatario: Number(req.user.id),
      titulo: "Vacante guardada",
      mensaje: `Guardaste ${vacante.titulo_puesto} para revisarla despues.`,
      tipo_notificacion: "sistema",
      enlace: `/views/usuario/detalleempleo/index.html?id=${vacante.id_vacante}`,
      metadata: { id_vacante: vacante.id_vacante }
    }).catch(() => null);

    res.status(201).json({
      mensaje: "Vacante guardada correctamente",
      data
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al guardar vacante",
      error: error.message
    });
  }
};

export const quitarVacanteGuardada = async (req, res) => {
  try {
    const { id_vacante } = req.params;
    const data = await deleteGuardado(req.user.id, id_vacante);

    if (!data) {
      return res.status(404).json({
        mensaje: "La vacante no estaba guardada"
      });
    }

    res.json({
      mensaje: "Vacante eliminada de guardados",
      data
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar la vacante guardada",
      error: error.message
    });
  }
};
