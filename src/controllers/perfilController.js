import {
  getPerfilUsuarioById,
  updatePerfilUsuarioById,
  getPerfilEmpresaById,
  updatePerfilEmpresaById
} from "../models/perfilModel.js";

export const obtenerMiPerfil = async (req, res) => {
  try {
    if (req.user.tipo === "usuario") {
      const perfil = await getPerfilUsuarioById(req.user.id);

      if (!perfil) {
        return res.status(404).json({
          mensaje: "Perfil de usuario no encontrado"
        });
      }

      return res.json({
        tipo: "usuario",
        data: perfil
      });
    }

    if (req.user.tipo === "empresa") {
      const perfil = await getPerfilEmpresaById(req.user.id);

      if (!perfil) {
        return res.status(404).json({
          mensaje: "Perfil de empresa no encontrado"
        });
      }

      return res.json({
        tipo: "empresa",
        data: perfil
      });
    }

    return res.status(400).json({
      mensaje: "Tipo de usuario no válido"
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener perfil",
      error: error.message
    });
  }
};

export const obtenerPerfilUsuario = async (req, res) => {
  try {
    const perfil = await getPerfilUsuarioById(req.user.id);

    if (!perfil) {
      return res.status(404).json({
        mensaje: "Perfil de usuario no encontrado"
      });
    }

    res.json(perfil);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener perfil de usuario",
      error: error.message
    });
  }
};

export const actualizarPerfilUsuario = async (req, res) => {
  try {
    const {
      nombres,
      apellidos,
      telefono,
      id_municipio_fk,
      resumen_profesional
    } = req.body;

    const perfilActualizado = await updatePerfilUsuarioById(req.user.id, {
      nombres,
      apellidos,
      telefono,
      id_municipio_fk,
      resumen_profesional
    });

    if (!perfilActualizado) {
      return res.status(404).json({
        mensaje: "Perfil de usuario no encontrado"
      });
    }

    res.json({
      mensaje: "Perfil de usuario actualizado correctamente",
      data: perfilActualizado
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar perfil de usuario",
      error: error.message
    });
  }
};

export const obtenerPerfilEmpresa = async (req, res) => {
  try {
    const perfil = await getPerfilEmpresaById(req.user.id);

    if (!perfil) {
      return res.status(404).json({
        mensaje: "Perfil de empresa no encontrado"
      });
    }

    res.json(perfil);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener perfil de empresa",
      error: error.message
    });
  }
};

export const actualizarPerfilEmpresa = async (req, res) => {
  try {
    const {
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk
    } = req.body;

    const perfilActualizado = await updatePerfilEmpresaById(req.user.id, {
      nombre_comercial,
      razon_social,
      sitio_web,
      descripcion_empresa,
      id_municipio_fk
    });

    if (!perfilActualizado) {
      return res.status(404).json({
        mensaje: "Perfil de empresa no encontrado"
      });
    }

    res.json({
      mensaje: "Perfil de empresa actualizado correctamente",
      data: perfilActualizado
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar perfil de empresa",
      error: error.message
    });
  }
};