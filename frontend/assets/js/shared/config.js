export const API_URL = "http://localhost:3000";

export const saveSession = (token, tipo, usuario) => {
  localStorage.setItem("token", token);
  localStorage.setItem("tipo", tipo);
  localStorage.setItem("usuario", JSON.stringify(usuario));
};

export const getToken = () => localStorage.getItem("token");
export const getTipo = () => localStorage.getItem("tipo");

export const getUsuario = () => {
  const data = localStorage.getItem("usuario");
  return data ? JSON.parse(data) : null;
};

const getViewsBasePrefix = () => {
  const currentPath = window.location.pathname || "";
  const markers = ["/frontend/views/", "/views/"];

  for (const marker of markers) {
    const index = currentPath.indexOf(marker);
    if (index >= 0) {
      return currentPath.slice(0, index + marker.length);
    }
  }

  return "/frontend/views/";
};

export const resolveViewPath = (relativeViewPath) => {
  const cleanPath = String(relativeViewPath || "").replace(/^\/+/, "");
  return `${getViewsBasePrefix()}${cleanPath}`;
};

export const normalizeAppRedirect = (redirectPath, fallbackPath = "") => {
  const value = String(redirectPath || "").trim();

  if (!value) {
    return fallbackPath;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const [pathPart, queryPart = ""] = value.split("?");
  const normalizedPath = pathPart
    .replace(/^\/+frontend\/views\//i, "")
    .replace(/^\/+views\//i, "")
    .replace(/^\/+/, "");

  const resolved = resolveViewPath(normalizedPath);
  return queryPart ? `${resolved}?${queryPart}` : resolved;
};

export const buildPendingVerificationPath = ({ email = "", tipo = "" } = {}) => {
  const params = new URLSearchParams();

  if (email) params.set("email", email);
  if (tipo) params.set("tipo", tipo);

  const basePath = resolveViewPath("public/verificacion-pendiente/index.html");
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
};

export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("tipo");
  localStorage.removeItem("usuario");
};
