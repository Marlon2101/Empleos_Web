import { getAllUser, getById, createUser, updateUser,deleteUser } from "../models/usersModel.js";

export const getObtenerTodosLosUsuarios = async (req, res) => {
  try {
    const result = await getAllUser();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener los usuarios",
      error: error.message
    });
  }
};

export const getObtenerPorElId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await getById(id);

    if (!usuario) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener al usuario",
      error: error.message
    });
  }
};

export const postCrearUsuario = async (req, res) => {
  try {
    const {
      nombres,
      apellidos,
      correo_electronico,
      contrasena,
      telefono,
      id_municipio_fk,
      resumen_profesional
    } = req.body;

    const nuevoUsuario = await createUser({
      nombres,
      apellidos,
      correo_electronico,
      contrasena,
      telefono,
      id_municipio_fk,
      resumen_profesional
    });

    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear el usuario",
      error: error.message
    });
  }
};

export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nombres,
      apellidos,
      correo_electronico,
      contrasena,
      telefono,
      id_municipio_fk,
      resumen_profesional
    } = req.body;

    const usuarioActualizado = await updateUser(id, {
      nombres,
      apellidos,
      correo_electronico,
      contrasena,
      telefono,
      id_municipio_fk,
      resumen_profesional
    });

    if (!usuarioActualizado) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    res.json(usuarioActualizado);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar el usuario",
      error: error.message
    });
  }
};



export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuarioEliminado = await deleteUser(id);

    if (!usuarioEliminado) {
      return res.status(404).json({
        mensaje: "Usuario no encontrado"
      });
    }

    res.json({
      mensaje: "Usuario eliminado correctamente",
      usuario: usuarioEliminado
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar el usuario",
      error: error.message
    });
  }
};