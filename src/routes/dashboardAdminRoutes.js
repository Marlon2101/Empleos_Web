import { Router } from "express";
import { verificarToken, autorizarRoles } from "../middlewares/authMiddleware.js";
import { obtenerDashboardAdmin } from "../controllers/dashboardAdminController.js";

const router = Router();

router.get("/", verificarToken, autorizarRoles("admin"), obtenerDashboardAdmin);

export default router;