import { API_URL, buildPendingVerificationPath, normalizeAppRedirect } from "../../../assets/js/shared/config.js";

const tabUsuario = document.getElementById("tabUsuario");
const tabEmpresa = document.getElementById("tabEmpresa");
const camposUsuario = document.getElementById("camposUsuario");
const camposEmpresa = document.getElementById("camposEmpresa");
const formRegistro = document.getElementById("formRegistro");
const alertContainer = document.getElementById("alertContainer");

let tipoRegistro = "usuario";

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
};

const activarTab = (tipo) => {
  tipoRegistro = tipo;
  camposUsuario.classList.toggle("d-none", tipo !== "usuario");
  camposEmpresa.classList.toggle("d-none", tipo !== "empresa");
  tabUsuario.classList.toggle("active", tipo === "usuario");
  tabEmpresa.classList.toggle("active", tipo === "empresa");
};

tabUsuario?.addEventListener("click", () => activarTab("usuario"));
tabEmpresa?.addEventListener("click", () => activarTab("empresa"));

const cargarMunicipios = async () => {
  try {
    const response = await fetch(`${API_URL}/catalogos/municipios-agrupados`);
    const data = await response.json();

    let optionsHtml = `<option value="">Selecciona un municipio</option>`;
    let departamentoActual = "";

    data.forEach((item) => {
      if (item.nombre_departamento !== departamentoActual) {
        if (departamentoActual) {
          optionsHtml += "</optgroup>";
        }
        optionsHtml += `<optgroup label="${item.nombre_departamento}">`;
        departamentoActual = item.nombre_departamento;
      }

      optionsHtml += `<option value="${item.id_municipio}">${item.nombre_municipio}</option>`;
    });

    if (departamentoActual) {
      optionsHtml += "</optgroup>";
    }

    document.getElementById("municipioUsuario").innerHTML = optionsHtml;
    document.getElementById("municipioEmpresa").innerHTML = optionsHtml;
  } catch (error) {
    console.error(error);
    showAlert("No se pudo conectar con el servidor para cargar municipios.");
  }
};

const obtenerPayload = () => {
  if (tipoRegistro === "usuario") {
    const pass = document.getElementById("passUsuario").value;
    const conf = document.getElementById("passConfUsuario").value;

    if (pass !== conf) {
      throw new Error("Las contraseñas de usuario no coinciden.");
    }

    return {
      url: `${API_URL}/api/auth/register-user`,
      tipo: "usuario",
      email: document.getElementById("emailUsuario").value.trim().toLowerCase(),
      body: {
        nombres: document.getElementById("nombreUsuario").value.trim(),
        apellidos: document.getElementById("apellidosUsuario").value.trim(),
        correo_electronico: document.getElementById("emailUsuario").value.trim().toLowerCase(),
        telefono: document.getElementById("telefonoUsuario").value.trim(),
        contrasena: pass,
        id_municipio_fk: Number(document.getElementById("municipioUsuario").value),
        resumen_profesional: document.getElementById("resumenProfesional").value.trim()
      }
    };
  }

  const pass = document.getElementById("passEmpresa").value;
  const conf = document.getElementById("passConfEmpresa").value;

  if (pass !== conf) {
    throw new Error("Las contraseñas de empresa no coinciden.");
  }

  return {
    url: `${API_URL}/api/auth/register-company`,
    tipo: "empresa",
    email: document.getElementById("emailEmpresa").value.trim().toLowerCase(),
    body: {
      nombre_comercial: document.getElementById("nombreComercial").value.trim(),
      razon_social: document.getElementById("razonSocial").value.trim(),
      correo_electronico: document.getElementById("emailEmpresa").value.trim().toLowerCase(),
      telefono: document.getElementById("telefonoEmpresa").value.trim(),
      contrasena: pass,
      id_municipio_fk: Number(document.getElementById("municipioEmpresa").value),
      descripcion_empresa: document.getElementById("descEmpresa").value.trim()
    }
  };
};

formRegistro?.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const payload = obtenerPayload();

    const response = await fetch(payload.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload.body)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "No se pudo completar el registro.");
    }

    const mensaje = data.advertencia
      ? `${data.mensaje}<br><small>${data.advertencia}</small>`
      : data.mensaje;

    showAlert(mensaje, data.advertencia ? "warning" : "success");

    const fallbackPath = buildPendingVerificationPath({
      email: data.email || payload.email,
      tipo: data.tipo || payload.tipo
    });
    const redirectPath = normalizeAppRedirect(data.redirect, fallbackPath);

    setTimeout(() => {
      window.location.href = redirectPath;
    }, 1800);
  } catch (error) {
    showAlert(error.message);
  }
});

cargarMunicipios();
