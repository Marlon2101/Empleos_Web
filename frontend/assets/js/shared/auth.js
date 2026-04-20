import { getToken, getTipo, getUsuario, clearSession, resolveViewPath, buildPendingVerificationPath } from "./config.js";

const LOGIN_PATH = resolveViewPath("public/login/index.html");

export const requireAuth = (tiposPermitidos = []) => {
  const token = getToken();
  const tipo = getTipo();
  const usuario = getUsuario();

  if (!token || !tipo) {
    window.location.href = LOGIN_PATH;
    return false;
  }

  if (tipo !== "admin" && usuario?.email_verificado === false) {
    window.location.href = buildPendingVerificationPath({
      email: usuario?.correo_electronico,
      tipo
    });
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
