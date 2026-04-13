import { API_URL, getToken, getUsuario } from "../../../assets/js/shared/config.js";
import { requireAuth, logout } from "../../../assets/js/shared/auth.js";

requireAuth(["usuario"]);

const btnLogout = document.getElementById("btnLogout");
const alertContainer = document.getElementById("alertContainer");
const detalleVacante = document.getElementById("detalleVacante");
const detalleEmpresa = document.getElementById("detalleEmpresa");
const estadoPostulacion = document.getElementById("estadoPostulacion");

btnLogout.addEventListener("click", logout);

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
};

const getVacanteId = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
};

const renderVacante = (vacante) => {
  detalleVacante.innerHTML = `
    <span class="badge bg-primary-subtle text-primary mb-2">${vacante.nombre_categoria}</span>
    <h2 class="mb-2">${vacante.titulo_puesto}</h2>
    <p class="text-muted mb-4">${vacante.nombre_comercial}</p>

    <div class="row g-3 mb-4">
      <div class="col-md-6">
        <div class="detalle-label">Modalidad</div>
        <div class="detalle-value">${vacante.modalidad}</div>
      </div>
      <div class="col-md-6">
        <div class="detalle-label">Salario</div>
        <div class="detalle-value">$${Number(vacante.salario_offrecido ?? 0).toFixed(2)}</div>
      </div>
      <div class="col-md-6">
        <div class="detalle-label">Municipio</div>
        <div class="detalle-value">${vacante.nombre_municipio ?? "No definido"}</div>
      </div>
      <div class="col-md-6">
        <div class="detalle-label">Departamento</div>
        <div class="detalle-value">${vacante.nombre_departamento ?? "No definido"}</div>
      </div>
    </div>

    <h5 class="mb-3">Descripción del puesto</h5>
    <div class="descripcion-box">${vacante.descripcion_puesto ?? ""}</div>
  `;
};

const renderEmpresa = (vacante) => {
  detalleEmpresa.innerHTML = `
    <p class="mb-2"><strong>${vacante.nombre_comercial}</strong></p>
    <p class="text-muted small mb-2">${vacante.razon_social ?? ""}</p>
    <p class="mb-2"><strong>Sitio web:</strong> ${vacante.sitio_web || "No definido"}</p>
    <p class="mb-0">${vacante.descripcion_empresa ?? "Sin descripción."}</p>
  `;
};

const renderEstado = (responseData, idVacante) => {
  if (responseData.yaPostulado) {
    estadoPostulacion.innerHTML = `
      <div class="alert alert-success mb-2">
        Ya te postulaste a esta vacante.
      </div>
      <div class="small text-muted">
        Estado actual: ${responseData.postulacion?.id_estado_fk ?? "N/D"}
      </div>
    `;
    return;
  }

  estadoPostulacion.innerHTML = `
    <p class="text-muted">Todavía no te has postulado a esta vacante.</p>
    <div class="d-grid">
      <button class="btn btn-primary" id="btnPostularme">Postularme</button>
    </div>
  `;

  const btnPostularme = document.getElementById("btnPostularme");
  btnPostularme.addEventListener("click", () => postularme(idVacante));
};

const cargarDetalle = async () => {
  try {
    const idVacante = getVacanteId();

    if (!idVacante) {
      showAlert("No se encontró el id de la vacante");
      return;
    }

    const response = await fetch(`${API_URL}/vacantes/detalle/${idVacante}`, {
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudo cargar el detalle");
      return;
    }

    renderVacante(data.vacante);
    renderEmpresa(data.vacante);
    renderEstado(data, idVacante);
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
};

const postularme = async (idVacante) => {
  try {
    const usuario = getUsuario();

    if (!usuario?.id_usuario) {
      showAlert("No se pudo identificar el usuario logueado");
      return;
    }

    const response = await fetch(`${API_URL}/postulaciones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        id_usuario_fk: usuario.id_usuario,
        id_vacante_fk: Number(idVacante),
        id_estado_fk: 1
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudo realizar la postulación");
      return;
    }

    showAlert("Te postulaste correctamente", "success");
    await cargarDetalle();
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
};

cargarDetalle();

import { API_URL, getToken, getUsuario } from "../../../assets/js/shared/config.js";

const btnPostular = document.getElementById("btnPostularme");

btnPostular.addEventListener("click", async () => {
    const params = new URLSearchParams(window.location.search);
    const idVacante = params.get("id");
    const usuario = getUsuario();

    const dataPostulacion = {
        id_usuario_fk: usuario.id_usuario,
        id_vacante_fk: idVacante,
        id_estado_fk: 1 // Estado 'Recibida' según tu SQL
    };

    const res = await fetch(`${API_URL}/api/postulaciones`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}` // Autorización con tu token
        },
        body: JSON.stringify(dataPostulacion)
    });

    if (res.ok) alert("¡Postulación enviada con éxito!");
});