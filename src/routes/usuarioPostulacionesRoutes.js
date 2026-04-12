import { Router } from "express";
import { verificarToken, autorizarRoles } from "../middlewares/authMiddleware.js";
import {
  obtenerMisPostulaciones,
  obtenerDetalleMiPostulacion
} from "../controllers/usuarioPostulacionesController.js";

const router = Router();

router.get("/", verificarToken, autorizarRoles("usuario"), obtenerMisPostulaciones);
router.get("/:id", verificarToken, autorizarRoles("usuario"), obtenerDetalleMiPostulacion);

export default router;