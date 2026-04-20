import { API_URL, buildPendingVerificationPath, normalizeAppRedirect, resolveViewPath } from "../../../assets/js/shared/config.js";

const alertContainer = document.getElementById("alertContainer");
const correoDestino = document.getElementById("correoDestino");
const codigoVerificacion = document.getElementById("codigoVerificacion");
const btnVerificarCodigo = document.getElementById("btnVerificarCodigo");
const btnReenviarCorreo = document.getElementById("btnReenviarCorreo");
const btnCambiarCorreo = document.getElementById("btnCambiarCorreo");
const nuevoCorreo = document.getElementById("nuevoCorreo");

const params = new URLSearchParams(window.location.search);
const email = params.get("email") || "";
const tipo = params.get("tipo") || "";
const status = params.get("status") || "";

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
};

const actualizarVista = () => {
  correoDestino.textContent = email || "Sin correo disponible";

  if (status === "expired") {
    showAlert("El codigo anterior expiro. Puedes reenviar uno nuevo para continuar.", "warning");
  }
};

const verificarCodigo = async () => {
  const codigo = String(codigoVerificacion?.value || "").replace(/\D/g, "").slice(0, 6);

  if (codigo.length !== 6) {
    showAlert("Escribe el codigo completo de 6 digitos.", "warning");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/verificar-codigo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correo_electronico: email,
        tipo_usuario: tipo,
        codigo
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "No se pudo verificar el codigo.");
    }

    showAlert(data.mensaje, "success");

    setTimeout(() => {
      window.location.href = normalizeAppRedirect(
        data.redirect,
        resolveViewPath("public/login/index.html?verified=1")
      );
    }, 1200);
  } catch (error) {
    showAlert(error.message);
  }
};

const reenviarCorreo = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/reenviar-verificacion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo_electronico: email })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "No se pudo reenviar el codigo.");
    }

    showAlert(data.mensaje, "success");
    if (codigoVerificacion) {
      codigoVerificacion.value = "";
    }
  } catch (error) {
    showAlert(error.message);
  }
};

const cambiarCorreo = async () => {
  const nuevo = nuevoCorreo.value.trim().toLowerCase();

  if (!nuevo) {
    showAlert("Escribe el nuevo correo electronico.", "warning");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/cambiar-email-pendiente`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correo_actual: email,
        nuevo_correo: nuevo,
        tipo_usuario: tipo
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "No se pudo cambiar el correo.");
    }

    showAlert(data.mensaje, "success");
    const fallbackPath = buildPendingVerificationPath({ email: data.email, tipo: data.tipo });
    setTimeout(() => {
      window.location.href = normalizeAppRedirect(data.redirect, fallbackPath);
    }, 1200);
  } catch (error) {
    showAlert(error.message);
  }
};

btnReenviarCorreo?.addEventListener("click", reenviarCorreo);
btnCambiarCorreo?.addEventListener("click", cambiarCorreo);
btnVerificarCodigo?.addEventListener("click", verificarCodigo);
codigoVerificacion?.addEventListener("input", () => {
  codigoVerificacion.value = String(codigoVerificacion.value || "").replace(/\D/g, "").slice(0, 6);
});

if (!email || !tipo) {
  showAlert("Faltan datos para continuar con la verificacion. Vuelve a iniciar sesion.", "warning");
  setTimeout(() => {
    window.location.href = resolveViewPath("public/login/index.html");
  }, 1800);
} else {
  actualizarVista();
}
