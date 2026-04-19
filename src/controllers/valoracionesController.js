import {
  getEmpresasValorables,
  getValoracionesByEmpresa,
  getEmpresaValoracionDetalle,
  getValoracionesUsuario,
  getValoracionUsuarioEmpresa,
  existeValoracionUsuarioEmpresa,
  usuarioPuedeValorarEmpresa,
  createValoracion,
  updateValoracionUsuarioEmpresa,
  getPromedioEmpresa
} from "../models/valoracionesModel.js";
import { crearNotificacion } from "../models/notificacionesModel.js";

const cargarDetalleEmpresa = async (idEmpresa, idUsuario = null) => {
  const empresa = await getEmpresaValoracionDetalle(idEmpresa, idUsuario);

  if (!empresa) {
    return null;
  }

  const [valoraciones, resumen, miValoracion] = await Promise.all([
    getValoracionesByEmpresa(idEmpresa),
    getPromedioEmpresa(idEmpresa),
    idUsuario ? getValoracionUsuarioEmpresa(idUsuario, idEmpresa) : null
  ]);

  return {
    empresa,
    resumen,
    valoraciones,
    mi_valoracion: miValoracion
  };
};

export const obtenerEmpresasValorables = async (req, res) => {
  try {
    const idUsuario = req.user?.tipo === "usuario" ? req.user.id : null;
    const data = await getEmpresasValorables(idUsuario);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener las empresas valorables",
      error: error.message
    });
  }
};

export const obtenerValoracionesEmpresa = async (req, res) => {
  try {
    const { id_empresa } = req.params;
    const idUsuario = req.user?.tipo === "usuario" ? req.user.id : null;
    const detalle = await cargarDetalleEmpresa(id_empresa, idUsuario);

    if (!detalle) {
      return res.status(404).json({
        mensaje: "Empresa no encontrada"
      });
    }

    res.json(detalle);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener valoraciones de la empresa",
      error: error.message
    });
  }
};

export const obtenerMisValoraciones = async (req, res) => {
  try {
    const data = await getValoracionesUsuario(req.user.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener mis valoraciones",
      error: error.message
    });
  }
};

export const crearValoracion = async (req, res) => {
  try {
    const { id_empresa_fk, puntuacion, comentario } = req.body;

    const puedeValorar = await usuarioPuedeValorarEmpresa(req.user.id, id_empresa_fk);

    if (!puedeValorar) {
      return res.status(403).json({
        mensaje: "Solo puedes valorar empresas donde hayas postulado o trabajado"
      });
    }

    const existe = await existeValoracionUsuarioEmpresa(req.user.id, id_empresa_fk);

    if (existe) {
      return res.status(400).json({
        mensaje: "Ya valoraste a esta empresa. Puedes editar tu valoración."
      });
    }

    const data = await createValoracion({
      id_usuario_fk: req.user.id,
      id_empresa_fk,
      puntuacion,
      comentario
    });

    await crearNotificacion({
      tipo_usuario: "empresa",
      id_destinatario: Number(id_empresa_fk),
      titulo: "Nueva valoracion recibida",
      mensaje: "Un postulante dejo una nueva valoracion sobre tu empresa.",
      tipo_notificacion: "comentario",
      enlace: `/views/empresa/resenaempresa/index.html`
    }).catch(() => null);

    res.status(201).json({
      mensaje: "Valoracion creada correctamente",
      data
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear valoracion",
      error: error.message
    });
  }
};

export const actualizarMiValoracion = async (req, res) => {
  try {
    const { id_empresa } = req.params;
    const { puntuacion, comentario } = req.body;

    const existente = await getValoracionUsuarioEmpresa(req.user.id, id_empresa);

    if (!existente) {
      return res.status(404).json({
        mensaje: "No tienes una valoracion previa para esta empresa"
      });
    }

    const data = await updateValoracionUsuarioEmpresa(req.user.id, id_empresa, {
      puntuacion,
      comentario
    });

    res.json({
      mensaje: "Valoracion actualizada correctamente",
      data
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar la valoracion",
      error: error.message
    });
  }
};

