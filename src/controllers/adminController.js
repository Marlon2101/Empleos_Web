import {
  getAdminUsuarios,
  getAdminEmpresas,
  getAdminVacantes,
  deleteAdminUsuario,
  deleteAdminEmpresa,
  deleteAdminVacante
} from "../models/adminModel.js";

export const obtenerUsuariosAdmin = async (req, res) => {
  try {
    const data = await getAdminUsuarios();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener usuarios para admin",
      error: error.message
    });
  }
};

export const obtenerEmpresasAdmin = async (req, res) => {
  try {
    const data = await getAdminEmpresas();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener empresas para admin",
      error: error.message
    });
  }
};

export const obtenerVacantesAdmin = async (req, res) => {
  try {
    const data = await getAdminVacantes();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener vacantes para admin",
      error: error.message
    });
  }
};

export const eliminarUsuarioAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await deleteAdminUsuario(id);

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    res.json({
      mensaje: "Usuario eliminado correctamente",
      data: usuario
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar usuario",
      error: error.message
    });
  }
};

export const eliminarEmpresaAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const empresa = await deleteAdminEmpresa(id);

    if (!empresa) {
      return res.status(404).json({
        mensaje: "Empresa no encontrada"
      });
    }

    res.json({
      mensaje: "Empresa eliminada correctamente",
      data: empresa
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar empresa",
      error: error.message
    });
  }
};

export const eliminarVacanteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const vacante = await deleteAdminVacante(id);

    if (!vacante) {
      return res.status(404).json({
        mensaje: "Vacante no encontrada"
      });
    }

    res.json({
      mensaje: "Vacante eliminada correctamente",
      data: vacante
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar vacante",
      error: error.message
    });
  }
};