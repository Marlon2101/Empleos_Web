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

export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("tipo");
  localStorage.removeItem("usuario");
};