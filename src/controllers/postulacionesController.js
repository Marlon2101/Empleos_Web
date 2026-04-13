import {
  getAllPostulaciones,
  getPostulacionesByUsuario,
  getPostulacionesByVacante,
  createPostulacion,
  updatePostulacion,
  deletePostulacion,
  existePostulacion,
  getPostulacionesByEmpresa // <-- Importamos la función del modelo
} from "../models/postulacionesModel.js";

import { getVacanteById } from "../models/vacantesModel.js";
import { crearNotificacion } from "../models/notificacionesModel.js";

export const obtenerPostulaciones = async (req, res) => {
  try {
    const data = await getAllPostulaciones();
    res.json(data);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener postulaciones", error: error.message });
  }
};

export const obtenerPostulacionesPorUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const data = await getPostulacionesByUsuario(id_usuario);
    res.json(data);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener postulaciones del usuario", error: error.message });
  }
};

export const obtenerPostulacionesPorVacante = async (req, res) => {
  try {
    const { id_vacante } = req.params;
    const data = await getPostulacionesByVacante(id_vacante);
    res.json(data);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener postulaciones de la vacante", error: error.message });
  }
};

export const crearPostulacion = async (req, res) => {
  try {
    const { id_usuario_fk, id_vacante_fk, id_estado_fk } = req.body;
    const yaExiste = await existePostulacion(id_usuario_fk, id_vacante_fk);

    if (yaExiste) {
      return res.status(400).json({ mensaje: "El usuario ya se postuló a esta vacante" });
    }

    const nuevaPostulacion = await createPostulacion({ id_usuario_fk, id_vacante_fk, id_estado_fk });
    res.status(201).json(nuevaPostulacion);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear postulación", error: error.message });
  }
};

export const eliminarPostulacion = async (req, res) => {
  try {
    const { id } = req.params;
    const postulacionEliminada = await deletePostulacion(id);

    if (!postulacionEliminada) {
      return res.status(404).json({ mensaje: "Postulación no encontrada" });
    }
    res.json({ mensaje: "Postulación eliminada correctamente", postulacion: postulacionEliminada });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar postulación", error: error.message });
  }
};

// ==========================================
// 🚀 1. FUNCIÓN OBTENER POSTULACIONES EMPRESA (Bypass)
// ==========================================
export const obtenerPostulacionesEmpresa = async (req, res) => {
    try {
        const id_empresa = 1; // HACK: Forzamos la empresa 1

        // Llamamos al Modelo para que haga el trabajo sucio en MySQL
        const postulaciones = await getPostulacionesByEmpresa(id_empresa);
        
        res.json(postulaciones); 
    } catch (error) {
        console.error("Error BD:", error);
        res.status(500).json({ mensaje: "Error al obtener postulaciones", error: error.message });
    }
};

// ==========================================
// 🚀 2. FUNCIÓN PARA ACTUALIZAR EL ESTADO (El PUT del <select>)
// ==========================================
export const actualizarPostulacion = async (req, res) => {
    try {
        const { id } = req.params; 
        const { id_estado_fk } = req.body; 

        // Llama a tu función original de update para guardarlo en la base de datos
        await updatePostulacion(id, { id_estado_fk });

        console.log(`Backend recibió la orden: Cambiar postulación ${id} al estado ${id_estado_fk}`);

        res.status(200).json({ 
            mensaje: "Estado actualizado con éxito en el servidor",
            id_postulacion: id,
            id_estado_fk: id_estado_fk
        });

    } catch (error) {
        console.error("Error al actualizar la postulación:", error);
        res.status(500).json({ 
            mensaje: "Error al actualizar la postulación", 
            error: error.message 
        });
    }
};