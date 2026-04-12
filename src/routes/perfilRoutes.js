import { Router } from "express";
import { verificarToken, autorizarRoles } from "../middlewares/authMiddleware.js";
import {
  obtenerMiPerfil,
  obtenerPerfilUsuario,
  actualizarPerfilUsuario,
  obtenerPerfilEmpresa,
  actualizarPerfilEmpresa
} from "../controllers/perfilController.js";

const router = Router();

router.get("/me", verificarToken, obtenerMiPerfil);

router.get("/usuario", verificarToken, autorizarRoles("usuario"), obtenerPerfilUsuario);
router.put("/usuario", verificarToken, autorizarRoles("usuario"), actualizarPerfilUsuario);

router.get("/empresa", verificarToken, autorizarRoles("empresa"), obtenerPerfilEmpresa);
router.put("/empresa", verificarToken, autorizarRoles("empresa"), actualizarPerfilEmpresa);

export default router;