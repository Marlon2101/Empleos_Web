import { Router } from "express";
import {
  iniciarSesion,
  registrarUsuario,
  registrarEmpresa
} from "../controllers/authController.js";
import {
  validarLogin,
  validarRegistroUsuario,
  validarRegistroEmpresa
} from "../middlewares/validators.js";

const router = Router();

router.post("/login", validarLogin, iniciarSesion);
router.post("/register-user", validarRegistroUsuario, registrarUsuario);
router.post("/register-company", validarRegistroEmpresa, registrarEmpresa);

export default router;