import { Router } from "express";
import { verificarToken, autorizarRoles } from "../middlewares/authMiddleware.js";
import { obtenerDashboardUsuario } from "../controllers/dashboardUsuarioController.js";

const router = Router();

router.get("/", verificarToken, autorizarRoles("usuario"), obtenerDashboardUsuario);

export default router;