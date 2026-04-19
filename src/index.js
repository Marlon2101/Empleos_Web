import express from "express";
import dotenv from "dotenv";
import { pool } from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors"; // UN SOLO IMPORT AQUÍ AL INICIO

// Importación de rutas
import authRoutes from "./routes/authRoutes.js";
import catalogosRoutes from "./routes/catalogosRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import empresasRoutes from "./routes/empresasRoutes.js";
import vacantesRoutes from "./routes/vacantesRoutes.js";
import postulacionesRoutes from "./routes/postulacionesRoutes.js";
import perfilRoutes from "./routes/perfilRoutes.js";
import apiUsuariosPerfilRoutes from "./routes/apiUsuariosPerfilRoutes.js";
import habilidadesUsuarioRoutes from "./routes/habilidadesUsuarioRoutes.js";
import dashboardEmpresaRoutes from "./routes/dashboardEmpresaRoutes.js";
import dashboardUsuarioRoutes from "./routes/dashboardUsuarioRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import dashboardAdminRoutes from "./routes/dashboardAdminRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import estadisticasAdminRoutes from "./routes/estadisticasAdminRoutes.js";
import notificacionesRoutes from "./routes/notificacionesRoutes.js";
import empresaPostulacionesRoutes from "./routes/empresaPostulacionesRoutes.js";
import usuarioPostulacionesRoutes from "./routes/usuarioPostulacionesRoutes.js";
import valoracionesRoutes from "./routes/valoracionesRoutes.js";

dotenv.config();

const app = express();

// 1. Configuramos __dirname (necesario en ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Middlewares Globales
app.use(cors()); // Habilita CORS para que el Front (Live Server) pueda entrar
app.use(express.json()); // Necesario para leer los datos que envías en POST/PUT

// 3. Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../frontend')));

const PORT = process.env.PORT || 3000;

// Rutas de prueba para verificar salud del sistema
app.get("/test", (req, res) => {
  res.send("API Workly funcionando correctamente");
});

app.get("/db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 'Conexión a MySQL exitosa' AS mensaje");
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al conectar a MySQL",
      error: error.message
    });
  }
});

// 4. Definición de Endpoints de la API
// Asegúrate de que tu Front pida a http://localhost:3000/vacantes (sin /api)
app.use("/auth", authRoutes);
app.use("/catalogos", catalogosRoutes);
app.use("/users", usersRoutes);
app.use("/empresas", empresasRoutes);
app.use("/vacantes", vacantesRoutes);
app.use("/postulaciones", postulacionesRoutes);
app.use("/perfil", perfilRoutes);
app.use("/api/usuarios/perfil", apiUsuariosPerfilRoutes);
app.use("/perfil/usuario/habilidades", habilidadesUsuarioRoutes);
app.use("/dashboard/empresa", dashboardEmpresaRoutes);
app.use("/dashboard/usuario", dashboardUsuarioRoutes);
app.use("/admin-auth", adminAuthRoutes);
app.use("/dashboard/admin", dashboardAdminRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/estadisticas", estadisticasAdminRoutes);
app.use("/notificaciones", notificacionesRoutes);
app.use("/api/notificaciones", notificacionesRoutes);
app.use("/empresa/postulaciones", empresaPostulacionesRoutes);
app.use("/usuario/postulaciones", usuarioPostulacionesRoutes);
app.use("/valoraciones", valoracionesRoutes);
app.use("/api/valoraciones", valoracionesRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
