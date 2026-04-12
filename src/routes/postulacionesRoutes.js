import { Router } from "express";
import {
  obtenerPostulaciones,
  obtenerPostulacionesPorUsuario,
  obtenerPostulacionesPorVacante,
  crearPostulacion,
  actualizarPostulacion,
  eliminarPostulacion
} from "../controllers/postulacionesController.js";
import { verificarToken, autorizarRoles } from "../middlewares/authMiddleware.js";
import { validarPostulacion } from "../middlewares/validators.js";

const router = Router();

router.get("/", obtenerPostulaciones);
router.get("/usuario/:id_usuario", obtenerPostulacionesPorUsuario);
router.get("/vacante/:id_vacante", obtenerPostulacionesPorVacante);

router.post("/", verificarToken, autorizarRoles("usuario"), validarPostulacion, crearPostulacion);
router.put("/:id", verificarToken, autorizarRoles("empresa"), actualizarPostulacion);
router.delete("/:id", verificarToken, autorizarRoles("usuario", "empresa"), eliminarPostulacion);

export default router;