import { getToken, getTipo, clearSession, resolveViewPath } from "./config.js";

const LOGIN_PATH = resolveViewPath("public/login/index.html");

export const requireAuth = (tiposPermitidos = []) => {
  const token = getToken();
  const tipo = getTipo();

  if (!token || !tipo) {
    window.location.href = LOGIN_PATH;
    return false;
  }

  if (tiposPermitidos.length > 0 && !tiposPermitidos.includes(tipo)) {
    clearSession();
    window.location.href = LOGIN_PATH;
    return false;
  }

  return true;
};

export const logout = () => {
  clearSession();
  window.location.href = LOGIN_PATH;
};
