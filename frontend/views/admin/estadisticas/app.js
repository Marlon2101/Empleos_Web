import { API_URL, getToken, clearSession } from "../../../assets/js/shared/config.js";

const alertContainer = document.getElementById("alertContainer");

const totalVacantesCategoria = document.getElementById("totalVacantesCategoria");
const totalModalidades = document.getElementById("totalModalidades");
const totalEstados = document.getElementById("totalEstados");
const totalEmpresasRanking = document.getElementById("totalEmpresasRanking");

const chartCategorias = document.getElementById("chartCategorias");
const listaModalidades = document.getElementById("listaModalidades");
const tablaEmpresasVacantes = document.getElementById("tablaEmpresasVacantes");
const listaEstados = document.getElementById("listaEstados");

const resumenCategorias = document.getElementById("resumenCategorias");
const resumenModalidades = document.getElementById("resumenModalidades");
const resumenEstados = document.getElementById("resumenEstados");
const resumenEmpresas = document.getElementById("resumenEmpresas");

const requireAdmin = () => {
  const token = getToken();
  const tipo = localStorage.getItem("tipo");

  if (!token || tipo !== "admin") {
    clearSession();
    window.location.href = "../../public/login/index.html";
  }
};

requireAdmin();

const showAlert = (message, type = "danger") => {
  if (!alertContainer) return;
  alertContainer.innerHTML = `
    <div class="alert alert-${type} rounded-4" role="alert">
      ${message}
    </div>
  `;
};

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json"
});

const renderCategoriasChart = (items) => {
  if (!chartCategorias) return;

  if (!items?.length) {
    chartCategorias.innerHTML = `<div class="empty-box">No hay datos de categorías.</div>`;
    return;
  }

  const top = items.slice(0, 6);
  const max = Math.max(...top.map(x => Number(x.total || 0)), 1);

  chartCategorias.innerHTML = top.map(item => {
    const total = Number(item.total || 0);
    const height = Math.max((total / max) * 220, 30);

    return `
      <div class="text-center bar-wrap">
        <div class="bar mx-auto" style="height:${height}px;"></div>
        <span class="small mt-2 d-block text-muted">${item.nombre_categoria ?? "N/D"}</span>
        <strong class="small">${total}</strong>
      </div>
    `;
  }).join("");
};

const renderModalidades = (items) => {
  if (!listaModalidades) return;

  if (!items?.length) {
    listaModalidades.innerHTML = `<div class="empty-box">No hay modalidades.</div>`;
    return;
  }

  listaModalidades.innerHTML = items.map(item => `
    <div class="d-flex justify-content-between align-items-center mb-2">
      <span>${item.modalidad ?? "N/D"}</span>
      <strong>${item.total ?? 0}</strong>
    </div>
  `).join("");
};

const renderEstados = (items) => {
  if (!listaEstados) return;

  if (!items?.length) {
    listaEstados.innerHTML = `<div class="empty-box">No hay estados.</div>`;
    return;
  }

  listaEstados.innerHTML = items.map(item => `
    <div class="d-flex justify-content-between mb-2">
      <span>${item.nombre_estado ?? "N/D"}</span>
      <strong>${item.total ?? 0}</strong>
    </div>
  `).join("");
};

const renderEmpresas = (items) => {
  if (!tablaEmpresasVacantes) return;

  if (!items?.length) {
    tablaEmpresasVacantes.innerHTML = `
      <tr>
        <td colspan="2" class="text-muted">No hay datos de empresas.</td>
      </tr>
    `;
    return;
  }

  tablaEmpresasVacantes.innerHTML = items.map(item => `
    <tr class="border-bottom">
      <td class="fw-semibold">${item.nombre_comercial ?? "N/D"}</td>
      <td class="text-end">${item.total_vacantes ?? 0}</td>
    </tr>
  `).join("");
};

const cargarEstadisticas = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/estadisticas`, {
      headers: authHeaders()
    });

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (response.status === 401 || response.status === 403) {
      clearSession();
      window.location.href = "../../public/login/index.html";
      return;
    }

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudieron cargar las estadísticas.");
      return;
    }

    const categorias = data.vacantesPorCategoria || [];
    const modalidades = data.vacantesPorModalidad || [];
    const estados = data.postulacionesPorEstado || [];
    const empresas = data.empresasConMasVacantes || [];

    totalVacantesCategoria.textContent = categorias.length;
    totalModalidades.textContent = modalidades.length;
    totalEstados.textContent = estados.length;
    totalEmpresasRanking.textContent = empresas.length;

    resumenCategorias.textContent = categorias.length;
    resumenModalidades.textContent = modalidades.length;
    resumenEstados.textContent = estados.length;
    resumenEmpresas.textContent = empresas.length;

    renderCategoriasChart(categorias);
    renderModalidades(modalidades);
    renderEstados(estados);
    renderEmpresas(empresas);
  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
    showAlert("Error de conexión con el servidor.");
  }
};

cargarEstadisticas();