import {
  getPostulacionesResenablesByEmpresa,
  getResenasPostulantesByEmpresa,
  getResumenResenasPostulantesByEmpresa,
  getPostulacionResenableByEmpresa,
  upsertResenaPostulante
} from "../models/resenasPostulantesModel.js";

export const obtenerPanelResenasPostulantes = async (req, res) => {
  try {
    const [postulaciones, resenas, resumen] = await Promise.all([
      getPostulacionesResenablesByEmpresa(req.user.id),
      getResenasPostulantesByEmpresa(req.user.id),
      getResumenResenasPostulantesByEmpresa(req.user.id)
    ]);

    res.json({
      postulaciones,
      resenas,
      resumen
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener las reseñas de postulantes",
      error: error.message
    });
  }
};

export const guardarResenaPostulante = async (req, res) => {
  try {
    const {
      id_postulacion_fk,
      puntuacion,
      comentario,
      etiquetas = []
    } = req.body;

    const postulacion = await getPostulacionResenableByEmpresa(req.user.id, Number(id_postulacion_fk));

    if (!postulacion) {
      return res.status(404).json({
        mensaje: "La postulacion no pertenece a tu empresa"
      });
    }

    const resena = await upsertResenaPostulante({
      id_empresa_fk: req.user.id,
      id_usuario_fk: postulacion.id_usuario_fk,
      id_postulacion_fk: postulacion.id_postulacion,
      puntuacion: Number(puntuacion),
      comentario: String(comentario || "").trim(),
      etiquetas: Array.isArray(etiquetas) ? etiquetas.filter(Boolean) : []
    });

    res.json({
      mensaje: "Reseña guardada correctamente",
      data: resena
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al guardar la reseña del postulante",
      error: error.message
    });
  }
};
