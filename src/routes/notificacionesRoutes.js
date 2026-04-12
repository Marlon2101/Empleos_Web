import { Router } from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import {
  obtenerMisNotificaciones,
  crearNotificacionManual,
  marcarLeida,
  marcarTodas
} from "../controllers/notificacionesController.js";

const router = Router();

router.get("/", verificarToken, obtenerMisNotificaciones);
router.post("/", verificarToken, crearNotificacionManual);
router.put("/:id/leida", verificarToken, marcarLeida);
router.put("/marcar-todas/leidas", verificarToken, marcarTodas);

export default router;