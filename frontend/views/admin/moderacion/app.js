import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth } from "../../../assets/js/shared/auth.js";

requireAuth(["admin"]);
const alertContainer = document.getElementById("alertContainer");
const tablaModeracion = document.getElementById("tablaModeracion");
const filtroModeracion = document.getElementById("filtroModeracion");
const btnFiltrar = document.getElementById("btnFiltrar");

const resumenUsuarios = document.getElementById("resumenUsuarios");
const resumenEmpresas = document.getElementById("resumenEmpresas");
const resumenVacantes = document.getElementById("resumenVacantes");
const resumenTotal = document.getElementById("resumenTotal");

const actividadModeracion = document.getElementById("actividadModeracion");
const loadingSpinner = document.querySelector(".loading-spinner");

let usuariosGlobal = [];
let empresasGlobal = [];
let vacantesGlobal = [];
let itemsModeracion = [];



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

const getEstadoBadge = (estado) => {
  const estados = {
    Activo: { class: "success", icon: "check-circle", text: "Activo" },
    Pendiente: { class: "warning text-dark", icon: "clock", text: "Pendiente" },
    Suspendido: { class: "danger", icon: "exclamation-triangle", text: "Suspendido" },
    Rechazado: { class: "danger", icon: "x-circle", text: "Rechazado" },
    "Revisión general": { class: "info", icon: "eye", text: "En revisión" },
    Publicada: { class: "success", icon: "check-circle", text: "Publicada" },
    Reportada: { class: "danger", icon: "exclamation-triangle", text: "Reportada" }
  };

  const estadoInfo = estados[estado] || {
    class: "secondary",
    icon: "question-circle",
    text: estado || "N/D"
  };

  return `
    <span class="badge bg-${estadoInfo.class} px-3 py-2">
      <i class="bi bi-${estadoInfo.icon} me-1"></i>${estadoInfo.text}
    </span>
  `;
};

const buildItems = (usuarios, empresas, vacantes) => {
  const itemsUsuarios = usuarios.map(item => ({
    id: item.id_usuario || item.id,
    titulo: `${item.nombres || ""} ${item.apellidos || ""}`.trim() || "Usuario",
    tipo: "Usuario",
    origen: item.correo_electronico || "Sin correo",
    detalle: item.telefono || item.nombre_municipio || "Sin detalle",
    estado: item.estado || "Activo",
    fecha: item.fecha_registro || new Date().toISOString()
  }));

  const itemsEmpresas = empresas.map(item => ({
    id: item.id_empresa || item.id,
    titulo: item.nombre_comercial || "Empresa",
    tipo: "Empresa",
    origen: item.correo_electronico || "Sin correo",
    detalle: item.sitio_web || "Sin sitio web",
    estado: item.estado || "Revisión general",
    fecha: item.fecha_registro || new Date().toISOString()
  }));

  const itemsVacantes = vacantes.map(item => ({
    id: item.id_vacante || item.id,
    titulo: item.titulo_puesto || "Vacante",
    tipo: "Vacante",
    origen: item.nombre_comercial || "Sin empresa",
    detalle: `${item.nombre_categoria || "Sin categoría"} · ${item.modalidad || "N/D"}`,
    estado: item.estado || "Publicada",
    fecha: item.fecha_publicacion || new Date().toISOString()
  }));

  return [...itemsUsuarios, ...itemsEmpresas, ...itemsVacantes].sort(
    (a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0)
  );
};

const renderResumen = (usuarios, empresas, vacantes) => {
  if (resumenUsuarios) resumenUsuarios.textContent = usuarios.length;
  if (resumenEmpresas) resumenEmpresas.textContent = empresas.length;
  if (resumenVacantes) resumenVacantes.textContent = vacantes.length;
  if (resumenTotal) resumenTotal.textContent = usuarios.length + empresas.length + vacantes.length;
};

const renderActividad = (items) => {
  if (!actividadModeracion) return;

  const top = items.slice(0, 3);

  if (!top.length) {
    actividadModeracion.innerHTML = `
      <div class="p-3 rounded-4 bg-light border-start border-4 border-primary text-muted">
        <i class="bi bi-info-circle me-2"></i>No hay actividad disponible.
      </div>
    `;
    return;
  }

  actividadModeracion.innerHTML = top.map((item, index) => {
    const colorBorder = index === 0 ? "primary" : index === 1 ? "danger" : "success";
    const icono = index === 0 ? "plus-circle" : index === 1 ? "exclamation-triangle" : "check-circle";

    return `
      <div class="p-3 rounded-4 bg-light border-start border-4 border-${colorBorder}">
        <div class="d-flex justify-content-between align-items-center">
          <h6 class="fw-bold mb-1">
            <i class="bi bi-${icono} me-2 text-${colorBorder}"></i>
            ${item.titulo}
          </h6>
          <small class="text-muted">${item.tipo} · ${formatearFecha(item.fecha)}</small>
        </div>
        <p class="small mb-0 text-muted">${item.origen} · ${item.detalle}</p>
      </div>
    `;
  }).join("");
};

const actualizarEstadoItem = async (item, nuevoEstado) => {
  try {
    showLoading(true);

    const tipoPath =
      item.tipo === "Usuario" ? "usuarios" :
      item.tipo === "Empresa" ? "empresas" :
      "vacantes";

    const response = await fetch(`${API_URL}/admin/${tipoPath}/${item.id}/estado`, {
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
      showAlert(data.mensaje || `No se pudo actualizar el estado de ${item.tipo}.`);
      return;
    }

    showAlert(`${item.tipo} "${item.titulo}" actualizado correctamente.`, "success");
    await cargarModeracion();
  } catch (error) {
    console.error(error);
    showAlert(`Error de conexión al actualizar ${item.tipo}.`);
  } finally {
    showLoading(false);
  }
};

const eliminarItem = async (item) => {
  try {
    showLoading(true);

    const tipoPath =
      item.tipo === "Usuario" ? "usuarios" :
      item.tipo === "Empresa" ? "empresas" :
      "vacantes";

    const response = await fetch(`${API_URL}/admin/${tipoPath}/${item.id}`, {
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
      showAlert(data.mensaje || `No se pudo eliminar ${item.tipo}.`);
      return;
    }

    showAlert(`${item.tipo} "${item.titulo}" eliminado correctamente.`, "success");
    await cargarModeracion();
  } catch (error) {
    console.error(error);
    showAlert(`Error de conexión al eliminar ${item.tipo}.`);
  } finally {
    showLoading(false);
  }
};

const renderTabla = (items) => {
  if (!tablaModeracion) return;

  if (!items.length) {
    tablaModeracion.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-muted py-5">
          <i class="bi bi-inbox fs-1 d-block mb-2"></i>
          No hay elementos para mostrar
        </td>
      </tr>
    `;
    return;
  }

  tablaModeracion.innerHTML = items.map(item => `
    <tr>
      <td>
        <div class="fw-bold">${item.titulo}</div>
        <div class="small text-muted">ID: ${item.id || "N/D"}</div>
      </td>
      <td>
        <span class="badge bg-secondary px-3 py-2">
          <i class="bi bi-${item.tipo === "Usuario" ? "person" : item.tipo === "Empresa" ? "building" : "file-text"} me-1"></i>
          ${item.tipo}
        </span>
      </td>
      <td>${item.origen}</td>
      <td>${item.detalle}</td>
      <td>${getEstadoBadge(item.estado)}</td>
      <td>
        <div class="d-flex gap-2">
          ${item.estado !== "Suspendido"
            ? `<button class="btn btn-sm btn-outline-warning btn-suspender" data-id="${item.id}" data-tipo="${item.tipo}" title="Suspender">
                 <i class="bi bi-exclamation-triangle"></i>
               </button>`
            : `<button class="btn btn-sm btn-outline-success btn-activar" data-id="${item.id}" data-tipo="${item.tipo}" title="Activar">
                 <i class="bi bi-check-circle"></i>
               </button>`
          }
          <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${item.id}" data-tipo="${item.tipo}" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join("");

  document.querySelectorAll(".btn-suspender").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = itemsModeracion.find(i => String(i.id) === String(btn.dataset.id) && i.tipo === btn.dataset.tipo);
      if (!item) return;

      const modal = new bootstrap.Modal(document.getElementById("modalConfirmacion"));
      document.getElementById("confirmacionMensaje").innerHTML =
        `¿Estás seguro de que deseas <strong>SUSPENDER</strong> ${item.tipo} "${item.titulo}"?`;

      document.getElementById("confirmarAccionBtn").onclick = async () => {
        await actualizarEstadoItem(item, "Suspendido");
        modal.hide();
      };

      modal.show();
    });
  });

  document.querySelectorAll(".btn-activar").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = itemsModeracion.find(i => String(i.id) === String(btn.dataset.id) && i.tipo === btn.dataset.tipo);
      if (!item) return;

      const modal = new bootstrap.Modal(document.getElementById("modalConfirmacion"));
      document.getElementById("confirmacionMensaje").innerHTML =
        `¿Estás seguro de que deseas <strong>ACTIVAR</strong> ${item.tipo} "${item.titulo}"?`;

      document.getElementById("confirmarAccionBtn").onclick = async () => {
        const nuevoEstado = item.tipo === "Vacante" ? "Publicada" : "Activo";
        await actualizarEstadoItem(item, nuevoEstado);
        modal.hide();
      };

      modal.show();
    });
  });

  document.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = itemsModeracion.find(i => String(i.id) === String(btn.dataset.id) && i.tipo === btn.dataset.tipo);
      if (!item) return;

      const modal = new bootstrap.Modal(document.getElementById("modalConfirmacion"));
      document.getElementById("confirmacionMensaje").innerHTML =
        `¿Estás seguro de que deseas <strong>ELIMINAR</strong> ${item.tipo} "${item.titulo}"? Esta acción no se puede deshacer.`;

      document.getElementById("confirmarAccionBtn").onclick = async () => {
        await eliminarItem(item);
        modal.hide();
      };

      modal.show();
    });
  });
};

const cargarModeracion = async () => {
  try {
    showLoading(true);

    const headers = { Authorization: `Bearer ${getToken()}` };

    const [usuariosRes, empresasRes, vacantesRes] = await Promise.all([
      fetch(`${API_URL}/admin/usuarios`, { headers }),
      fetch(`${API_URL}/admin/empresas`, { headers }),
      fetch(`${API_URL}/admin/vacantes`, { headers })
    ]);

    if (
      usuariosRes.status === 401 || usuariosRes.status === 403 ||
      empresasRes.status === 401 || empresasRes.status === 403 ||
      vacantesRes.status === 401 || vacantesRes.status === 403
    ) {
      if (typeof clearSession === "function") {
        clearSession();
      }
      window.location.href = "../../public/login/index.html";
      return;
    }

    let usuariosData = [];
    let empresasData = [];
    let vacantesData = [];

    try { usuariosData = await usuariosRes.json(); } catch {}
    try { empresasData = await empresasRes.json(); } catch {}
    try { vacantesData = await vacantesRes.json(); } catch {}

    if (!usuariosRes.ok || !empresasRes.ok || !vacantesRes.ok) {
      showAlert("No se pudieron cargar los datos de moderación.");
      usuariosGlobal = [];
      empresasGlobal = [];
      vacantesGlobal = [];
      itemsModeracion = [];
      renderResumen([], [], []);
      renderTabla([]);
      renderActividad([]);
      return;
    }

    usuariosGlobal = Array.isArray(usuariosData) ? usuariosData : [];
    empresasGlobal = Array.isArray(empresasData) ? empresasData : [];
    vacantesGlobal = Array.isArray(vacantesData) ? vacantesData : [];

    itemsModeracion = buildItems(usuariosGlobal, empresasGlobal, vacantesGlobal);

    renderResumen(usuariosGlobal, empresasGlobal, vacantesGlobal);
    renderTabla(itemsModeracion);
    renderActividad(itemsModeracion);
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor.");
    usuariosGlobal = [];
    empresasGlobal = [];
    vacantesGlobal = [];
    itemsModeracion = [];
    renderResumen([], [], []);
    renderTabla([]);
    renderActividad([]);
  } finally {
    showLoading(false);
  }
};

const aplicarFiltro = () => {
  const texto = (filtroModeracion?.value || "").trim().toLowerCase();

  if (!texto) {
    renderTabla(itemsModeracion);
    renderActividad(itemsModeracion);
    return;
  }

  const filtrados = itemsModeracion.filter(item =>
    (item.titulo || "").toLowerCase().includes(texto) ||
    (item.tipo || "").toLowerCase().includes(texto) ||
    (item.origen || "").toLowerCase().includes(texto) ||
    (item.detalle || "").toLowerCase().includes(texto)
  );

  renderTabla(filtrados);
  renderActividad(filtrados);
};

btnFiltrar?.addEventListener("click", aplicarFiltro);

filtroModeracion?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    aplicarFiltro();
  }
});

cargarModeracion();