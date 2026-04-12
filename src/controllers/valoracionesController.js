import {
  getValoracionesByEmpresa,
  getValoracionesUsuario,
  existeValoracionUsuarioEmpresa,
  createValoracion,
  getPromedioEmpresa
} from "../models/valoracionesModel.js";

export const obtenerValoracionesEmpresa = async (req, res) => {
  try {
    const { id_empresa } = req.params;

    const valoraciones = await getValoracionesByEmpresa(id_empresa);
    const resumen = await getPromedioEmpresa(id_empresa);

    res.json({
      resumen,
      valoraciones
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener valoraciones de la empresa",
      error: error.message
    });
  }
};

export const obtenerMisValoraciones = async (req, res) => {
  try {
    const data = await getValoracionesUsuario(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener mis valoraciones",
      error: error.message
    });
  }
};

export const crearValoracion = async (req, res) => {
  try {
    const { id_empresa_fk, puntuacion, comentario } = req.body;

    const existe = await existeValoracionUsuarioEmpresa(req.user.id, id_empresa_fk);

    if (existe) {
      return res.status(400).json({
        mensaje: "Ya valoraste a esta empresa"
      });
    }

    const data = await createValoracion({
      id_usuario_fk: req.user.id,
      id_empresa_fk,
      puntuacion,
      comentario
    });

    res.status(201).json({
      mensaje: "Valoración creada correctamente",
      data
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear valoración",
      error: error.message
    });
  }
};