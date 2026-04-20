import { Router } from "express";
import {
  iniciarSesion,
  registrarUsuario,
  registrarEmpresa,
  verificarEmail,
  reenviarVerificacion,
  cambiarCorreoPendiente
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
router.get("/verificar-email", verificarEmail);
router.post("/reenviar-verificacion", reenviarVerificacion);
router.post("/cambiar-email-pendiente", cambiarCorreoPendiente);

export default router;
