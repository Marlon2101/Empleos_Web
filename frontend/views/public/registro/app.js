import { API_URL } from "../../../assets/js/shared/config.js";

const formRegistro = document.getElementById("formRegistro");
const tipoRegistro = document.getElementById("tipoRegistro");
const camposUsuario = document.getElementById("camposUsuario");
const camposEmpresa = document.getElementById("camposEmpresa");
const alertContainer = document.getElementById("alertContainer");

const municipioUsuario = document.getElementById("municipioUsuario");
const municipioEmpresa = document.getElementById("municipioEmpresa");

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
};

const cargarMunicipios = async () => {
  try {
    const response = await fetch(`${API_URL}/catalogos/municipios`);
    const data = await response.json();

    municipioUsuario.innerHTML = `<option value="">Selecciona un municipio</option>`;
    municipioEmpresa.innerHTML = `<option value="">Selecciona un municipio</option>`;

    data.forEach(m => {
      municipioUsuario.innerHTML += `<option value="${m.id_municipio}">${m.nombre_municipio}</option>`;
      municipioEmpresa.innerHTML += `<option value="${m.id_municipio}">${m.nombre_municipio}</option>`;
    });
  } catch (error) {
    console.error(error);
    showAlert("No se pudieron cargar los municipios");
  }
};

tipoRegistro.addEventListener("change", () => {
  const tipo = tipoRegistro.value;

  camposUsuario.classList.add("d-none");
  camposEmpresa.classList.add("d-none");

  if (tipo === "usuario") {
    camposUsuario.classList.remove("d-none");
  }

  if (tipo === "empresa") {
    camposEmpresa.classList.remove("d-none");
  }
});

formRegistro.addEventListener("submit", async (e) => {
  e.preventDefault();
  alertContainer.innerHTML = "";

  const tipo = tipoRegistro.value;

  try {
    let endpoint = "";
    let body = {};

    if (tipo === "usuario") {
      endpoint = `${API_URL}/auth/register-user`;
      body = {
        nombres: document.getElementById("nombres").value.trim(),
        apellidos: document.getElementById("apellidos").value.trim(),
        correo_electronico: document.getElementById("correoUsuario").value.trim(),
        contrasena: document.getElementById("passwordUsuario").value.trim(),
        telefono: document.getElementById("telefonoUsuario").value.trim(),
        id_municipio_fk: Number(document.getElementById("municipioUsuario").value),
        resumen_profesional: document.getElementById("resumenProfesional").value.trim()
      };
    } else if (tipo === "empresa") {
      endpoint = `${API_URL}/auth/register-company`;
      body = {
        nombre_comercial: document.getElementById("nombreComercial").value.trim(),
        razon_social: document.getElementById("razonSocial").value.trim(),
        sitio_web: document.getElementById("sitioWeb").value.trim(),
        descripcion_empresa: document.getElementById("descripcionEmpresa").value.trim(),
        id_municipio_fk: Number(document.getElementById("municipioEmpresa").value),
        correo_electronico: document.getElementById("correoEmpresa").value.trim(),
        contrasena: document.getElementById("passwordEmpresa").value.trim()
      };
    } else {
      showAlert("Debes seleccionar un tipo de cuenta");
      return;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data.mensaje || "No se pudo completar el registro";
      showAlert(msg);
      return;
    }

    showAlert("Registro exitoso. Ahora puedes iniciar sesión.", "success");

    setTimeout(() => {
      window.location.href = "../login/index.html";
    }, 1200);
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
});

cargarMunicipios();