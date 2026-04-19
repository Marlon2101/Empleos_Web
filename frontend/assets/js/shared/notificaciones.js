import { API_URL, getToken, getTipo } from "./config.js";

const NOTIFICATION_ICON = {
  postulacion: "bi-briefcase-fill",
  estado: "bi-arrow-repeat",
  sistema: "bi-bell-fill",
  comentario: "bi-chat-left-text-fill"
};

const formatDate = (value) => {
  if (!value) {
    return "Reciente";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Reciente";
  }

  return date.toLocaleString("es-SV", {
    dateStyle: "short",
    timeStyle: "short"
  });
};

const getNotificationsPage = () => {
  const tipo = getTipo();

  if (tipo === "empresa") {
    return "/views/empresa/notificaciones/index.html";
  }

  if (tipo === "admin") {
    return "/views/admin/principal/index.html";
  }

  return "/views/usuario/notificaciones/index.html";
};

const buildDropdown = (anchor) => {
  const wrapper = document.createElement("div");
  wrapper.className = "dropdown workly-notifications-dropdown";

  anchor.classList.add("dropdown-toggle");
  anchor.setAttribute("data-bs-toggle", "dropdown");
  anchor.setAttribute("data-bs-auto-close", "outside");
  anchor.setAttribute("aria-expanded", "false");

  const badge = anchor.querySelector(".notification-badge, .badge");
  if (badge) {
    badge.classList.add("workly-notification-badge");
  }

  const menu = document.createElement("div");
  menu.className = "dropdown-menu dropdown-menu-end shadow border-0 rounded-4 p-0 overflow-hidden";
  menu.style.width = "360px";
  menu.innerHTML = `
    <div class="p-3 border-bottom bg-light">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h6 class="mb-0 fw-bold">Notificaciones</h6>
          <small class="text-muted" data-role="resume">Cargando...</small>
        </div>
        <a class="btn btn-sm btn-outline-primary rounded-pill px-3" href="${getNotificationsPage()}">Ver todas</a>
      </div>
    </div>
    <div class="list-group list-group-flush" data-role="items">
      <div class="list-group-item border-0 py-4 text-center text-muted">Cargando notificaciones...</div>
    </div>
  `;

  anchor.parentNode.insertBefore(wrapper, anchor);
  wrapper.appendChild(anchor);
  wrapper.appendChild(menu);

  return { wrapper, badge, menu };
};

const renderMenu = (menu, data) => {
  const resume = menu.querySelector('[data-role="resume"]');
  const itemsContainer = menu.querySelector('[data-role="items"]');
  const noLeidas = Number(data?.no_leidas || 0);

  resume.textContent = noLeidas > 0
    ? `${noLeidas} sin leer`
    : "Todo al dia";

  if (!data?.ultimas?.length) {
    itemsContainer.innerHTML = `
      <div class="list-group-item border-0 py-4 text-center text-muted">
        No hay notificaciones recientes.
      </div>
    `;
    return;
  }

  itemsContainer.innerHTML = data.ultimas.map((item) => `
    <a href="${item.enlace || getNotificationsPage()}" class="list-group-item list-group-item-action border-0 py-3 px-3">
      <div class="d-flex gap-3 align-items-start">
        <div class="bg-light rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0" style="width: 42px; height: 42px;">
          <i class="bi ${NOTIFICATION_ICON[item.tipo_notificacion] || NOTIFICATION_ICON.sistema} text-primary"></i>
        </div>
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between gap-2">
            <strong class="small">${item.titulo}</strong>
            ${Number(item.leida) === 0 ? '<span class="badge text-bg-danger rounded-pill">Nuevo</span>' : ""}
          </div>
          <div class="small text-muted mt-1">${item.mensaje}</div>
          <div class="small text-secondary mt-2">${formatDate(item.fecha_creacion)}</div>
        </div>
      </div>
    </a>
  `).join("");
};

const updateBadge = (badge, count) => {
  if (!badge) {
    return;
  }

  badge.textContent = count > 99 ? "99+" : String(count);
  badge.style.display = count > 0 ? "inline-flex" : "none";
};

const fetchResumen = async () => {
  const token = getToken();

  if (!token) {
    return null;
  }

  const response = await fetch(`${API_URL}/notificaciones/resumen`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
};

const initNotificationsBell = async () => {
  const token = getToken();

  if (!token) {
    return;
  }

  const candidates = [
    ...document.querySelectorAll('a[href*="/notificaciones/"], a[href$="notificaciones/index.html"]')
  ];

  if (!candidates.length) {
    return;
  }

  for (const anchor of candidates) {
    if (anchor.closest(".workly-notifications-dropdown")) {
      continue;
    }

    const { badge, menu } = buildDropdown(anchor);
    const data = await fetchResumen();

    if (!data) {
      updateBadge(badge, 0);
      renderMenu(menu, { ultimas: [], no_leidas: 0 });
      continue;
    }

    updateBadge(badge, Number(data.no_leidas || 0));
    renderMenu(menu, data);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNotificationsBell);
} else {
  initNotificationsBell();
}

