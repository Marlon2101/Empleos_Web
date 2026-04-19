import { Router } from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import {
  obtenerMisNotificaciones,
  obtenerResumenNotificaciones,
  crearNotificacionManual,
  marcarLeida,
  marcarNoLeida,
  marcarTodas,
  eliminar
} from "../controllers/notificacionesController.js";

const router = Router();

router.get("/", verificarToken, obtenerMisNotificaciones);
router.get("/resumen", verificarToken, obtenerResumenNotificaciones);
router.post("/", verificarToken, crearNotificacionManual);
router.put("/:id/leida", verificarToken, marcarLeida);
router.put("/:id/leer", verificarToken, marcarLeida);
router.put("/:id/no-leida", verificarToken, marcarNoLeida);
router.put("/marcar-todas/leidas", verificarToken, marcarTodas);
router.delete("/:id", verificarToken, eliminar);

export default router;

