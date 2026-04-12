import { Router } from "express";
import { verificarToken, autorizarRoles } from "../middlewares/authMiddleware.js";
import { obtenerEstadisticasAdmin } from "../controllers/estadisticasAdminController.js";

const router = Router();

router.get("/", verificarToken, autorizarRoles("admin"), obtenerEstadisticasAdmin);

export default router;