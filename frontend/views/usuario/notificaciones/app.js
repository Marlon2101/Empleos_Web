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

const ICONOS = {
  postulacion: "bi-briefcase-fill",
  estado: "bi-arrow-repeat",
  sistema: "bi-bell-fill",
  comentario: "bi-chat-left-text-fill"
};

const resolveNotificationLink = (value) => {
  if (!value) {
    return null;
  }

  try {
    return new URL(value, window.location.origin).toString();
  } catch {
    return value;
  }
};

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`
});

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
  if (!fecha) return "Reciente";

  const date = new Date(fecha);
  return Number.isNaN(date.getTime())
    ? "Reciente"
    : date.toLocaleString("es-SV", { dateStyle: "medium", timeStyle: "short" });
};

const obtenerFiltros = () => {
  const params = new URLSearchParams();

  if (filtroTipo?.value) params.set("tipo_notificacion", filtroTipo.value);
  if (filtroLeida?.value) params.set("leida", filtroLeida.value);
  if (inputBuscar?.value.trim()) params.set("search", inputBuscar.value.trim());

  return params.toString();
};

const actualizarResumen = async () => {
  const response = await fetch(`${API_URL}/notificaciones/resumen`, {
    headers: authHeaders()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo cargar el resumen");
  }

  if (resumenNoLeidas) resumenNoLeidas.textContent = data.no_leidas ?? 0;
  if (resumenPostulaciones) resumenPostulaciones.textContent = data.postulaciones ?? 0;
  if (resumenEstado) resumenEstado.textContent = data.cambios_estado ?? 0;
  if (resumenSistema) resumenSistema.textContent = data.sistema ?? 0;
};

const renderNotificaciones = (items) => {
  if (!listaNotificaciones) return;

  if (!items.length) {
    listaNotificaciones.innerHTML = `
      <div class="text-center py-5 text-muted border rounded-4 bg-light">
        No hay notificaciones que coincidan con tus filtros.
      </div>
    `;
    return;
  }

  listaNotificaciones.innerHTML = items.map((item) => `
    <article class="notification-card ${Number(item.leida) === 0 ? "unread" : ""} p-4">
      <div class="d-flex gap-3">
        <div class="icon-pill flex-shrink-0">
          <i class="bi ${ICONOS[item.tipo_notificacion] || ICONOS.sistema} fs-5"></i>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex flex-column flex-md-row justify-content-between gap-2 mb-2">
            <div>
              <h3 class="h6 fw-bold mb-1">${item.titulo}</h3>
              <span class="badge badge-soft rounded-pill text-uppercase">${item.tipo_notificacion || "sistema"}</span>
            </div>
            <small class="text-muted">${formatearFecha(item.fecha_creacion)}</small>
          </div>
          <p class="text-muted mb-3">${item.mensaje}</p>
          <div class="d-flex flex-wrap gap-2">
            <button class="btn btn-sm ${Number(item.leida) === 0 ? "btn-outline-primary" : "btn-outline-secondary"} rounded-pill" data-action="toggle" data-id="${item.id_notificacion}" data-leida="${item.leida}">
              <i class="bi ${Number(item.leida) === 0 ? "bi-check2" : "bi-envelope"} me-1"></i>
              ${Number(item.leida) === 0 ? "Marcar leida" : "Marcar no leida"}
            </button>
            ${item.enlace ? `
              <a class="btn btn-sm btn-light rounded-pill" href="${resolveNotificationLink(item.enlace)}">
                <i class="bi bi-box-arrow-up-right me-1"></i>Ir al detalle
              </a>
            ` : ""}
            <button class="btn btn-sm btn-outline-danger rounded-pill" data-action="delete" data-id="${item.id_notificacion}">
              <i class="bi bi-trash3 me-1"></i>Eliminar
            </button>
          </div>
        </div>
      </div>
    </article>
  `).join("");

  listaNotificaciones.querySelectorAll("[data-action='toggle']").forEach((button) => {
    button.addEventListener("click", async () => {
      await toggleLeida(button.dataset.id, button.dataset.leida);
    });
  });

  listaNotificaciones.querySelectorAll("[data-action='delete']").forEach((button) => {
    button.addEventListener("click", async () => {
      await eliminarNotificacion(button.dataset.id);
    });
  });
};

const cargarNotificaciones = async () => {
  const query = obtenerFiltros();
  const response = await fetch(`${API_URL}/notificaciones${query ? `?${query}` : ""}`, {
    headers: authHeaders()
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
    headers: authHeaders()
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
    headers: authHeaders()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo eliminar la notificacion");
  }

  showAlert(data.mensaje, "success");
  await init();
};

btnMarcarTodas?.addEventListener("click", async () => {
  try {
    const response = await fetch(`${API_URL}/notificaciones/marcar-todas/leidas`, {
      method: "PUT",
      headers: authHeaders()
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

btnFiltrar?.addEventListener("click", async () => {
  try {
    await init();
  } catch (error) {
    showAlert(error.message);
  }
});

inputBuscar?.addEventListener("keydown", async (event) => {
  if (event.key !== "Enter") return;

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
