import { Router } from "express";
import {
  obtenerDepartamentos,
  obtenerMunicipios,
  obtenerMunicipiosPorDepartamento,
  obtenerCategorias,
  obtenerHabilidades,
  obtenerEstadosPostulacion
} from "../controllers/catalogosController.js";

const router = Router();

router.get("/departamentos", obtenerDepartamentos);
router.get("/municipios", obtenerMunicipios);
router.get("/municipios/:id_departamento", obtenerMunicipiosPorDepartamento);
router.get("/categorias", obtenerCategorias);
router.get("/habilidades", obtenerHabilidades);
router.get("/estados-postulacion", obtenerEstadosPostulacion);

export default router;