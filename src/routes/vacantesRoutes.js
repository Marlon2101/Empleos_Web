import { Router } from "express";
import {
  obtenerVacantes,
  obtenerVacantePorId,
  obtenerVacantesPorEmpresa,
  crearVacante,
  actualizarVacante,
  eliminarVacante,
  buscarVacantes,
  obtenerDetalleVacante
} from "../controllers/vacantesController.js";
import {
  verificarToken,
  autorizarRoles,
  verificarTokenOpcional
} from "../middlewares/authMiddleware.js";
import { validarVacante } from "../middlewares/validators.js";

const router = Router();

router.get("/", obtenerVacantes);
router.get("/busqueda/filtros", buscarVacantes);
router.get("/detalle/:id", verificarTokenOpcional, obtenerDetalleVacante);
router.get("/empresa/:id_empresa", obtenerVacantesPorEmpresa);
router.get("/:id", obtenerVacantePorId);

router.post("/", verificarToken, autorizarRoles("empresa"), validarVacante, crearVacante);
router.put("/:id", verificarToken, autorizarRoles("empresa"), validarVacante, actualizarVacante);
router.delete("/:id", verificarToken, autorizarRoles("empresa"), eliminarVacante);

export default router;