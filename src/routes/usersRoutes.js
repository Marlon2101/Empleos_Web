import { Router } from "express";
import { postCrearUsuario, getObtenerPorElId, getObtenerTodosLosUsuarios,actualizarUsuario,eliminarUsuario } from "../controllers/usersController.js";


const router = Router();

router.get('/',getObtenerTodosLosUsuarios);
router.get('/:id',getObtenerPorElId);
router.post('/',postCrearUsuario);
router.put("/:id", actualizarUsuario);
router.delete("/:id", eliminarUsuario);
export default router;