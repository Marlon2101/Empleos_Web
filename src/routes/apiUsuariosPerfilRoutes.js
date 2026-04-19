import { Router } from "express";
import { verificarToken, autorizarRoles } from "../middlewares/authMiddleware.js";
import {
  obtenerPerfilUsuario,
  actualizarPerfilUsuario
} from "../controllers/perfilController.js";

const router = Router();

router.get("/", verificarToken, autorizarRoles("usuario"), obtenerPerfilUsuario);
router.put("/", verificarToken, autorizarRoles("usuario"), actualizarPerfilUsuario);

export default router;

