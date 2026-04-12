import { API_URL, getToken, clearSession } from "../../../assets/js/shared/config.js";

const btnLogout = document.getElementById("btnLogout");
const alertContainer = document.getElementById("alertContainer");

const vacantesPorCategoria = document.getElementById("vacantesPorCategoria");
const vacantesPorModalidad = document.getElementById("vacantesPorModalidad");
const postulacionesPorEstado = document.getElementById("postulacionesPorEstado");
const empresasConMasVacantes = document.getElementById("empresasConMasVacantes");

const requireAdmin = () => {
  const token = localStorage.getItem("token");
  const tipo = localStorage.getItem("tipo");

  if (!token || tipo !== "admin") {
    window.location.href = "../../public/login/index.html";
  }
};

requireAdmin();

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

const renderSimpleList = (container, items, labelKey, totalKey) => {
  if (!items?.length) {
    container.innerHTML = `<div class="text-muted">No hay datos.</div>`;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="estadistica-item d-flex justify-content-between align-items-center">
      <span class="estadistica-label">${item[labelKey] ?? "N/D"}</span>
      <span class="estadistica-total">${item[totalKey] ?? 0}</span>
    </div>
  `).join("");
};

const cargarEstadisticas = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/estadisticas`, {
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudieron cargar las estadísticas");
      return;
    }

    renderSimpleList(vacantesPorCategoria, data.vacantesPorCategoria, "nombre_categoria", "total");
    renderSimpleList(vacantesPorModalidad, data.vacantesPorModalidad, "modalidad", "total");
    renderSimpleList(postulacionesPorEstado, data.postulacionesPorEstado, "nombre_estado", "total");
    renderSimpleList(empresasConMasVacantes, data.empresasConMasVacantes, "nombre_comercial", "total_vacantes");
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
};

cargarEstadisticas();