import {
  getPerfilUsuarioById,
  updatePerfilUsuarioById,
  getPerfilEmpresaById,
  updatePerfilEmpresaById
} from "../models/perfilModel.js";

const normalizarLista = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  return [];
};

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
      mensaje: "Tipo de usuario no valido"
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
      resumen_profesional,
      direccion,
      titulo_profesional,
      sitio_web,
      foto_perfil,
      habilidades,
      experiencia,
      educacion
    } = req.body;

    const perfilActualizado = await updatePerfilUsuarioById(req.user.id, {
      nombres: String(nombres || "").trim(),
      apellidos: String(apellidos || "").trim(),
      telefono: String(telefono || "").trim(),
      id_municipio_fk: id_municipio_fk ? Number(id_municipio_fk) : null,
      resumen_profesional: String(resumen_profesional || "").trim(),
      direccion: String(direccion || "").trim() || null,
      titulo_profesional: String(titulo_profesional || "").trim() || null,
      sitio_web: String(sitio_web || "").trim() || null,
      foto_perfil: foto_perfil || null,
      habilidades: normalizarLista(habilidades),
      experiencia: normalizarLista(experiencia),
      educacion: normalizarLista(educacion)
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

