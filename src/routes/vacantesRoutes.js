// import { Router } from "express";
// import {
//   obtenerVacantes,
//   obtenerVacantePorId,
//   obtenerVacantesPorEmpresa,
//   crearVacante,
//   actualizarVacante,
//   eliminarVacante,
//   buscarVacantes,
//   obtenerDetalleVacante
// } from "../controllers/vacantesController.js";
// import {
//   verificarToken,
//   autorizarRoles,
//   verificarTokenOpcional
// } from "../middlewares/authMiddleware.js";
// //import { validarVacante } from "../middlewares/validators.js";
// // Quitamos al policía temporalmente para dejar pasar todo
// router.post('/', crearVacante);
// const router = Router();

// router.get("/", obtenerVacantes);
// router.get("/busqueda/filtros", buscarVacantes);
// router.get("/detalle/:id", verificarTokenOpcional, obtenerDetalleVacante);
// router.get("/empresa/:id_empresa", obtenerVacantesPorEmpresa);
// router.get("/:id", obtenerVacantePorId);

// router.post("/", verificarToken, autorizarRoles("empresa"), validarVacante, crearVacante);
// router.put("/:id", verificarToken, autorizarRoles("empresa"), validarVacante, actualizarVacante);
// router.delete("/:id", verificarToken, autorizarRoles("empresa"), eliminarVacante);

// export default router;



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

// Importamos los middlewares de seguridad (los dejamos listos para cuando quieras reactivarlos)
import {
  verificarToken,
  autorizarRoles,
  verificarTokenOpcional
} from "../middlewares/authMiddleware.js";

// Si usas validadores, descomenta esto cuando reactives la seguridad completa
// import { validarVacante } from "../middlewares/validators.js";

// 1. PRIMERO CREAMOS EL ROUTER
const router = Router();

// ==========================================
// 🚨 BYPASS TEMPORAL PARA CREAR VACANTES 🚨
// Quitamos el token, los roles y validadores para dejar pasar todo.
// ==========================================
router.post('/', crearVacante); 

// ==========================================
// RUTAS PÚBLICAS (No necesitan token obligatorio)
// ==========================================
router.get("/", obtenerVacantes);
router.get("/busqueda/filtros", buscarVacantes);
router.get("/detalle/:id", verificarTokenOpcional, obtenerDetalleVacante);
router.get("/empresa/:id_empresa", obtenerVacantesPorEmpresa);
router.get("/:id", obtenerVacantePorId);

// ==========================================
// RUTAS PROTEGIDAS (Las originales, comentadas temporalmente)
// ==========================================
// Cuando quieras reactivar la seguridad, BORRA el `router.post('/', crearVacante);` de arriba
// y quita las diagonales (//) de las líneas de abajo:

// router.post("/", verificarToken, autorizarRoles("empresa"), validarVacante, crearVacante);
// router.put("/:id", verificarToken, autorizarRoles("empresa"), validarVacante, actualizarVacante);
// router.delete("/:id", verificarToken, autorizarRoles("empresa"), eliminarVacante);

// 3. POR ÚLTIMO EXPORTAMOS EL ROUTER
export default router;