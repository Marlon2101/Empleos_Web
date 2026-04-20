import {
  getPostulacionesResenablesByEmpresa,
  getResenasPostulantesByEmpresa,
  getResenasExternasSobreMisPostulantes,
  getResumenResenasPostulantesByEmpresa,
  getPostulacionResenableByEmpresa,
  upsertResenaPostulante
} from "../models/resenasPostulantesModel.js";
import {
  getValoracionesByEmpresa,
  getPromedioEmpresa
} from "../models/valoracionesModel.js";

export const obtenerPanelResenasPostulantes = async (req, res) => {
  try {
    const [
      postulaciones,
      resenas,
      resumen,
      resenasExternas,
      valoracionesEmpresa,
      resumenValoracionesEmpresa
    ] = await Promise.all([
      getPostulacionesResenablesByEmpresa(req.user.id),
      getResenasPostulantesByEmpresa(req.user.id),
      getResumenResenasPostulantesByEmpresa(req.user.id),
      getResenasExternasSobreMisPostulantes(req.user.id),
      getValoracionesByEmpresa(req.user.id),
      getPromedioEmpresa(req.user.id)
    ]);

    res.json({
      postulaciones,
      resenas,
      resumen,
      resenas_externas: resenasExternas,
      valoraciones_empresa: valoracionesEmpresa,
      resumen_empresa: {
        promedio: Number(resumenValoracionesEmpresa?.promedio || 0),
        total_valoraciones: Number(resumenValoracionesEmpresa?.total_valoraciones || 0)
      }
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
