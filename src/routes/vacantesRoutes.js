import { Router } from "express";
import {
  obtenerVacantes,
  obtenerVacantePorId,
  obtenerVacantesPorEmpresa,
  crearVacante,
  actualizarVacante,
  eliminarVacante,
  buscarVacantes,
  obtenerDetalleVacante,
  obtenerVacantesSimilares
} from "../controllers/vacantesController.js";

import {
  verificarToken,
  autorizarRoles,
  verificarTokenOpcional
} from "../middlewares/authMiddleware.js";

const router = Router();


router.post('/', crearVacante); 


router.get("/", obtenerVacantes);
router.get("/busqueda/filtros", buscarVacantes);
router.get("/detalle/:id", verificarTokenOpcional, obtenerDetalleVacante);
router.get("/:id/similares", obtenerVacantesSimilares);
router.get("/empresa/:id_empresa", obtenerVacantesPorEmpresa);

router.get("/destacadas", async (req, res) => {
    try {
      
        const empleosPrueba = [
            { id_vacante: 1, titulo: "Desarrollador Full Stack Frontend y Backend", empresa: "TechCorp S.A." },
            { id_vacante: 2, titulo: "Diseñador UX/UI Especialista", empresa: "Creative Studio" },
            { id_vacante: 3, titulo: "Analista de Datos Jr", empresa: "Global Ventas" }
        ];

        res.json(empleosPrueba);
    } catch (error) {
        console.error("Error en destacadas:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});


router.get("/:id", obtenerVacantePorId);


export default router;
