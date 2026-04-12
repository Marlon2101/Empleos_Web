import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth, logout } from "../../../assets/js/shared/auth.js";

requireAuth(["empresa"]);

const btnLogout = document.getElementById("btnLogout");
const nombreEmpresa = document.getElementById("nombreEmpresa");
const totalVacantes = document.getElementById("totalVacantes");
const totalPostulaciones = document.getElementById("totalPostulaciones");
const ultimasVacantes = document.getElementById("ultimasVacantes");
const ultimasPostulaciones = document.getElementById("ultimasPostulaciones");
const alertContainer = document.getElementById("alertContainer");

btnLogout.addEventListener("click", logout);

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
};

const renderVacantes = (items) => {
  if (!items || items.length === 0) {
    ultimasVacantes.innerHTML = `<div class="text-muted">No hay vacantes publicadas todavía.</div>`;
    return;
  }

  ultimasVacantes.innerHTML = items.map(item => `
    <div class="list-item-card">
      <div class="fw-semibold">${item.titulo_puesto}</div>
      <div class="text-muted small">${item.modalidad}</div>
      <div class="small mt-1">Salario: $${Number(item.salario_offrecido ?? 0).toFixed(2)}</div>
    </div>
  `).join("");
};

const renderPostulaciones = (items) => {
  if (!items || items.length === 0) {
    ultimasPostulaciones.innerHTML = `<div class="text-muted">No hay postulaciones recibidas todavía.</div>`;
    return;
  }

  ultimasPostulaciones.innerHTML = items.map(item => `
    <div class="list-item-card">
      <div class="fw-semibold">${item.nombre_usuario}</div>
      <div class="text-muted small">${item.titulo_puesto}</div>
      <div class="small mt-1">Estado: ${item.nombre_estado}</div>
    </div>
  `).join("");
};

const cargarDashboard = async () => {
  try {
    const response = await fetch(`${API_URL}/dashboard/empresa`, {
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudo cargar el dashboard");
      return;
    }

    nombreEmpresa.textContent = data.empresa?.nombre_comercial ?? "Empresa";
    totalVacantes.textContent = data.metricas?.total_vacantes ?? 0;
    totalPostulaciones.textContent = data.metricas?.total_postulaciones ?? 0;

    renderVacantes(data.ultimasVacantes);
    renderPostulaciones(data.ultimasPostulaciones);
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
};

cargarDashboard();