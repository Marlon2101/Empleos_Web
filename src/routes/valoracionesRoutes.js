import { Router } from "express";
import { verificarToken, verificarTokenOpcional, autorizarRoles } from "../middlewares/authMiddleware.js";
import {
  obtenerEmpresasValorables,
  obtenerValoracionesEmpresa,
  obtenerMisValoraciones,
  crearValoracion,
  actualizarMiValoracion
} from "../controllers/valoracionesController.js";
import { validarValoracion } from "../middlewares/validators.js";

const router = Router();

router.get("/empresas", verificarTokenOpcional, obtenerEmpresasValorables);
router.get("/empresa/:id_empresa", verificarTokenOpcional, obtenerValoracionesEmpresa);
router.get("/mias", verificarToken, autorizarRoles("usuario"), obtenerMisValoraciones);
router.post("/", verificarToken, autorizarRoles("usuario"), validarValoracion, crearValoracion);
router.put("/empresa/:id_empresa", verificarToken, autorizarRoles("usuario"), validarValoracion, actualizarMiValoracion);

export default router;

