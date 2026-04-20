import { API_URL, getToken, getTipo, resolveViewPath } from "./config.js";

const getNotificationsPage = () => {
  const tipo = getTipo();

  if (tipo === "empresa") {
    return resolveViewPath("empresa/notificaciones/index.html");
  }

  if (tipo === "admin") {
    return resolveViewPath("admin/principal/index.html");
  }

  return resolveViewPath("usuario/notificaciones/index.html");
};

const updateBadge = (badge, count) => {
  if (!badge) return;

  badge.textContent = count > 99 ? "99+" : String(count);
  badge.style.display = count > 0 ? "inline-flex" : "none";
};

const fetchResumen = async () => {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/notificaciones/resumen`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error obteniendo notificaciones:", error);
    return null;
  }
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

  const data = await fetchResumen();
  const count = Number(data?.no_leidas || 0);
  const notificationsPage = getNotificationsPage();

  for (const anchor of candidates) {
    anchor.setAttribute("href", notificationsPage);
    anchor.removeAttribute("data-bs-toggle");
    anchor.removeAttribute("aria-expanded");

    const badge = anchor.querySelector(".notification-badge, .badge");
    updateBadge(badge, count);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNotificationsBell);
} else {
  initNotificationsBell();
}
