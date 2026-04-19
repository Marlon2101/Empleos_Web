import bcrypt from "bcryptjs";
import {
  getAdminUsuarios,
  getAdminEmpresas,
  createAdminEmpresa,
  getAdminVacantes,
  createAdminVacante,
  updateAdminVacante,
  updateAdminVacanteEstado,
  deleteAdminUsuario,
  deleteAdminEmpresa,
  deleteAdminVacante
} from "../models/adminModel.js";

const parseNullableNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

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

export const crearEmpresaAdmin = async (req, res) => {
  try {
    const {
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk,
      correo_electronico,
      contrasena
    } = req.body;

    if (!nombre_comercial || !correo_electronico || !contrasena) {
      return res.status(400).json({
        mensaje: "Nombre comercial, correo y contraseña son obligatorios"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(String(contrasena).trim(), salt);

    const empresa = await createAdminEmpresa({
      nombre_comercial: String(nombre_comercial).trim(),
      razon_social: razon_social?.trim() || null,
      sitio_web: sitio_web?.trim() || null,
      descripcion_empresa: descripcion_empresa?.trim() || null,
      id_municipio_fk: parseNullableNumber(id_municipio_fk),
      correo_electronico: String(correo_electronico).trim().toLowerCase(),
      contrasena: passwordEncriptada
    });

    res.status(201).json(empresa);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear empresa desde admin",
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

export const crearVacanteAdmin = async (req, res) => {
  try {
    const {
      id_empresa_fk,
      id_categoria_fk,
      titulo_puesto,
      descripcion_puesto,
      salario_offrecido,
      modalidad,
      id_municipio_fk,
      estado
    } = req.body;

    if (!id_empresa_fk || !id_categoria_fk || !titulo_puesto || !descripcion_puesto) {
      return res.status(400).json({
        mensaje: "Empresa, categoria, titulo y descripcion son obligatorios"
      });
    }

    const vacante = await createAdminVacante({
      id_empresa_fk: Number(id_empresa_fk),
      id_categoria_fk: Number(id_categoria_fk),
      titulo_puesto: String(titulo_puesto).trim(),
      descripcion_puesto: String(descripcion_puesto).trim(),
      salario_offrecido: parseNullableNumber(salario_offrecido),
      modalidad: modalidad?.trim() || null,
      id_municipio_fk: parseNullableNumber(id_municipio_fk),
      estado: estado?.trim() || "Activo"
    });

    res.status(201).json(vacante);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear vacante desde admin",
      error: error.message
    });
  }
};

export const actualizarVacanteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_empresa_fk,
      id_categoria_fk,
      titulo_puesto,
      descripcion_puesto,
      salario_offrecido,
      modalidad,
      id_municipio_fk,
      estado
    } = req.body;

    if (!id_empresa_fk || !id_categoria_fk || !titulo_puesto || !descripcion_puesto) {
      return res.status(400).json({
        mensaje: "Empresa, categoria, titulo y descripcion son obligatorios"
      });
    }

    const vacante = await updateAdminVacante(id, {
      id_empresa_fk: Number(id_empresa_fk),
      id_categoria_fk: Number(id_categoria_fk),
      titulo_puesto: String(titulo_puesto).trim(),
      descripcion_puesto: String(descripcion_puesto).trim(),
      salario_offrecido: parseNullableNumber(salario_offrecido),
      modalidad: modalidad?.trim() || null,
      id_municipio_fk: parseNullableNumber(id_municipio_fk),
      estado: estado?.trim() || "Activo"
    });

    if (!vacante) {
      return res.status(404).json({
        mensaje: "Vacante no encontrada"
      });
    }

    res.json(vacante);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar vacante desde admin",
      error: error.message
    });
  }
};

export const cambiarEstadoVacanteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({
        mensaje: "El estado es obligatorio"
      });
    }

    const vacante = await updateAdminVacanteEstado(id, estado);

    if (!vacante) {
      return res.status(404).json({
        mensaje: "Vacante no encontrada"
      });
    }

    res.json(vacante);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al cambiar el estado de la vacante",
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
