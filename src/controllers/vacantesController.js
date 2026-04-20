import {
  getAllVacantes,
  getVacanteById,
  getVacantesByEmpresa,
  createVacante,
  updateVacante,
  deleteVacante,
  getVacanteSimpleById,
  buscarVacantesConFiltros,
  getDetalleVacanteById,
  getVacantesSimilaresById
} from "../models/vacantesModel.js";
import { usuarioYaPostulado } from "../models/postulacionesModel.js";
import { getGuardadoByUsuarioVacante } from "../models/guardadosModel.js";

export const obtenerVacantes = async (req, res) => {
  try {
    const data = await getAllVacantes();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener vacantes",
      error: error.message
    });
  }
};

export const obtenerVacantePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const vacante = await getVacanteById(id);

    if (!vacante) {
      return res.status(404).json({
        mensaje: "Vacante no encontrada"
      });
    }

    res.json(vacante);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener vacante",
      error: error.message
    });
  }
};

export const obtenerVacantesPorEmpresa = async (req, res) => {
  try {
    const { id_empresa } = req.params;
    const data = await getVacantesByEmpresa(id_empresa);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener vacantes de la empresa",
      error: error.message
    });
  }
};

export const obtenerMisVacantes = async (req, res) => {
  try {
    const data = await getVacantesByEmpresa(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener tus vacantes",
      error: error.message
    });
  }
};

export const crearVacante = async (req, res) => {
  try {
    const {
      id_categoria_fk,
      titulo_puesto,
      descripcion_puesto,
      responsabilidades,
      requisitos,
      salario_offrecido,
      modalidad,
      tipo_contrato,
      educacion,
      idiomas,
      id_municipio_fk
    } = req.body;

    const nuevaVacante = await createVacante({
      id_empresa_fk: req.user.id,
      id_categoria_fk,
      titulo_puesto,
      descripcion_puesto,
      responsabilidades,
      requisitos,
      salario_offrecido,
      modalidad,
      tipo_contrato,
      educacion,
      idiomas,
      id_municipio_fk
    });

    res.status(201).json(nuevaVacante);
  } catch (error) {
    console.log("ERROR CRITICO AL CREAR VACANTE:", error);
    res.status(500).json({
      mensaje: "Error al crear vacante",
      error: error.message
    });
  }
};

export const actualizarVacante = async (req, res) => {
  try {
    const { id } = req.params;
    const vacante = await getVacanteSimpleById(id);

    if (!vacante) {
      return res.status(404).json({
        mensaje: "Vacante no encontrada"
      });
    }

    if (req.user.tipo === "empresa" && vacante.id_empresa_fk !== req.user.id) {
      return res.status(403).json({
        mensaje: "No puedes editar una vacante de otra empresa"
      });
    }

    const {
      id_categoria_fk,
      titulo_puesto,
      descripcion_puesto,
      responsabilidades,
      requisitos,
      salario_offrecido,
      modalidad,
      tipo_contrato,
      educacion,
      idiomas,
      id_municipio_fk
    } = req.body;

    const vacanteActualizada = await updateVacante(id, {
      id_empresa_fk: vacante.id_empresa_fk,
      id_categoria_fk,
      titulo_puesto,
      descripcion_puesto,
      responsabilidades,
      requisitos,
      salario_offrecido,
      modalidad,
      tipo_contrato,
      educacion,
      idiomas,
      id_municipio_fk
    });

    res.json(vacanteActualizada);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar vacante",
      error: error.message
    });
  }
};

export const eliminarVacante = async (req, res) => {
  try {
    const { id } = req.params;
    const vacante = await getVacanteSimpleById(id);

    if (!vacante) {
      return res.status(404).json({
        mensaje: "Vacante no encontrada"
      });
    }

    if (req.user.tipo === "empresa" && vacante.id_empresa_fk !== req.user.id) {
      return res.status(403).json({
        mensaje: "No puedes eliminar una vacante de otra empresa"
      });
    }

    const vacanteEliminada = await deleteVacante(id);

    res.json({
      mensaje: "Vacante eliminada correctamente",
      vacante: vacanteEliminada
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar vacante",
      error: error.message
    });
  }
};

export const buscarVacantes = async (req, res) => {
  try {
    const { q, ubicacion, tipo, experiencia, min, max, fecha } = req.query;

    const data = await buscarVacantesConFiltros({
      titulo: q,
      ubicacion,
      tipo,
      experiencia,
      min,
      max,
      fecha
    });

    res.json(data);
  } catch (error) {
    console.error("Error en buscarVacantes:", error);
    res.status(500).json({
      mensaje: "Error al buscar vacantes",
      error: error.message
    });
  }
};

export const obtenerDetalleVacante = async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({ mensaje: "ID de vacante invalido" });
    }

    const vacante = await getDetalleVacanteById(id);

    if (!vacante) {
      return res.status(404).json({
        mensaje: "Vacante no encontrada"
      });
    }

    let postulacion = null;
    let yaPostulado = false;
    let yaGuardado = false;

    try {
      if (req.user && req.user.tipo === "usuario") {
        postulacion = await usuarioYaPostulado(req.user.id, id);
        yaPostulado = Boolean(postulacion);
        yaGuardado = Boolean(await getGuardadoByUsuarioVacante(req.user.id, id));
      }
    } catch (dbError) {
      console.error(`Error verificando interacciones del usuario ${req.user?.id} en vacante ${id}:`, dbError);
      yaPostulado = false;
      yaGuardado = false;
    }

    res.json({
      vacante,
      yaPostulado,
      yaGuardado,
      postulacion
    });
  } catch (error) {
    console.error("Error fatal en obtenerDetalleVacante:", error);
    res.status(500).json({
      mensaje: "Error al obtener detalle de vacante",
      error: error.message
    });
  }
};

export const obtenerVacantesSimilares = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getVacantesSimilaresById(id, req.query.limit || 3);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener vacantes similares",
      error: error.message
    });
  }
};
