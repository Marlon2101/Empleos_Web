import { API_URL, getToken, getTipo } from "./config.js";

const getNotificationsPage = () => {
  const tipo = getTipo();
  
  // AQUÍ ESTÁ LA MAGIA: Definimos tu ruta base real para que el JS no se pierda
  const basePath = "/Empleos_Web/frontend/views";

  if (tipo === "empresa") {
    return `${basePath}/empresa/notificaciones/index.html`;
  }

  if (tipo === "admin") {
    return `${basePath}/admin/principal/index.html`;
  }

  // Ruta para el usuario normal
  return `${basePath}/usuario/notificaciones/index.html`;
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

  // Buscamos todas las campanitas en la pantalla
  const candidates = [
    ...document.querySelectorAll('a[href*="/notificaciones/"], a[href$="notificaciones/index.html"]')
  ];

  if (!candidates.length) {
    return;
  }

  const data = await fetchResumen();
  const count = Number(data?.no_leidas || 0);
  
  // Obtenemos la ruta correcta y absoluta
  const notificationsPage = getNotificationsPage();

  for (const anchor of candidates) {
    // Ahora el JS sobrescribe el HTML, pero con la ruta PERFECTA
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