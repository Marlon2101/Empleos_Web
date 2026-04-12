import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth, logout } from "../../../assets/js/shared/auth.js";

requireAuth(["usuario"]);

const nombreUsuario = document.getElementById("nombreUsuario");
const totalPostulaciones = document.getElementById("totalPostulaciones");
const totalHabilidades = document.getElementById("totalHabilidades");
const ultimasPostulaciones = document.getElementById("ultimasPostulaciones");
const vacantesRecientes = document.getElementById("vacantesRecientes");
const btnLogout = document.getElementById("btnLogout");
const alertContainer = document.getElementById("alertContainer");

btnLogout.addEventListener("click", logout);

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
};

const renderPostulaciones = (items) => {
  if (!items || items.length === 0) {
    ultimasPostulaciones.innerHTML = `<div class="text-muted">No hay postulaciones todavía.</div>`;
    return;
  }

  ultimasPostulaciones.innerHTML = items.map(item => `
    <div class="list-group-item-custom">
      <div class="fw-semibold">${item.titulo_puesto}</div>
      <div class="text-muted">${item.nombre_comercial}</div>
      <div class="small mt-1">Estado: ${item.nombre_estado}</div>
    </div>
  `).join("");
};

const renderVacantes = (items) => {
  if (!items || items.length === 0) {
    vacantesRecientes.innerHTML = `<div class="text-muted">No hay vacantes recientes.</div>`;
    return;
  }

  vacantesRecientes.innerHTML = items.map(item => `
    <div class="list-group-item-custom">
      <div class="fw-semibold">${item.titulo_puesto}</div>
      <div class="text-muted">${item.nombre_comercial}</div>
      <div class="small mt-1">${item.nombre_categoria} · ${item.modalidad}</div>
    </div>
  `).join("");
};

const cargarDashboard = async () => {
  try {
    const response = await fetch(`${API_URL}/dashboard/usuario`, {
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudo cargar el dashboard");
      return;
    }

    nombreUsuario.textContent = `${data.usuario.nombres} ${data.usuario.apellidos}`;
    totalPostulaciones.textContent = data.metricas.total_postulaciones ?? 0;
    totalHabilidades.textContent = data.metricas.total_habilidades ?? 0;

    renderPostulaciones(data.ultimasPostulaciones);
    renderVacantes(data.vacantesRecientes);
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
};

cargarDashboard();