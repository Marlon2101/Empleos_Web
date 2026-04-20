import { API_URL, saveSession, buildPendingVerificationPath, normalizeAppRedirect } from "../../../assets/js/shared/config.js";

const formLogin = document.getElementById("formLogin");
const alertContainer = document.getElementById("alertContainer");
const btnReenviarVerificacion = document.getElementById("btnReenviarVerificacion");
const enlaceRegistro = document.getElementById("linkRegistro");

const showAlert = (message, type = "danger") => {
  if (!alertContainer) return;

  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
};

const obtenerCorreoInput = () => document.getElementById("correo")?.value.trim().toLowerCase();

const manejarMensajesUrl = () => {
  const params = new URLSearchParams(window.location.search);

  if (params.get("verified") === "1") {
    showAlert("¡Email verificado correctamente! Ya puedes iniciar sesión.", "success");
  } else if (params.get("verification") === "invalid") {
    showAlert("El enlace de verificación no es válido o ya no está disponible.", "warning");
  } else if (params.get("verification") === "error") {
    showAlert("Ocurrió un problema al verificar el correo. Inténtalo de nuevo.", "warning");
  }
};

const reenviarVerificacion = async (correoManual = "") => {
  const correo = (correoManual || obtenerCorreoInput() || "").trim().toLowerCase();

  if (!correo) {
    showAlert("Escribe tu correo para reenviar la verificación.", "warning");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/auth/reenviar-verificacion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo_electronico: correo })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "No se pudo reenviar la verificación.");
    }

    showAlert(data.mensaje, "success");

    const fallbackPath = buildPendingVerificationPath({ email: correo });
    setTimeout(() => {
      window.location.href = normalizeAppRedirect(data.redirect, fallbackPath);
    }, 1200);
  } catch (error) {
    showAlert(error.message);
  }
};

formLogin?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const correoInput = document.getElementById("correo");
  const passwordInput = document.getElementById("password");

  if (!correoInput || !passwordInput) return;

  const correo_electronico = correoInput.value.trim().toLowerCase();
  const contrasena = passwordInput.value.trim();

  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correo_electronico,
        contrasena
      })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 403 && data.code === "EMAIL_NO_VERIFICADO") {
        showAlert(`${data.mensaje}. Redirigiéndote a la pantalla de verificación...`, "warning");

        const fallbackPath = buildPendingVerificationPath({
          email: data.correo_electronico || correo_electronico,
          tipo: data.tipo
        });

        setTimeout(() => {
          window.location.href = normalizeAppRedirect(data.redirect, fallbackPath);
        }, 1200);
        return;
      }

      throw new Error(data.mensaje || "Error de acceso");
    }

    saveSession(data.token, data.tipo, data.data);

    const destinos = {
      usuario: "../../usuario/principal/index.html",
      empresa: "../../empresa/principal/index.html",
      admin: "../../admin/principal/index.html"
    };

    window.location.href = destinos[data.tipo] || "../../public/paginainicial/index.html";
  } catch (error) {
    showAlert(error.message);
  }
});

btnReenviarVerificacion?.addEventListener("click", async (event) => {
  event.preventDefault();
  await reenviarVerificacion();
});

enlaceRegistro?.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("tipo");
  localStorage.removeItem("usuario");
});

manejarMensajesUrl();
