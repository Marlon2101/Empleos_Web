import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth } from "../../../assets/js/shared/auth.js";

requireAuth(["admin"]);

const tablaVacantes = document.getElementById("tablaVacantes");
const searchInput = document.getElementById("searchInput");
const estadoFilter = document.getElementById("estadoFilter");
const btnFiltrar = document.getElementById("btnFiltrar");
const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");
const btnExportar = document.getElementById("btnExportar");
const btnNuevaVacante = document.getElementById("btnNuevaVacante");
const btnGuardarVacante = document.getElementById("btnGuardarVacante");
const alertContainer = document.getElementById("alertContainer");
const loadingSpinner = document.querySelector(".loading-spinner");
const actividadVacantes = document.getElementById("actividadVacantes");

const resumenTotal = document.getElementById("resumenTotal");
const resumenActivas = document.getElementById("resumenActivas");
const resumenPausadas = document.getElementById("resumenPausadas");
const resumenReportadas = document.getElementById("resumenReportadas");

let vacantesGlobal = [];
let vacanteAEliminar = null;



const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json"
});

const showLoading = (show) => {
  if (!loadingSpinner) return;
  loadingSpinner.style.display = show ? "block" : "none";
  document.body.style.cursor = show ? "wait" : "default";
};

const showAlert = (message, type = "danger") => {
  if (!alertContainer) return;

  let icon = "x-circle";
  if (type === "success") icon = "check-circle";
  else if (type === "warning") icon = "exclamation-triangle";
  else if (type === "info") icon = "info-circle";
  else if (type === "primary") icon = "info-circle";

  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show rounded-4" role="alert">
      <i class="bi bi-${icon} me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;

  setTimeout(() => {
    const alert = alertContainer.querySelector(".alert");
    if (alert) {
      alert.classList.remove("show");
      setTimeout(() => alert.remove(), 150);
    }
  }, 5000);
};

const formatearFecha = (fecha) => {
  if (!fecha) return "N/D";
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return "N/D";
  return d.toLocaleDateString("es-SV");
};

const renderResumen = (vacantes) => {
  if (resumenTotal) resumenTotal.textContent = vacantes.length;
  if (resumenActivas) resumenActivas.textContent = vacantes.filter(v => (v.estado || "").toLowerCase() === "activo").length;
  if (resumenPausadas) resumenPausadas.textContent = vacantes.filter(v => (v.estado || "").toLowerCase() === "pausada").length;
  if (resumenReportadas) resumenReportadas.textContent = vacantes.filter(v => (v.estado || "").toLowerCase() === "reportada").length;
};

const renderActividad = (vacantes) => {
  if (!actividadVacantes) return;

  const top = [...vacantes]
    .sort((a, b) => new Date(b.fecha_publicacion || 0) - new Date(a.fecha_publicacion || 0))
    .slice(0, 3);

  if (!top.length) {
    actividadVacantes.innerHTML = `
      <div class="p-3 rounded-4 bg-light border-start border-4 border-primary text-muted">
        <i class="bi bi-info-circle me-2"></i>No hay actividad disponible.
      </div>
    `;
    return;
  }

  actividadVacantes.innerHTML = top.map((vacante, index) => {
    const colorBorder = index === 0 ? "primary" : index === 1 ? "success" : "warning";
    const estado = vacante.estado || "Activo";
    const badgeColor =
      estado === "Activo" ? "success" :
      estado === "Pausada" ? "warning text-dark" :
      "danger";

    return `
      <div class="p-3 rounded-4 bg-light border-start border-4 border-${colorBorder}">
        <div class="d-flex justify-content-between align-items-center">
          <h6 class="fw-bold mb-1">${vacante.titulo_puesto || "Vacante"}</h6>
          <small class="text-muted">${formatearFecha(vacante.fecha_publicacion)}</small>
        </div>
        <p class="small mb-0 text-muted">
          ${vacante.nombre_comercial || "Sin empresa"} ·
          ${vacante.modalidad || "N/D"} ·
          <span class="badge bg-${badgeColor}">${estado}</span>
        </p>
      </div>
    `;
  }).join("");
};

const renderVacantes = (vacantes) => {
  if (!tablaVacantes) return;

  if (!vacantes.length) {
    tablaVacantes.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted py-5">
          <i class="bi bi-inbox fs-1 d-block mb-2"></i>
          No hay vacantes registradas
        </td>
      </tr>
    `;
    return;
  }

  tablaVacantes.innerHTML = vacantes.map(vacante => {
    const estado = vacante.estado || "Activo";
    const estadoColor =
      estado === "Activo" ? "success" :
      estado === "Pausada" ? "warning text-dark" :
      "danger";

    const estadoIcono =
      estado === "Activo" ? "check-circle" :
      estado === "Pausada" ? "pause-circle" :
      "exclamation-triangle";

    return `
      <tr>
        <td>
          <div class="fw-bold">${vacante.titulo_puesto || "N/D"}</div>
          <div class="small text-muted">${vacante.modalidad || "N/D"} · ${vacante.nombre_categoria || "Sin categoría"}</div>
        </td>
        <td>${vacante.nombre_comercial || "N/D"}</td>
        <td>
          <span class="badge bg-${estadoColor} px-3 py-2">
            <i class="bi bi-${estadoIcono} me-1"></i>${estado}
          </span>
        </td>
        <td class="text-muted">${formatearFecha(vacante.fecha_publicacion)}</td>
        <td>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-info btn-ver" data-id="${vacante.id_vacante}" title="Ver detalles">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-warning btn-editar" data-id="${vacante.id_vacante}" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            ${estado === "Activo"
              ? `<button class="btn btn-sm btn-outline-secondary btn-pausar" data-id="${vacante.id_vacante}" title="Pausar"><i class="bi bi-pause-circle"></i></button>`
              : estado === "Pausada"
              ? `<button class="btn btn-sm btn-outline-success btn-reactivar" data-id="${vacante.id_vacante}" title="Reactivar"><i class="bi bi-play-circle"></i></button>`
              : `<button class="btn btn-sm btn-outline-primary btn-revisar" data-id="${vacante.id_vacante}" title="Revisar"><i class="bi bi-check-circle"></i></button>`
            }
            <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${vacante.id_vacante}" title="Eliminar">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  document.querySelectorAll(".btn-ver").forEach(btn => {
    btn.addEventListener("click", () => verVacante(btn.dataset.id));
  });

  document.querySelectorAll(".btn-editar").forEach(btn => {
    btn.addEventListener("click", () => editarVacante(btn.dataset.id));
  });

  document.querySelectorAll(".btn-pausar").forEach(btn => {
    btn.addEventListener("click", () => cambiarEstadoVacante(btn.dataset.id, "Pausada"));
  });

  document.querySelectorAll(".btn-reactivar").forEach(btn => {
    btn.addEventListener("click", () => cambiarEstadoVacante(btn.dataset.id, "Activo"));
  });

  document.querySelectorAll(".btn-revisar").forEach(btn => {
    btn.addEventListener("click", () => cambiarEstadoVacante(btn.dataset.id, "Activo"));
  });

  document.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", () => {
      vacanteAEliminar = btn.dataset.id;
      const modalConfirm = new bootstrap.Modal(document.getElementById("modalConfirmacion"));
      document.getElementById("confirmacionMensaje").innerHTML =
        "¿Estás seguro de que deseas eliminar esta vacante? Esta acción no se puede deshacer.";

      document.getElementById("confirmarAccionBtn").onclick = async () => {
        await eliminarVacante(vacanteAEliminar);
        modalConfirm.hide();
      };

      modalConfirm.show();
    });
  });
};

const verVacante = (id) => {
  const vacante = vacantesGlobal.find(v => String(v.id_vacante) === String(id));
  if (!vacante) return;

  showAlert(`
    <strong>${vacante.titulo_puesto || "Vacante"}</strong><br>
    Empresa: ${vacante.nombre_comercial || "N/D"}<br>
    Categoría: ${vacante.nombre_categoria || "N/D"}<br>
    Modalidad: ${vacante.modalidad || "N/D"}<br>
    Estado: ${vacante.estado || "Activo"}<br>
    Fecha: ${formatearFecha(vacante.fecha_publicacion)}
  `, "info");
};

const editarVacante = (id) => {
  const vacante = vacantesGlobal.find(v => String(v.id_vacante) === String(id));
  if (!vacante) return;

  document.getElementById("modalTitle").textContent = "Editar Vacante";
  document.getElementById("vacanteId").value = vacante.id_vacante || "";
  document.getElementById("tituloPuesto").value = vacante.titulo_puesto || "";
  document.getElementById("nombreEmpresa").value = vacante.nombre_comercial || "";
  document.getElementById("categoria").value = vacante.nombre_categoria || "";
  document.getElementById("modalidad").value = vacante.modalidad || "Presencial";
  document.getElementById("descripcion").value = vacante.descripcion || "";
  document.getElementById("estadoVacante").value = vacante.estado || "Activo";

  const modal = new bootstrap.Modal(document.getElementById("modalVacante"));
  modal.show();
};

const aplicarFiltroLocal = () => {
  const texto = (searchInput?.value || "").trim().toLowerCase();
  const estado = estadoFilter?.value || "";

  let filtradas = [...vacantesGlobal];

  if (texto) {
    filtradas = filtradas.filter(v =>
      (v.titulo_puesto || "").toLowerCase().includes(texto) ||
      (v.nombre_comercial || "").toLowerCase().includes(texto) ||
      (v.nombre_categoria || "").toLowerCase().includes(texto)
    );
  }

  if (estado) {
    filtradas = filtradas.filter(v => (v.estado || "") === estado);
  }

  renderVacantes(filtradas);
  renderResumen(filtradas);
  renderActividad(filtradas);
};

const limpiarFiltros = () => {
  if (searchInput) searchInput.value = "";
  if (estadoFilter) estadoFilter.value = "";
  renderVacantes(vacantesGlobal);
  renderResumen(vacantesGlobal);
  renderActividad(vacantesGlobal);
};

const exportarLista = () => {
  if (!vacantesGlobal.length) {
    showAlert("No hay datos para exportar.", "warning");
    return;
  }

  const headers = ["ID", "Título", "Empresa", "Categoría", "Modalidad", "Estado", "Fecha Publicación"];

  const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

  const rows = vacantesGlobal.map(v => [
    v.id_vacante,
    v.titulo_puesto,
    v.nombre_comercial,
    v.nombre_categoria,
    v.modalidad,
    v.estado,
    formatearFecha(v.fecha_publicacion)
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(escapeCsv).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = `vacantes_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showAlert("Lista exportada correctamente.", "success");
};

const limpiarFormularioVacante = () => {
  document.getElementById("vacanteId").value = "";
  document.getElementById("modalTitle").textContent = "Nueva Vacante";
  document.getElementById("formVacante").reset();
};

const guardarVacante = async () => {
  const id = document.getElementById("vacanteId").value.trim();

  const payload = {
    titulo_puesto: document.getElementById("tituloPuesto").value.trim(),
    nombre_comercial: document.getElementById("nombreEmpresa").value.trim(),
    nombre_categoria: document.getElementById("categoria").value.trim(),
    modalidad: document.getElementById("modalidad").value,
    descripcion: document.getElementById("descripcion").value.trim(),
    estado: document.getElementById("estadoVacante").value
  };

  if (!payload.titulo_puesto) {
    showAlert("El título del puesto es requerido.", "warning");
    return;
  }

  try {
    showLoading(true);

    const url = id ? `${API_URL}/admin/vacantes/${id}` : `${API_URL}/admin/vacantes`;
    const method = id ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload)
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
      showAlert(data.mensaje || "No se pudo guardar la vacante.");
      return;
    }

    showAlert(id ? "Vacante actualizada correctamente." : "Vacante creada correctamente.", "success");
    await cargarVacantes();

    const modal = bootstrap.Modal.getInstance(document.getElementById("modalVacante"));
    modal?.hide();
    limpiarFormularioVacante();
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor.");
  } finally {
    showLoading(false);
  }
};

const cambiarEstadoVacante = async (id, nuevoEstado) => {
  try {
    showLoading(true);

    const response = await fetch(`${API_URL}/admin/vacantes/${id}/estado`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ estado: nuevoEstado })
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
      showAlert(data.mensaje || "No se pudo cambiar el estado de la vacante.");
      return;
    }

    showAlert("Estado de vacante actualizado correctamente.", "success");
    await cargarVacantes();
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor.");
  } finally {
    showLoading(false);
  }
};

const eliminarVacante = async (id) => {
  try {
    showLoading(true);

    const response = await fetch(`${API_URL}/admin/vacantes/${id}`, {
      method: "DELETE",
      headers: authHeaders()
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
      showAlert(data.mensaje || "No se pudo eliminar la vacante.");
      return;
    }

    showAlert("Vacante eliminada correctamente.", "success");
    await cargarVacantes();
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor.");
  } finally {
    showLoading(false);
  }
};

const cargarVacantes = async () => {
  try {
    showLoading(true);

    const response = await fetch(`${API_URL}/admin/vacantes`, {
      headers: authHeaders()
    });

    let data = [];
    try {
      data = await response.json();
    } catch {
      data = [];
    }

    if (response.status === 401 || response.status === 403) {
      if (typeof clearSession === "function") {
        clearSession();
      }
      window.location.href = "../../public/login/index.html";
      return;
    }

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudieron cargar las vacantes.");
      vacantesGlobal = [];
      renderVacantes([]);
      renderResumen([]);
      renderActividad([]);
      return;
    }

    vacantesGlobal = Array.isArray(data) ? data : [];
    renderVacantes(vacantesGlobal);
    renderResumen(vacantesGlobal);
    renderActividad(vacantesGlobal);
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor.");
    vacantesGlobal = [];
    renderVacantes([]);
    renderResumen([]);
    renderActividad([]);
  } finally {
    showLoading(false);
  }
};

btnFiltrar?.addEventListener("click", aplicarFiltroLocal);
btnLimpiarFiltros?.addEventListener("click", limpiarFiltros);
btnExportar?.addEventListener("click", exportarLista);
btnGuardarVacante?.addEventListener("click", guardarVacante);
btnNuevaVacante?.addEventListener("click", limpiarFormularioVacante);

searchInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    aplicarFiltroLocal();
  }
});

document.getElementById("modalVacante")?.addEventListener("hidden.bs.modal", () => {
  limpiarFormularioVacante();
});

cargarVacantes();