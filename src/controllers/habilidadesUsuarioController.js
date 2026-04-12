import {
  getHabilidadesByUsuario,
  existeHabilidadUsuario,
  agregarHabilidadUsuario,
  eliminarHabilidadUsuario
} from "../models/habilidadesUsuarioModel.js";

export const obtenerMisHabilidades = async (req, res) => {
  try {
    const data = await getHabilidadesByUsuario(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener habilidades del usuario",
      error: error.message
    });
  }
};

export const agregarMiHabilidad = async (req, res) => {
  try {
    const { id_habilidad_fk } = req.body;

    const existe = await existeHabilidadUsuario(req.user.id, id_habilidad_fk);

    if (existe) {
      return res.status(400).json({
        mensaje: "La habilidad ya está agregada al usuario"
      });
    }

    const data = await agregarHabilidadUsuario(req.user.id, id_habilidad_fk);

    res.status(201).json({
      mensaje: "Habilidad agregada correctamente",
      data
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al agregar habilidad al usuario",
      error: error.message
    });
  }
};

export const eliminarMiHabilidad = async (req, res) => {
  try {
    const { id_habilidad } = req.params;

    const data = await eliminarHabilidadUsuario(req.user.id, id_habilidad);

    if (!data) {
      return res.status(404).json({
        mensaje: "La habilidad no está asociada al usuario"
      });
    }

    res.json({
      mensaje: "Habilidad eliminada correctamente",
      data
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar habilidad del usuario",
      error: error.message
    });
  }
};