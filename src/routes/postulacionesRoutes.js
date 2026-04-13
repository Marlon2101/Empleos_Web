import { Router } from "express";
import {
  obtenerPostulaciones,
  obtenerPostulacionesPorUsuario,
  obtenerPostulacionesPorVacante,
  obtenerPostulacionesEmpresa, 
  crearPostulacion,
  actualizarPostulacion,
  eliminarPostulacion
} from "../controllers/postulacionesController.js";

const router = Router();

// ==========================================
// 🚨 BYPASS TEMPORAL (Rutas sin token) 🚨
// ==========================================
router.get("/empresa", obtenerPostulacionesEmpresa);
router.put("/:id/estado", actualizarPostulacion); 

// ==========================================
// RUTAS ORIGINALES (Sin protección temporal)
// ==========================================
router.get("/", obtenerPostulaciones);
router.get("/usuario/:id_usuario", obtenerPostulacionesPorUsuario);
router.get("/vacante/:id_vacante", obtenerPostulacionesPorVacante);
router.post("/", crearPostulacion);
router.delete("/:id", eliminarPostulacion);

export default router;