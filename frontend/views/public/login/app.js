import { API_URL, saveSession } from "../../../assets/js/shared/config.js";

const formLogin = document.getElementById("formLogin");
const alertContainer = document.getElementById("alertContainer");

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
};

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();

  alertContainer.innerHTML = "";

  const correo_electronico = document.getElementById("correo_electronico").value.trim();
  const contrasena = document.getElementById("contrasena").value.trim();
  const tipo = document.getElementById("tipo").value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        correo_electronico,
        contrasena,
        tipo
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudo iniciar sesión");
      return;
    }

    saveSession(data.token, data.tipo, data.data);
    showAlert("Inicio de sesión exitoso", "success");

    setTimeout(() => {
      if (data.tipo === "usuario") {
        window.location.href = "../../usuario/principal/index.html";
      } else if (data.tipo === "empresa") {
        window.location.href = "../../empresa/principal/index.html";
      }
    }, 700);
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
});