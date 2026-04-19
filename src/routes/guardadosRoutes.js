import { Router } from "express";
import { verificarToken, autorizarRoles } from "../middlewares/authMiddleware.js";
import {
  obtenerMisGuardados,
  validarGuardado,
  guardarVacante,
  quitarVacanteGuardada
} from "../controllers/guardadosController.js";

const router = Router();

router.get("/", verificarToken, autorizarRoles("usuario"), obtenerMisGuardados);
router.get("/:id_vacante", verificarToken, autorizarRoles("usuario"), validarGuardado);
router.post("/", verificarToken, autorizarRoles("usuario"), guardarVacante);
router.post("/:id_vacante", verificarToken, autorizarRoles("usuario"), guardarVacante);
router.delete("/:id_vacante", verificarToken, autorizarRoles("usuario"), quitarVacanteGuardada);

export default router;
