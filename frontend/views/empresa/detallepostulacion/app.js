import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth, logout } from "../../../assets/js/shared/auth.js";

requireAuth(["empresa"]);

const btnLogout = document.getElementById("btnLogout");
const alertContainer = document.getElementById("alertContainer");
const detallePostulante = document.getElementById("detallePostulante");
const detalleVacante = document.getElementById("detalleVacante");
const detalleEstado = document.getElementById("detalleEstado");

btnLogout.addEventListener("click", logout);

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
};

const getPostulacionId = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
};

const formatearFecha = (fecha) => {
  if (!fecha) return "N/D";
  return new Date(fecha).toLocaleDateString("es-SV");
};

const badgeEstado = (estado) => {
  const map = {
    "Recibida": "secondary",
    "En Revisión": "info",
    "Entrevista": "warning",
    "Rechazada": "danger",
    "Contratado": "success"
  };

  const color = map[estado] || "secondary";
  return `<span class="badge text-bg-${color}">${estado}</span>`;
};

const renderDetalle = (data) => {
  detallePostulante.innerHTML = `
    <div class="mb-3">
      <div class="info-label">Nombre completo</div>
      <div class="info-value">${data.nombres} ${data.apellidos}</div>
    </div>

    <div class="mb-3">
      <div class="info-label">Correo electrónico</div>
      <div class="info-value">${data.correo_electronico}</div>
    </div>

    <div class="mb-3">
      <div class="info-label">Teléfono</div>
      <div class="info-value">${data.telefono ?? "No definido"}</div>
    </div>

    <div class="mb-3">
      <div class="info-label">Municipio</div>
      <div class="info-value">${data.id_municipio_fk ?? "No definido"}</div>
    </div>

    <div>
      <div class="info-label">Resumen profesional</div>
      <div class="box-text">${data.resumen_profesional ?? "Sin resumen."}</div>
    </div>
  `;

  detalleVacante.innerHTML = `
    <div class="mb-3">
      <div class="info-label">Puesto</div>
      <div class="info-value">${data.titulo_puesto}</div>
    </div>

    <div class="mb-3">
      <div class="info-label">Modalidad</div>
      <div class="info-value">${data.modalidad}</div>
    </div>

    <div class="mb-3">
      <div class="info-label">Salario</div>
      <div class="info-value">$${Number(data.salario_offrecido ?? 0).toFixed(2)}</div>
    </div>

    <div class="mb-3">
      <div class="info-label">Empresa</div>
      <div class="info-value">${data.nombre_comercial}</div>
    </div>

    <div>
      <div class="info-label">Descripción del puesto</div>
      <div class="box-text">${data.descripcion_puesto ?? "Sin descripción."}</div>
    </div>
  `;

  detalleEstado.innerHTML = `
    <div class="mb-3">
      <div class="info-label">Estado actual</div>
      <div class="info-value">${badgeEstado(data.nombre_estado)}</div>
    </div>

    <div>
      <div class="info-label">Fecha de postulación</div>
      <div class="info-value">${formatearFecha(data.fecha_postulacion)}</div>
    </div>
  `;
};

const cargarDetalle = async () => {
  try {
    const id = getPostulacionId();

    if (!id) {
      showAlert("No se encontró el id de la postulación");
      return;
    }

    const response = await fetch(`${API_URL}/empresa/postulaciones/${id}`, {
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudo cargar el detalle");
      return;
    }

    renderDetalle(data);
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
};

cargarDetalle();