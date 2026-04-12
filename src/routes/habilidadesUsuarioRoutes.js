import { Router } from "express";
import { verificarToken, autorizarRoles } from "../middlewares/authMiddleware.js";
import {
  obtenerMisHabilidades,
  agregarMiHabilidad,
  eliminarMiHabilidad
} from "../controllers/habilidadesUsuarioController.js";

const router = Router();

router.get("/", verificarToken, autorizarRoles("usuario"), obtenerMisHabilidades);
router.post("/", verificarToken, autorizarRoles("usuario"), agregarMiHabilidad);
router.delete("/:id_habilidad", verificarToken, autorizarRoles("usuario"), eliminarMiHabilidad);

export default router;