import {
  getEmpresasValorables,
  getValoracionesByEmpresa,
  getEmpresaValoracionDetalle,
  getValoracionesUsuario,
  existeValoracionUsuarioEmpresa,
  usuarioPuedeValorarEmpresa,
  createValoracion,
  getPromedioEmpresa
} from "../models/valoracionesModel.js";
import { crearNotificacion } from "../models/notificacionesModel.js";

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

    const empresa = await getEmpresaValoracionDetalle(id_empresa, idUsuario);
    const valoraciones = await getValoracionesByEmpresa(id_empresa);
    const resumen = await getPromedioEmpresa(id_empresa);

    if (!empresa) {
      return res.status(404).json({
        mensaje: "Empresa no encontrada"
      });
    }

    res.json({
      empresa,
      resumen,
      valoraciones
    });
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
        mensaje: "Ya valoraste a esta empresa"
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

