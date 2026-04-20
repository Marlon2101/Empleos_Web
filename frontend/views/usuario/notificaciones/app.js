import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth } from "../../../assets/js/shared/auth.js";

requireAuth(["usuario"]);

const alertContainer = document.getElementById("alertContainer");
const listaNotificaciones = document.getElementById("listaNotificaciones");
const btnMarcarTodas = document.getElementById("btnMarcarTodas");
const btnFiltrar = document.getElementById("btnFiltrar");
const filtroTipo = document.getElementById("filtroTipo");
const filtroLeida = document.getElementById("filtroLeida");
const inputBuscar = document.getElementById("inputBuscar");

const resumenNoLeidas = document.getElementById("resumenNoLeidas");
const resumenPostulaciones = document.getElementById("resumenPostulaciones");
const resumenEstado = document.getElementById("resumenEstado");
const resumenSistema = document.getElementById("resumenSistema");
const resumenTotal = document.getElementById("resumenTotal");

const ICONOS = {
  postulacion: "bi-send-check",
  estado: "bi-arrow-repeat",
  sistema: "bi-bell-fill",
  comentario: "bi-chat-left-text-fill"
};

const authHeaders = {
  Authorization: `Bearer ${getToken()}`
};

const resolveNotificationLink = (value) => {
  if (!value) {
    return null;
  }

  try {
    return new URL(value, API_URL).toString();
  } catch {
    return value;
  }
};

const showAlert = (message, type = "danger") => {
  if (!alertContainer) {
    return;
  }

  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show rounded-4 shadow-sm" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>
  `;
};

const formatDate = (value) => {
  if (!value) {
    return "Reciente";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Reciente"
    : date.toLocaleString("es-SV", { dateStyle: "medium", timeStyle: "short" });
};

const getFilterQuery = () => {
  const params = new URLSearchParams();

  if (filtroTipo.value) {
    params.set("tipo_notificacion", filtroTipo.value);
  }

  if (filtroLeida.value) {
    params.set("leida", filtroLeida.value);
  }

  if (inputBuscar.value.trim()) {
    params.set("search", inputBuscar.value.trim());
  }

  return params.toString();
};

const renderResumen = (data) => {
  resumenNoLeidas.textContent = data.no_leidas ?? 0;
  resumenPostulaciones.textContent = data.postulaciones ?? 0;
  resumenEstado.textContent = data.cambios_estado ?? 0;
  resumenSistema.textContent = data.sistema ?? 0;
  resumenTotal.textContent = data.total ?? 0;
};

const getTypeLabel = (value) => {
  const labels = {
    postulacion: "Postulacion",
    estado: "Estado",
    sistema: "Sistema",
    comentario: "Comentario"
  };

  return labels[value] || "Sistema";
};

const renderNotificaciones = (items) => {
  if (!items.length) {
    listaNotificaciones.innerHTML = `
      <div class="empty-state text-center p-5 rounded-4">
        <div class="empty-state-icon mx-auto mb-3">
          <i class="bi bi-bell-slash fs-2"></i>
        </div>
        <h3 class="h5 fw-bold mb-2">No hay notificaciones para mostrar</h3>
        <p class="text-muted mb-0">Prueba otro filtro o espera nuevas respuestas de empresas.</p>
      </div>
    `;
    return;
  }

  listaNotificaciones.innerHTML = items.map((item) => `
    <article class="notification-card ${Number(item.leida) === 0 ? "is-unread" : ""}">
      <div class="d-flex gap-3">
        <div class="notification-icon flex-shrink-0">
          <i class="bi ${ICONOS[item.tipo_notificacion] || ICONOS.sistema}"></i>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex flex-column flex-lg-row justify-content-between gap-2 mb-2">
            <div>
              <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
                <h3 class="h6 fw-bold mb-0">${item.titulo}</h3>
                <span class="badge rounded-pill text-bg-light border text-uppercase">${getTypeLabel(item.tipo_notificacion)}</span>
                ${Number(item.leida) === 0 ? '<span class="badge rounded-pill text-bg-primary">Nuevo</span>' : ""}
              </div>
              <p class="text-muted mb-0">${item.mensaje}</p>
            </div>
            <small class="text-muted text-lg-end">${formatDate(item.fecha_creacion)}</small>
          </div>
          <div class="d-flex flex-wrap gap-2 mt-3">
            <button type="button" class="btn btn-sm ${Number(item.leida) === 0 ? "btn-outline-primary" : "btn-outline-secondary"} rounded-pill" data-action="toggle" data-id="${item.id_notificacion}" data-leida="${item.leida}">
              <i class="bi ${Number(item.leida) === 0 ? "bi-check2" : "bi-envelope"} me-1"></i>
              ${Number(item.leida) === 0 ? "Marcar leida" : "Marcar no leida"}
            </button>
            ${item.enlace ? `
              <a class="btn btn-sm btn-light rounded-pill border" href="${resolveNotificationLink(item.enlace)}">
                <i class="bi bi-box-arrow-up-right me-1"></i>Ver detalle
              </a>
            ` : ""}
            <button type="button" class="btn btn-sm btn-outline-danger rounded-pill" data-action="delete" data-id="${item.id_notificacion}">
              <i class="bi bi-trash3 me-1"></i>Eliminar
            </button>
          </div>
        </div>
      </div>
    </article>
  `).join("");

  document.querySelectorAll("[data-action='toggle']").forEach((button) => {
    button.addEventListener("click", async () => {
      await toggleLeida(button.dataset.id, button.dataset.leida);
    });
  });

  document.querySelectorAll("[data-action='delete']").forEach((button) => {
    button.addEventListener("click", async () => {
      await eliminarNotificacion(button.dataset.id);
    });
  });
};

const actualizarResumen = async () => {
  const response = await fetch(`${API_URL}/notificaciones/resumen`, {
    headers: authHeaders
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo cargar el resumen");
  }

  renderResumen(data);
};

const cargarNotificaciones = async () => {
  const query = getFilterQuery();
  const response = await fetch(`${API_URL}/notificaciones${query ? `?${query}` : ""}`, {
    headers: authHeaders
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudieron cargar las notificaciones");
  }

  renderNotificaciones(Array.isArray(data) ? data : []);
};

const toggleLeida = async (id, leida) => {
  const path = Number(leida) === 0 ? "leer" : "no-leida";
  const response = await fetch(`${API_URL}/notificaciones/${id}/${path}`, {
    method: "PUT",
    headers: authHeaders
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo actualizar la notificacion");
  }

  showAlert(data.mensaje, "success");
  await init();
};

const eliminarNotificacion = async (id) => {
  const response = await fetch(`${API_URL}/notificaciones/${id}`, {
    method: "DELETE",
    headers: authHeaders
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo eliminar la notificacion");
  }

  showAlert(data.mensaje, "success");
  await init();
};

btnMarcarTodas.addEventListener("click", async () => {
  try {
    const response = await fetch(`${API_URL}/notificaciones/marcar-todas/leidas`, {
      method: "PUT",
      headers: authHeaders
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "No se pudieron marcar todas las notificaciones");
    }

    showAlert(data.mensaje, "success");
    await init();
  } catch (error) {
    showAlert(error.message);
  }
});

btnFiltrar.addEventListener("click", async () => {
  try {
    await init();
  } catch (error) {
    showAlert(error.message);
  }
});

inputBuscar.addEventListener("keydown", async (event) => {
  if (event.key !== "Enter") {
    return;
  }

  event.preventDefault();

  try {
    await init();
  } catch (error) {
    showAlert(error.message);
  }
});

const init = async () => {
  await Promise.all([actualizarResumen(), cargarNotificaciones()]);
};

init().catch((error) => {
  console.error(error);
  showAlert(error.message || "No se pudo cargar la vista de notificaciones");
});
