import { getToken, getTipo, getUsuario, clearSession } from "./config.js";

export const requireAuth = (tiposPermitidos = []) => {
  const token = getToken();
  const tipo = getTipo();

  if (!token || !tipo) {
    window.location.href = "../../../views/public/login/index.html";
    return;
  }

  if (tiposPermitidos.length > 0 && !tiposPermitidos.includes(tipo)) {
    clearSession();
    window.location.href = "../../../views/public/login/index.html";
  }
};

export const logout = () => {
  clearSession();
  window.location.href = "../../../views/public/login/index.html";
};

export const getDisplayName = () => {
  const tipo = getTipo();
  const user = getUsuario();

  if (!user) return "Sesión";

  if (tipo === "usuario") {
    return `${user.nombres ?? ""} ${user.apellidos ?? ""}`.trim();
  }

  if (tipo === "empresa") {
    return user.nombre_comercial ?? "Empresa";
  }

  if (tipo === "admin") {
    return user.usuario ?? "Admin";
  }

  return "Sesión";
};