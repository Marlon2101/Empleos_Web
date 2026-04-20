import {
  getAllPostulaciones,
  getPostulacionById,
  getPostulacionesByUsuario,
  getPostulacionesByVacante,
  createPostulacion,
  updatePostulacion,
  deletePostulacion,
  existePostulacion,
  getPostulacionesByEmpresa
} from "../models/postulacionesModel.js";
import { getVacanteById } from "../models/vacantesModel.js";
import { crearNotificacion } from "../models/notificacionesModel.js";

const crearNotificacionPostulacion = async (payload) => {
  try {
    await crearNotificacion(payload);
  } catch (error) {
    console.error("No se pudo crear la notificacion:", error.message);
  }
};

export const obtenerPostulaciones = async (req, res) => {
  try {
    const data = await getAllPostulaciones();
    res.json(data);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener postulaciones", error: error.message });
  }
};

export const obtenerPostulacionesPorUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const data = await getPostulacionesByUsuario(id_usuario);
    res.json(data);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener postulaciones del usuario", error: error.message });
  }
};

export const obtenerPostulacionesPorVacante = async (req, res) => {
  try {
    const { id_vacante } = req.params;
    const data = await getPostulacionesByVacante(id_vacante);
    res.json(data);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener postulaciones de la vacante", error: error.message });
  }
};

export const crearPostulacion = async (req, res) => {
  try {
    const { id_usuario_fk, id_vacante_fk, id_estado_fk } = req.body;
    const yaExiste = await existePostulacion(id_usuario_fk, id_vacante_fk);

    if (yaExiste) {
      return res.status(400).json({ mensaje: "El usuario ya se postulo a esta vacante" });
    }

    const nuevaPostulacion = await createPostulacion({ id_usuario_fk, id_vacante_fk, id_estado_fk });
    const vacante = await getVacanteById(id_vacante_fk);

    if (vacante) {
      await crearNotificacionPostulacion({
        tipo_usuario: "usuario",
        id_destinatario: Number(id_usuario_fk),
        titulo: "Postulacion enviada",
        mensaje: `Te has postulado a ${vacante.titulo_puesto}.`,
        tipo_notificacion: "postulacion",
        enlace: `/views/usuario/detalleempleo/index.html?id=${vacante.id_vacante}`,
        metadata: {
          id_vacante: vacante.id_vacante,
          id_empresa: vacante.id_empresa_fk
        }
      });

      if (vacante.id_empresa_fk) {
        await crearNotificacionPostulacion({
          tipo_usuario: "empresa",
          id_destinatario: Number(vacante.id_empresa_fk),
          titulo: "Nueva postulacion recibida",
          mensaje: `Recibiste una nueva postulacion para ${vacante.titulo_puesto}.`,
          tipo_notificacion: "postulacion",
          enlace: `/views/empresa/detallepostulacion/index.html?id=${nuevaPostulacion.id_postulacion}`,
          metadata: {
            id_postulacion: nuevaPostulacion.id_postulacion,
            id_vacante: vacante.id_vacante,
            id_usuario: Number(id_usuario_fk)
          }
        });
      }
    }

    res.status(201).json(nuevaPostulacion);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear postulacion", error: error.message });
  }
};

export const eliminarPostulacion = async (req, res) => {
  try {
    const { id } = req.params;
    const postulacionEliminada = await deletePostulacion(id);

    if (!postulacionEliminada) {
      return res.status(404).json({ mensaje: "Postulacion no encontrada" });
    }

    res.json({ mensaje: "Postulacion eliminada correctamente", postulacion: postulacionEliminada });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar postulacion", error: error.message });
  }
};

export const obtenerPostulacionesEmpresa = async (req, res) => {
  try {
    const postulaciones = await getPostulacionesByEmpresa(req.user.id);
    res.json(postulaciones);
  } catch (error) {
    console.error("Error BD:", error);
    res.status(500).json({ mensaje: "Error al obtener postulaciones", error: error.message });
  }
};

export const actualizarPostulacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_estado_fk } = req.body;

    const postulacionActual = await getPostulacionById(id);

    if (!postulacionActual) {
      return res.status(404).json({
        mensaje: "Postulacion no encontrada"
      });
    }

    const vacante = await getVacanteById(postulacionActual.id_vacante_fk);

    if (!vacante || (req.user.tipo === "empresa" && Number(vacante.id_empresa_fk) !== Number(req.user.id))) {
      return res.status(403).json({
        mensaje: "No puedes actualizar una postulacion de otra empresa"
      });
    }

    const postulacion = await updatePostulacion(id, { id_estado_fk });

    if (!postulacion) {
      return res.status(404).json({
        mensaje: "Postulacion no encontrada"
      });
    }

    if (vacante) {
      if (Number(id_estado_fk) === 4) {
        await crearNotificacionPostulacion({
          tipo_usuario: "usuario",
          id_destinatario: Number(postulacionActual.id_usuario_fk),
          titulo: "Postulacion rechazada",
          mensaje: `Tu postulacion a ${vacante.titulo_puesto} fue rechazada.`,
          tipo_notificacion: "estado",
          enlace: `/views/usuario/detalleempleo/index.html?id=${vacante.id_vacante}`
        });
      }

      if ([3, 5].includes(Number(id_estado_fk))) {
        await crearNotificacionPostulacion({
          tipo_usuario: "usuario",
          id_destinatario: Number(postulacionActual.id_usuario_fk),
          titulo: "Postulacion aceptada",
          mensaje: `Felicidades, tu postulacion a ${vacante.titulo_puesto} fue aceptada.`,
          tipo_notificacion: "estado",
          enlace: `/views/usuario/detalleempleo/index.html?id=${vacante.id_vacante}`
        });
      }
    }

    res.status(200).json({
      mensaje: "Estado actualizado con exito en el servidor",
      id_postulacion: id,
      id_estado_fk
    });
  } catch (error) {
    console.error("Error al actualizar la postulacion:", error);
    res.status(500).json({
      mensaje: "Error al actualizar la postulacion",
      error: error.message
    });
  }
};
