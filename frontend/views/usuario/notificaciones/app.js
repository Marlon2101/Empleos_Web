import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth, logout } from "../../../assets/js/shared/auth.js";

requireAuth(["usuario"]);

const btnLogout = document.getElementById("btnLogout");
const btnMarcarTodas = document.getElementById("btnMarcarTodas");
const listaNotificaciones = document.getElementById("listaNotificaciones");
const alertContainer = document.getElementById("alertContainer");

btnLogout.addEventListener("click", logout);

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
};

const formatearFecha = (fecha) => {
  if (!fecha) return "N/D";
  return new Date(fecha).toLocaleString("es-SV");
};

const renderNotificaciones = (items) => {
  if (!items || items.length === 0) {
    listaNotificaciones.innerHTML = `<p class="text-muted mb-0">No tienes notificaciones todavía.</p>`;
    return;
  }

  listaNotificaciones.innerHTML = items.map(item => `
    <div class="notificacion-item ${Number(item.leida) === 0 ? "notificacion-no-leida" : ""}">
      <div class="d-flex justify-content-between align-items-start gap-3">
        <div>
          <div class="notificacion-titulo mb-1">${item.titulo}</div>
          <div class="mb-2">${item.mensaje}</div>
          <div class="notificacion-meta">${formatearFecha(item.fecha_creacion)}</div>
        </div>
        <div class="text-end">
          ${
            Number(item.leida) === 0
              ? `<button class="btn btn-sm btn-outline-primary btn-marcar" data-id="${item.id_notificacion}">Marcar leída</button>`
              : `<span class="badge text-bg-success">Leída</span>`
          }
        </div>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".btn-marcar").forEach(btn => {
    btn.addEventListener("click", async () => {
      await marcarLeida(btn.dataset.id);
    });
  });
};

const cargarNotificaciones = async () => {
  try {
    const response = await fetch(`${API_URL}/notificaciones`, {
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudieron cargar las notificaciones");
      return;
    }

    renderNotificaciones(data);
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
};

const marcarLeida = async (id) => {
  try {
    const response = await fetch(`${API_URL}/notificaciones/${id}/leida`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudo marcar la notificación");
      return;
    }

    showAlert("Notificación marcada como leída", "success");
    await cargarNotificaciones();
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
};

btnMarcarTodas.addEventListener("click", async () => {
  try {
    const response = await fetch(`${API_URL}/notificaciones/marcar-todas/leidas`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudieron marcar todas");
      return;
    }

    showAlert("Todas las notificaciones fueron marcadas como leídas", "success");
    await cargarNotificaciones();
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
});

cargarNotificaciones();