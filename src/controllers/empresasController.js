import {
  getAllEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa
} from "../models/empresasModel.js";

export const obtenerEmpresas = async (req, res) => {
  try {
    const data = await getAllEmpresas();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener empresas",
      error: error.message
    });
  }
};

export const obtenerEmpresaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await getEmpresaById(id);

    if (!empresa) {
      return res.status(404).json({
        mensaje: "Empresa no encontrada"
      });
    }

    res.json(empresa);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener empresa",
      error: error.message
    });
  }
};

export const crearEmpresa = async (req, res) => {
  try {
    const {
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk
    } = req.body;

    const nuevaEmpresa = await createEmpresa({
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk
    });

    res.status(201).json(nuevaEmpresa);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear empresa",
      error: error.message
    });
  }
};

export const actualizarEmpresa = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk
    } = req.body;

    const empresaActualizada = await updateEmpresa(id, {
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk
    });

    if (!empresaActualizada) {
      return res.status(404).json({
        mensaje: "Empresa no encontrada"
      });
    }

    res.json(empresaActualizada);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar empresa",
      error: error.message
    });
  }
};

export const eliminarEmpresa = async (req, res) => {
  try {
    const { id } = req.params;
    const empresaEliminada = await deleteEmpresa(id);

    if (!empresaEliminada) {
      return res.status(404).json({
        mensaje: "Empresa no encontrada"
      });
    }

    res.json({
      mensaje: "Empresa eliminada correctamente",
      empresa: empresaEliminada
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar empresa",
      error: error.message
    });
  }
};