import { Router } from "express";
import { verificarToken, autorizarRoles } from "../middlewares/authMiddleware.js";
import {
  obtenerPostulacionesEmpresa,
  obtenerDetallePostulacionEmpresa
} from "../controllers/empresaPostulacionesController.js";

const router = Router();

router.get("/", verificarToken, autorizarRoles("empresa"), obtenerPostulacionesEmpresa);
router.get("/:id", verificarToken, autorizarRoles("empresa"), obtenerDetallePostulacionEmpresa);

export default router;