import { API_URL, getToken, clearSession } from "../../../assets/js/shared/config.js";

const alertContainer = document.getElementById("alertContainer");
const totalUsuarios = document.getElementById("totalUsuarios");
const totalEmpresas = document.getElementById("totalEmpresas");
const totalVacantes = document.getElementById("totalVacantes");
const totalPostulaciones = document.getElementById("totalPostulaciones");

const resumenUsuarios = document.getElementById("resumenUsuarios");
const resumenEmpresas = document.getElementById("resumenEmpresas");
const resumenVacantes = document.getElementById("resumenVacantes");
const resumenPostulaciones = document.getElementById("resumenPostulaciones");

const chartDashboard = document.getElementById("chartDashboard");
const actividadReciente = document.getElementById("actividadReciente");
const ultimasVacantesBox = document.getElementById("ultimasVacantesBox");

const requireAdmin = () => {
  const token = getToken();
  const tipo = localStorage.getItem("tipo");

  if (!token || tipo !== "admin") {
    if (typeof clearSession === "function") {
      clearSession();
    }
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

const formatearFecha = (fecha) => {
  if (!fecha) return "Reciente";
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return "Reciente";
  return d.toLocaleDateString("es-SV");
};

const renderChart = (metricas) => {
  if (!chartDashboard) return;

  const values = [
    { label: "Usuarios", value: Number(metricas?.total_usuarios || 0) },
    { label: "Empresas", value: Number(metricas?.total_empresas || 0) },
    { label: "Vacantes", value: Number(metricas?.total_vacantes || 0) }
  ];

  const max = Math.max(...values.map(x => x.value), 1);

  chartDashboard.innerHTML = values.map(item => {
    const height = Math.max((item.value / max) * 130, 20);

    return `
      <div class="text-center">
        <div class="bar mx-auto" style="height:${height}px;"></div>
        <span class="small mt-2 d-block text-muted">${item.label}</span>
        <strong class="small d-block">${item.value}</strong>
      </div>
    `;
  }).join("");
};

const renderActividad = (usuarios, empresas, vacantes) => {
  if (!actividadReciente) return;

  const items = [];

  if (usuarios?.[0]) {
    items.push({
      titulo: "Nuevo usuario detectado",
      fecha: formatearFecha(usuarios[0].fecha_registro),
      detalle: `${usuarios[0].nombres || ""} ${usuarios[0].apellidos || ""}`.trim() || "Usuario"
    });
  }

  if (empresas?.[0]) {
    items.push({
      titulo: "Nueva empresa detectada",
      fecha: formatearFecha(empresas[0].fecha_registro),
      detalle: empresas[0].nombre_comercial || "Empresa"
    });
  }

  if (vacantes?.[0]) {
    items.push({
      titulo: "Nueva vacante detectada",
      fecha: formatearFecha(vacantes[0].fecha_publicacion),
      detalle: vacantes[0].titulo_puesto || "Vacante"
    });
  }

  if (!items.length) {
    actividadReciente.innerHTML = `
      <div class="p-3 rounded-4 bg-light border-start border-4 border-primary text-muted">
        No hay actividad disponible.
      </div>
    `;
    return;
  }

  actividadReciente.innerHTML = items.map((item, index) => `
    <div class="p-3 rounded-4 bg-light border-start border-4 ${index === 0 ? "border-primary" : index === 1 ? "border-danger" : "border-success"}">
      <div class="d-flex justify-content-between align-items-center">
        <h6 class="fw-bold mb-1">${item.titulo}</h6>
        <small class="text-muted">${item.fecha}</small>
      </div>
      <p class="small mb-0 text-muted">${item.detalle}</p>
    </div>
  `).join("");
};

const renderUltimasVacantes = (vacantes) => {
  if (!ultimasVacantesBox) return;

  if (!vacantes?.length) {
    ultimasVacantesBox.innerHTML = `No hay vacantes.`;
    return;
  }

  ultimasVacantesBox.innerHTML = vacantes.slice(0, 4).map(v => `
    <div class="mb-2">
      <div class="fw-semibold">${v.titulo_puesto || "Vacante"}</div>
      <div class="text-muted">${v.nombre_comercial || "Empresa"}</div>
    </div>
  `).join("");
};

const cargarDashboard = async () => {
  try {
    const response = await fetch(`${API_URL}/dashboard/admin`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (response.status === 401 || response.status === 403) {
      if (typeof clearSession === "function") {
        clearSession();
      }
      window.location.href = "../../public/login/index.html";
      return;
    }

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudo cargar el dashboard.");
      return;
    }

    if (totalUsuarios) totalUsuarios.textContent = data.metricas?.total_usuarios ?? 0;
    if (totalEmpresas) totalEmpresas.textContent = data.metricas?.total_empresas ?? 0;
    if (totalVacantes) totalVacantes.textContent = data.metricas?.total_vacantes ?? 0;
    if (totalPostulaciones) totalPostulaciones.textContent = data.metricas?.total_postulaciones ?? 0;

    if (resumenUsuarios) resumenUsuarios.textContent = data.ultimosUsuarios?.length ?? 0;
    if (resumenEmpresas) resumenEmpresas.textContent = data.ultimasEmpresas?.length ?? 0;
    if (resumenVacantes) resumenVacantes.textContent = data.ultimasVacantes?.length ?? 0;
    if (resumenPostulaciones) resumenPostulaciones.textContent = data.metricas?.total_postulaciones ?? 0;

    renderChart(data.metricas);
    renderActividad(data.ultimosUsuarios, data.ultimasEmpresas, data.ultimasVacantes);
    renderUltimasVacantes(data.ultimasVacantes);
  } catch (error) {
    console.error("Error al cargar dashboard:", error);
    showAlert("Error de conexión con el servidor.");
  }
};

cargarDashboard();