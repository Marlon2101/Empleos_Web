import {
  getDepartamentos,
  getMunicipios,
  getMunicipiosByDepartamento,
  getCategorias,
  getHabilidades,
  getEstadosPostulacion
} from "../models/catalogosModel.js";

export const obtenerDepartamentos = async (req, res) => {
  try {
    const data = await getDepartamentos();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener departamentos",
      error: error.message
    });
  }
};

export const obtenerMunicipios = async (req, res) => {
  try {
    const data = await getMunicipios();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener municipios",
      error: error.message
    });
  }
};

export const obtenerMunicipiosPorDepartamento = async (req, res) => {
  try {
    const { id_departamento } = req.params;
    const data = await getMunicipiosByDepartamento(id_departamento);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener municipios por departamento",
      error: error.message
    });
  }
};

export const obtenerCategorias = async (req, res) => {
  try {
    const data = await getCategorias();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener categorías",
      error: error.message
    });
  }
};

export const obtenerHabilidades = async (req, res) => {
  try {
    const data = await getHabilidades();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener habilidades",
      error: error.message
    });
  }
};

export const obtenerEstadosPostulacion = async (req, res) => {
  try {
    const data = await getEstadosPostulacion();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener estados de postulación",
      error: error.message
    });
  }
};