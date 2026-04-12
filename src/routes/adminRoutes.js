import { Router } from "express";
import { verificarToken, autorizarRoles } from "../middlewares/authMiddleware.js";
import {
  obtenerUsuariosAdmin,
  obtenerEmpresasAdmin,
  obtenerVacantesAdmin,
  eliminarUsuarioAdmin,
  eliminarEmpresaAdmin,
  eliminarVacanteAdmin
} from "../controllers/adminController.js";

const router = Router();

router.get("/usuarios", verificarToken, autorizarRoles("admin"), obtenerUsuariosAdmin);
router.get("/empresas", verificarToken, autorizarRoles("admin"), obtenerEmpresasAdmin);
router.get("/vacantes", verificarToken, autorizarRoles("admin"), obtenerVacantesAdmin);

router.delete("/usuarios/:id", verificarToken, autorizarRoles("admin"), eliminarUsuarioAdmin);
router.delete("/empresas/:id", verificarToken, autorizarRoles("admin"), eliminarEmpresaAdmin);
router.delete("/vacantes/:id", verificarToken, autorizarRoles("admin"), eliminarVacanteAdmin);

export default router;