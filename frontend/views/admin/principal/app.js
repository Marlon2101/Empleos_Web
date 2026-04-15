import { API_URL, getToken, clearSession } from "../../../assets/js/shared/config.js";

const requireAdmin = () => {
  const token = localStorage.getItem("token");
  const tipo = localStorage.getItem("userRole");
console.log("Token:", token);
console.log("Tipo:", tipo);
  if (!token || tipo !== "admin") {
    window.location.href = "../../public/login/index.html";
  }
};

requireAdmin();
const btnLogout = document.getElementById("btnLogout");
const alertContainer = document.getElementById("alertContainer");

const totalUsuarios = document.getElementById("totalUsuarios");
const totalEmpresas = document.getElementById("totalEmpresas");
const totalVacantes = document.getElementById("totalVacantes");
const totalPostulaciones = document.getElementById("totalPostulaciones");

const ultimosUsuarios = document.getElementById("ultimosUsuarios");
const ultimasEmpresas = document.getElementById("ultimasEmpresas");
const ultimasVacantes = document.getElementById("ultimasVacantes");


btnLogout.addEventListener("click", () => {
  clearSession();
  window.location.href = "../../public/login/index.html";
});

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
};

const renderUsuarios = (items) => {
  if (!items?.length) {
    ultimosUsuarios.innerHTML = `<div class="text-muted">No hay usuarios.</div>`;
    return;
  }

  ultimosUsuarios.innerHTML = items.map(item => `
    <div class="list-item-card">
      <div class="fw-semibold">${item.nombres} ${item.apellidos}</div>
      <div class="small text-muted">${item.correo_electronico}</div>
    </div>
  `).join("");
};

const renderEmpresas = (items) => {
  if (!items?.length) {
    ultimasEmpresas.innerHTML = `<div class="text-muted">No hay empresas.</div>`;
    return;
  }

  ultimasEmpresas.innerHTML = items.map(item => `
    <div class="list-item-card">
      <div class="fw-semibold">${item.nombre_comercial}</div>
      <div class="small text-muted">${item.correo_electronico ?? ""}</div>
    </div>
  `).join("");
};

const renderVacantes = (items) => {
  if (!items?.length) {
    ultimasVacantes.innerHTML = `<div class="text-muted">No hay vacantes.</div>`;
    return;
  }

  ultimasVacantes.innerHTML = items.map(item => `
    <div class="list-item-card">
      <div class="fw-semibold">${item.titulo_puesto}</div>
      <div class="small text-muted">${item.nombre_comercial}</div>
      <div class="small">${item.modalidad}</div>
    </div>
  `).join("");
};

const cargarDashboard = async () => {
  try {
    const response = await fetch(`${API_URL}/dashboard/admin`, {
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudo cargar el dashboard admin");
      return;
    }

    totalUsuarios.textContent = data.metricas?.total_usuarios ?? 0;
    totalEmpresas.textContent = data.metricas?.total_empresas ?? 0;
    totalVacantes.textContent = data.metricas?.total_vacantes ?? 0;
    totalPostulaciones.textContent = data.metricas?.total_postulaciones ?? 0;

    renderUsuarios(data.ultimosUsuarios);
    renderEmpresas(data.ultimasEmpresas);
    renderVacantes(data.ultimasVacantes);
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
};

cargarDashboard();