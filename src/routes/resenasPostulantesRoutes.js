import { Router } from "express";
import { verificarToken, autorizarRoles } from "../middlewares/authMiddleware.js";
import {
  obtenerPanelResenasPostulantes,
  guardarResenaPostulante
} from "../controllers/resenasPostulantesController.js";

const router = Router();

router.get("/", verificarToken, autorizarRoles("empresa"), obtenerPanelResenasPostulantes);
router.post("/", verificarToken, autorizarRoles("empresa"), guardarResenaPostulante);

export default router;
