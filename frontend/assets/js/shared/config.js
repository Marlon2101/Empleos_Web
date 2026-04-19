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

export const resolveViewPath = (relativeViewPath) => {
  const cleanPath = String(relativeViewPath || "").replace(/^\/+/, "");
  const currentPath = window.location.pathname || "";
  const prefix = currentPath.startsWith("/frontend/") ? "/frontend/views/" : "/views/";
  return `${prefix}${cleanPath}`;
};

export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("tipo");
  localStorage.removeItem("usuario");
};
