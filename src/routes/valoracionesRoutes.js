import { Router } from "express";
import { verificarToken, autorizarRoles } from "../middlewares/authMiddleware.js";
import {
  obtenerValoracionesEmpresa,
  obtenerMisValoraciones,
  crearValoracion
} from "../controllers/valoracionesController.js";
import { validarValoracion } from "../middlewares/validators.js";

const router = Router();

router.get("/empresa/:id_empresa", obtenerValoracionesEmpresa);
router.get("/mias", verificarToken, autorizarRoles("usuario"), obtenerMisValoraciones);
router.post("/", verificarToken, autorizarRoles("usuario"), validarValoracion, crearValoracion);

export default router;