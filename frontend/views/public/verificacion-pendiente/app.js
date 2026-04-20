import { API_URL, buildPendingVerificationPath, resolveViewPath } from "../../../assets/js/shared/config.js";

const alertContainer = document.getElementById("alertContainer");
const correoDestino = document.getElementById("correoDestino");
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
    showAlert("El enlace anterior expiró. Puedes reenviar un nuevo correo de verificación.", "warning");
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
      throw new Error(data.mensaje || "No se pudo reenviar el correo.");
    }

    showAlert(data.mensaje, "success");
  } catch (error) {
    showAlert(error.message);
  }
};

const cambiarCorreo = async () => {
  const nuevo = nuevoCorreo.value.trim().toLowerCase();

  if (!nuevo) {
    showAlert("Escribe el nuevo correo electrónico.", "warning");
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
    setTimeout(() => {
      window.location.href = data.redirect || buildPendingVerificationPath({ email: data.email, tipo: data.tipo });
    }, 1200);
  } catch (error) {
    showAlert(error.message);
  }
};

btnReenviarCorreo?.addEventListener("click", reenviarCorreo);
btnCambiarCorreo?.addEventListener("click", cambiarCorreo);

if (!email || !tipo) {
  showAlert("Faltan datos para continuar con la verificación. Vuelve a iniciar sesión.", "warning");
  setTimeout(() => {
    window.location.href = resolveViewPath("public/login/index.html");
  }, 1800);
} else {
  actualizarVista();
}
