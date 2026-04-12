import { Router } from "express";
import { verificarToken, autorizarRoles } from "../middlewares/authMiddleware.js";
import { obtenerDashboardEmpresa } from "../controllers/dashboardEmpresaController.js";

const router = Router();

router.get("/", verificarToken, autorizarRoles("empresa"), obtenerDashboardEmpresa);

export default router;