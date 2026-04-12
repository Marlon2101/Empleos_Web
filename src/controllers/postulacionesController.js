import {
  getAllPostulaciones,
  getPostulacionesByUsuario,
  getPostulacionesByVacante,
  createPostulacion,
  updatePostulacion,
  deletePostulacion,
  existePostulacion
} from "../models/postulacionesModel.js";

import { getVacanteById } from "../models/vacantesModel.js";
import { crearNotificacion } from "../models/notificacionesModel.js";

export const obtenerPostulaciones = async (req, res) => {
  try {
    const data = await getAllPostulaciones();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener postulaciones",
      error: error.message
    });
  }
};

export const obtenerPostulacionesPorUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const data = await getPostulacionesByUsuario(id_usuario);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener postulaciones del usuario",
      error: error.message
    });
  }
};

export const obtenerPostulacionesPorVacante = async (req, res) => {
  try {
    const { id_vacante } = req.params;
    const data = await getPostulacionesByVacante(id_vacante);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener postulaciones de la vacante",
      error: error.message
    });
  }
};

export const crearPostulacion = async (req, res) => {
  try {
    const {
      id_usuario_fk,
      id_vacante_fk,
      id_estado_fk
    } = req.body;

    const yaExiste = await existePostulacion(id_usuario_fk, id_vacante_fk);

    if (yaExiste) {
      return res.status(400).json({
        mensaje: "El usuario ya se postuló a esta vacante"
      });
    }

    const nuevaPostulacion = await createPostulacion({
      id_usuario_fk,
      id_vacante_fk,
      id_estado_fk
    });

    const postulacionesVacante = await getPostulacionesByVacante(id_vacante_fk);

    let nombreUsuario = "Un usuario";
    if (postulacionesVacante.length > 0) {
      const encontrada = postulacionesVacante.find(
        p => Number(p.id_usuario_fk) === Number(id_usuario_fk)
      );
      if (encontrada) {
        nombreUsuario = encontrada.nombre_usuario;
      }
    }

    const vacante = await getVacanteById(id_vacante_fk);

    if (vacante) {
      await crearNotificacion({
        tipo_usuario: "empresa",
        id_destinatario: vacante.id_empresa_fk,
        titulo: "Nueva postulación recibida",
        mensaje: `${nombreUsuario} se postuló a la vacante "${vacante.titulo_puesto}".`
      });
    }

    res.status(201).json(nuevaPostulacion);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear postulación",
      error: error.message
    });
  }
};

export const actualizarPostulacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_estado_fk } = req.body;

    const postulacionActualizada = await updatePostulacion(id, {
      id_estado_fk
    });

    if (!postulacionActualizada) {
      return res.status(404).json({
        mensaje: "Postulación no encontrada"
      });
    }

    let nombreEstado = "actualizado";
    if (Number(id_estado_fk) === 1) nombreEstado = "Recibida";
    if (Number(id_estado_fk) === 2) nombreEstado = "En Revisión";
    if (Number(id_estado_fk) === 3) nombreEstado = "Entrevista";
    if (Number(id_estado_fk) === 4) nombreEstado = "Rechazada";
    if (Number(id_estado_fk) === 5) nombreEstado = "Contratado";

    await crearNotificacion({
      tipo_usuario: "usuario",
      id_destinatario: postulacionActualizada.id_usuario_fk,
      titulo: "Estado de postulación actualizado",
      mensaje: `El estado de tu postulación cambió a "${nombreEstado}".`
    });

    res.json(postulacionActualizada);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar postulación",
      error: error.message
    });
  }
};

export const eliminarPostulacion = async (req, res) => {
  try {
    const { id } = req.params;
    const postulacionEliminada = await deletePostulacion(id);

    if (!postulacionEliminada) {
      return res.status(404).json({
        mensaje: "Postulación no encontrada"
      });
    }

    res.json({
      mensaje: "Postulación eliminada correctamente",
      postulacion: postulacionEliminada
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar postulación",
      error: error.message
    });
  }
};