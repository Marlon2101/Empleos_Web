import { API_URL, getToken, clearSession } from "../../../assets/js/shared/config.js";
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
const actividadVacantes = document.getElementById("actividadVacantes");
const resumenTotal = document.getElementById("resumenTotal");
const resumenActivas = document.getElementById("resumenActivas");
const resumenPausadas = document.getElementById("resumenPausadas");
const resumenReportadas = document.getElementById("resumenReportadas");
const selectEmpresa = document.getElementById("nombreEmpresa");
const selectCategoria = document.getElementById("categoria");

let vacantesGlobal = [];

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json"
});

const redirectToLogin = () => {
  clearSession();
  window.location.href = "../../public/login/index.html";
};

const showAlert = (message, type = "danger") => {
  if (!alertContainer) return;
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show rounded-4" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
};

const formatearFecha = (fecha) => {
  if (!fecha) return "N/D";
  const parsed = new Date(fecha);
  if (Number.isNaN(parsed.getTime())) return "N/D";
  return parsed.toLocaleDateString("es-SV");
};

const renderSelectOptions = (select, items, valueKey, labelBuilder, placeholder) => {
  if (!select) return;
  select.innerHTML = [`<option value="">${placeholder}</option>`]
    .concat(items.map((item) => `<option value="${item[valueKey]}">${labelBuilder(item)}</option>`))
    .join("");
};

const cargarCatalogos = async () => {
  const [empresasResponse, categoriasResponse] = await Promise.all([
    fetch(`${API_URL}/admin/empresas`, { headers: authHeaders() }),
    fetch(`${API_URL}/catalogos/categorias`)
  ]);

  if (empresasResponse.status === 401 || empresasResponse.status === 403) {
    redirectToLogin();
    return false;
  }

  if (!empresasResponse.ok || !categoriasResponse.ok) {
    throw new Error("No se pudieron cargar empresas o categorías.");
  }

  const empresas = await empresasResponse.json();
  const categorias = await categoriasResponse.json();

  renderSelectOptions(selectEmpresa, empresas, "id_empresa", (item) => item.nombre_comercial, "Selecciona una empresa");
  renderSelectOptions(selectCategoria, categorias, "id_categoria", (item) => item.nombre_categoria, "Selecciona una categoría");

  return true;
};

const renderResumen = (vacantes) => {
  if (resumenTotal) resumenTotal.textContent = vacantes.length;
  if (resumenActivas) resumenActivas.textContent = vacantes.filter((item) => (item.estado || "Activo") === "Activo").length;
  if (resumenPausadas) resumenPausadas.textContent = vacantes.filter((item) => item.estado === "Pausada").length;
  if (resumenReportadas) resumenReportadas.textContent = vacantes.filter((item) => item.estado === "Reportada").length;
};

const renderActividad = (vacantes) => {
  if (!actividadVacantes) return;

  const top = [...vacantes]
    .sort((a, b) => new Date(b.fecha_publicacion || 0) - new Date(a.fecha_publicacion || 0))
    .slice(0, 3);

  if (!top.length) {
    actividadVacantes.innerHTML = `
      <div class="p-3 rounded-4 bg-light border-start border-4 border-primary text-muted">
        No hay actividad disponible.
      </div>
    `;
    return;
  }

  actividadVacantes.innerHTML = top.map((vacante, index) => `
    <div class="p-3 rounded-4 bg-light border-start border-4 ${index === 0 ? "border-primary" : index === 1 ? "border-success" : "border-warning"}">
      <div class="d-flex justify-content-between align-items-center">
        <h6 class="fw-bold mb-1">${vacante.titulo_puesto || "Vacante"}</h6>
        <small class="text-muted">${formatearFecha(vacante.fecha_publicacion)}</small>
      </div>
      <p class="small mb-0 text-muted">${vacante.nombre_comercial || "Empresa"} · ${vacante.modalidad || "N/D"} · ${vacante.estado || "Activo"}</p>
    </div>
  `).join("");
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

  tablaVacantes.innerHTML = vacantes.map((vacante) => `
    <tr>
      <td>
        <div class="fw-bold">${vacante.titulo_puesto || "N/D"}</div>
        <div class="small text-muted">${vacante.modalidad || "N/D"} · ${vacante.nombre_categoria || "Sin categoría"}</div>
      </td>
      <td>${vacante.nombre_comercial || "N/D"}</td>
      <td><span class="badge bg-${vacante.estado === "Pausada" ? "warning text-dark" : vacante.estado === "Reportada" ? "danger" : "success"} px-3 py-2">${vacante.estado || "Activo"}</span></td>
      <td class="text-muted">${formatearFecha(vacante.fecha_publicacion)}</td>
      <td>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-info btn-ver" data-id="${vacante.id_vacante}"><i class="bi bi-eye"></i></button>
          <button class="btn btn-sm btn-outline-warning btn-editar" data-id="${vacante.id_vacante}"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-secondary btn-estado" data-id="${vacante.id_vacante}" data-estado="Pausada"><i class="bi bi-pause-circle"></i></button>
          <button class="btn btn-sm btn-outline-primary btn-estado" data-id="${vacante.id_vacante}" data-estado="Activo"><i class="bi bi-play-circle"></i></button>
          <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${vacante.id_vacante}"><i class="bi bi-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join("");

  tablaVacantes.querySelectorAll(".btn-ver").forEach((button) => {
    button.addEventListener("click", () => {
      const vacante = vacantesGlobal.find((item) => String(item.id_vacante) === button.dataset.id);
      if (!vacante) return;
      showAlert(`
        <strong>${vacante.titulo_puesto}</strong><br>
        Empresa: ${vacante.nombre_comercial}<br>
        Categoría: ${vacante.nombre_categoria}<br>
        Modalidad: ${vacante.modalidad || "N/D"}<br>
        Estado: ${vacante.estado || "Activo"}<br>
        Descripción: ${vacante.descripcion_puesto || "Sin descripción"}
      `, "info");
    });
  });

  tablaVacantes.querySelectorAll(".btn-editar").forEach((button) => {
    button.addEventListener("click", () => {
      const vacante = vacantesGlobal.find((item) => String(item.id_vacante) === button.dataset.id);
      if (!vacante) return;

      document.getElementById("modalTitle").textContent = "Editar Vacante";
      document.getElementById("vacanteId").value = vacante.id_vacante;
      document.getElementById("tituloPuesto").value = vacante.titulo_puesto || "";
      document.getElementById("nombreEmpresa").value = vacante.id_empresa_fk || "";
      document.getElementById("categoria").value = vacante.id_categoria_fk || "";
      document.getElementById("modalidad").value = vacante.modalidad || "Presencial";
      document.getElementById("descripcion").value = vacante.descripcion_puesto || "";
      document.getElementById("estadoVacante").value = vacante.estado || "Activo";

      new bootstrap.Modal(document.getElementById("modalVacante")).show();
    });
  });

  tablaVacantes.querySelectorAll(".btn-estado").forEach((button) => {
    button.addEventListener("click", async () => {
      await cambiarEstadoVacante(button.dataset.id, button.dataset.estado);
    });
  });

  tablaVacantes.querySelectorAll(".btn-eliminar").forEach((button) => {
    button.addEventListener("click", async () => {
      if (window.confirm("¿Seguro que deseas eliminar esta vacante?")) {
        await eliminarVacante(button.dataset.id);
      }
    });
  });
};

const aplicarFiltroLocal = () => {
  const texto = (searchInput?.value || "").trim().toLowerCase();
  const estado = estadoFilter?.value || "";

  const filtradas = vacantesGlobal.filter((vacante) => {
    const coincideTexto = !texto ||
      (vacante.titulo_puesto || "").toLowerCase().includes(texto) ||
      (vacante.nombre_comercial || "").toLowerCase().includes(texto) ||
      (vacante.nombre_categoria || "").toLowerCase().includes(texto);

    const coincideEstado = !estado || (vacante.estado || "Activo") === estado;
    return coincideTexto && coincideEstado;
  });

  renderVacantes(filtradas);
  renderResumen(filtradas);
  renderActividad(filtradas);
};

const limpiarFormularioVacante = () => {
  document.getElementById("vacanteId").value = "";
  document.getElementById("formVacante").reset();
  document.getElementById("modalTitle").textContent = "Nueva Vacante";
};

const obtenerPayloadVacante = () => ({
  id_empresa_fk: document.getElementById("nombreEmpresa").value,
  id_categoria_fk: document.getElementById("categoria").value,
  titulo_puesto: document.getElementById("tituloPuesto").value.trim(),
  descripcion_puesto: document.getElementById("descripcion").value.trim(),
  modalidad: document.getElementById("modalidad").value,
  estado: document.getElementById("estadoVacante").value
});

const guardarVacante = async () => {
  const id = document.getElementById("vacanteId").value.trim();
  const payload = obtenerPayloadVacante();

  if (!payload.id_empresa_fk || !payload.id_categoria_fk || !payload.titulo_puesto || !payload.descripcion_puesto) {
    showAlert("Completa empresa, categoría, título y descripción.", "warning");
    return;
  }

  const response = await fetch(id ? `${API_URL}/admin/vacantes/${id}` : `${API_URL}/admin/vacantes`, {
    method: id ? "PUT" : "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });

  let data = {};
  try {
    data = await response.json();
  } catch {}

  if (response.status === 401 || response.status === 403) {
    redirectToLogin();
    return;
  }

  if (!response.ok) {
    showAlert(data.mensaje || "No se pudo guardar la vacante.");
    return;
  }

  showAlert(id ? "Vacante actualizada correctamente." : "Vacante creada correctamente.", "success");
  bootstrap.Modal.getInstance(document.getElementById("modalVacante"))?.hide();
  limpiarFormularioVacante();
  await cargarVacantes();
};

const cambiarEstadoVacante = async (id, estado) => {
  const response = await fetch(`${API_URL}/admin/vacantes/${id}/estado`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ estado })
  });

  let data = {};
  try {
    data = await response.json();
  } catch {}

  if (response.status === 401 || response.status === 403) {
    redirectToLogin();
    return;
  }

  if (!response.ok) {
    showAlert(data.mensaje || "No se pudo cambiar el estado.");
    return;
  }

  showAlert("Estado actualizado correctamente.", "success");
  await cargarVacantes();
};

const eliminarVacante = async (id) => {
  const response = await fetch(`${API_URL}/admin/vacantes/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });

  let data = {};
  try {
    data = await response.json();
  } catch {}

  if (response.status === 401 || response.status === 403) {
    redirectToLogin();
    return;
  }

  if (!response.ok) {
    showAlert(data.mensaje || "No se pudo eliminar la vacante.");
    return;
  }

  showAlert("Vacante eliminada correctamente.", "success");
  await cargarVacantes();
};

const cargarVacantes = async () => {
  const response = await fetch(`${API_URL}/admin/vacantes`, {
    headers: authHeaders()
  });

  let data = [];
  try {
    data = await response.json();
  } catch {}

  if (response.status === 401 || response.status === 403) {
    redirectToLogin();
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
};

const exportarLista = () => {
  if (!vacantesGlobal.length) {
    showAlert("No hay datos para exportar.", "warning");
    return;
  }

  const rows = [
    ["ID", "Titulo", "Empresa", "Categoria", "Estado", "Fecha"],
    ...vacantesGlobal.map((vacante) => [
      vacante.id_vacante,
      vacante.titulo_puesto,
      vacante.nombre_comercial,
      vacante.nombre_categoria,
      vacante.estado || "Activo",
      formatearFecha(vacante.fecha_publicacion)
    ])
  ];

  const csv = rows
    .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `vacantes_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

btnFiltrar?.addEventListener("click", aplicarFiltroLocal);
btnLimpiarFiltros?.addEventListener("click", () => {
  if (searchInput) searchInput.value = "";
  if (estadoFilter) estadoFilter.value = "";
  renderVacantes(vacantesGlobal);
  renderResumen(vacantesGlobal);
  renderActividad(vacantesGlobal);
});
btnExportar?.addEventListener("click", exportarLista);
btnNuevaVacante?.addEventListener("click", limpiarFormularioVacante);
btnGuardarVacante?.addEventListener("click", guardarVacante);
searchInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") aplicarFiltroLocal();
});
document.getElementById("modalVacante")?.addEventListener("hidden.bs.modal", limpiarFormularioVacante);

await cargarCatalogos();
await cargarVacantes();
