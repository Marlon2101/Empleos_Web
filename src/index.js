import express from "express";
import dotenv from "dotenv";
import { pool } from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

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
import guardadosRoutes from "./routes/guardadosRoutes.js";
import resenasPostulantesRoutes from "./routes/resenasPostulantesRoutes.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.join(__dirname, "../frontend");
const frontendViewsDir = path.join(frontendDir, "views");
const frontendAssetsDir = path.join(frontendDir, "assets");

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(express.static(frontendDir));
app.use("/views", express.static(frontendViewsDir));
app.use("/assets", express.static(frontendAssetsDir));

const PORT = process.env.PORT || 3000;

app.get("/test", (req, res) => {
  res.send("API Workly funcionando correctamente");
});

app.get("/db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 'Conexion a MySQL exitosa' AS mensaje");
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al conectar a MySQL",
      error: error.message
    });
  }
});

app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
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
app.use("/guardados", guardadosRoutes);
app.use("/empresa/resenas-postulantes", resenasPostulantesRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
