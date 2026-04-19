import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth, logout } from "../../../assets/js/shared/auth.js";

requireAuth(["empresa"]);

const btnLogout = document.getElementById("btnLogout");
const alertContainer = document.getElementById("alertContainer");
const detallePostulante = document.getElementById("detallePostulante");
const detalleVacante = document.getElementById("detalleVacante");
const detalleEstado = document.getElementById("detalleEstado");
const timelineProceso = document.getElementById("timelineProceso");
const btnCopiarCorreo = document.getElementById("btnCopiarCorreo");
const btnContactar = document.getElementById("btnContactar");
const toastTexto = document.getElementById("toastTexto");
const toastAccion = new bootstrap.Toast(document.getElementById("toastAccion"));

let currentPostulacion = null;

btnLogout.addEventListener("click", logout);

const authHeaders = {
  Authorization: `Bearer ${getToken()}`
};

const statusMap = {
  1: { label: "Recibida", className: "text-bg-secondary", icon: "bi-inbox-fill" },
  2: { label: "En revision", className: "text-bg-info", icon: "bi-search" },
  3: { label: "Entrevista", className: "text-bg-warning", icon: "bi-camera-video-fill" },
  4: { label: "Rechazada", className: "text-bg-danger", icon: "bi-x-circle-fill" },
  5: { label: "Contratado", className: "text-bg-success", icon: "bi-check-circle-fill" }
};

const processSteps = [
  { id: 1, label: "Recibida", detail: "La empresa ya recibio la postulacion." },
  { id: 2, label: "En revision", detail: "El perfil esta siendo evaluado." },
  { id: 3, label: "Entrevista", detail: "El candidato paso a una conversacion formal." },
  { id: 5, label: "Contratado", detail: "El proceso termino de forma exitosa." }
];

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show rounded-4 shadow-sm" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>
  `;
};

const showToast = (message) => {
  toastTexto.textContent = message;
  toastAccion.show();
};

const getPostulacionId = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
};

const formatDate = (value) => {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Sin fecha"
    : date.toLocaleDateString("es-SV", { dateStyle: "long" });
};

const formatCurrency = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return "No definido";
  }

  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  });
};

const getStatusBadge = (id, fallbackName = "Recibida") => {
  const config = statusMap[id] || {
    label: fallbackName,
    className: "text-bg-secondary",
    icon: "bi-dot"
  };

  return `<span class="badge ${config.className} rounded-pill px-3 py-2"><i class="bi ${config.icon} me-2"></i>${config.label}</span>`;
};

const buildInfoItem = (label, value) => `
  <div class="info-item">
    <div class="info-label">${label}</div>
    <div class="info-value">${value}</div>
  </div>
`;

const renderTimeline = (estadoId) => {
  const isRejected = Number(estadoId) === 4;
  const steps = isRejected
    ? [
        { label: "Recibida", detail: "La empresa recibio la postulacion.", icon: "bi-inbox-fill" },
        { label: "Revision", detail: "El perfil fue revisado por el equipo.", icon: "bi-search" },
        { label: "Cierre", detail: "Se definio un rechazo para esta vacante.", icon: "bi-x-circle-fill" }
      ]
    : processSteps.map((step) => ({
        ...step,
        icon: statusMap[step.id]?.icon || "bi-dot"
      }));

  timelineProceso.innerHTML = steps.map((step) => `
    <li class="timeline-item">
      <div class="timeline-dot"><i class="bi ${step.icon}"></i></div>
      <div>
        <div class="fw-semibold">${step.label}</div>
        <div class="text-muted small">${step.detail}</div>
      </div>
    </li>
  `).join("");
};

const updateHero = (data) => {
  document.getElementById("heroNombre").textContent = `${data.nombres} ${data.apellidos}`;
  document.getElementById("heroResumen").textContent = data.resumen_profesional || "El postulante aun no tiene un resumen profesional registrado.";
  document.getElementById("heroVacante").textContent = data.titulo_puesto || "Vacante";
  document.getElementById("heroFecha").textContent = `Postulo el ${formatDate(data.fecha_postulacion)}`;
  document.getElementById("heroEstado").innerHTML = getStatusBadge(data.id_estado_fk, data.nombre_estado);

  document.getElementById("metricContacto").textContent = data.correo_electronico || "Sin correo";
  document.getElementById("metricModalidad").textContent = data.modalidad || "No definida";
  document.getElementById("metricSalario").textContent = formatCurrency(data.salario_offrecido);
  document.getElementById("metricEmpresa").textContent = data.nombre_comercial || "Sin empresa";
};

const renderPostulante = (data) => {
  detallePostulante.innerHTML = `
    <div class="row g-3">
      <div class="col-12 col-md-6">${buildInfoItem("Nombre completo", `${data.nombres} ${data.apellidos}`)}</div>
      <div class="col-12 col-md-6">${buildInfoItem("Correo electronico", data.correo_electronico || "No definido")}</div>
      <div class="col-12 col-md-6">${buildInfoItem("Telefono", data.telefono || "No definido")}</div>
      <div class="col-12 col-md-6">${buildInfoItem("Municipio", data.id_municipio_fk || "No definido")}</div>
      <div class="col-12">
        <div class="info-label mb-2">Resumen profesional</div>
        <div class="text-box">${data.resumen_profesional || "Sin resumen profesional por ahora."}</div>
      </div>
    </div>
  `;
};

const renderVacante = (data) => {
  detalleVacante.innerHTML = `
    <div class="row g-3">
      <div class="col-12 col-md-6">${buildInfoItem("Puesto", data.titulo_puesto || "No definido")}</div>
      <div class="col-12 col-md-6">${buildInfoItem("Modalidad", data.modalidad || "No definida")}</div>
      <div class="col-12 col-md-6">${buildInfoItem("Salario", formatCurrency(data.salario_offrecido))}</div>
      <div class="col-12 col-md-6">${buildInfoItem("Empresa", data.nombre_comercial || "No definida")}</div>
      <div class="col-12">
        <div class="info-label mb-2">Descripcion del puesto</div>
        <div class="text-box">${data.descripcion_puesto || "La vacante no tiene descripcion disponible."}</div>
      </div>
    </div>
  `;
};

const renderEstado = (data) => {
  detalleEstado.innerHTML = `
    <div class="info-item mb-3">
      <div class="info-label">Estado actual</div>
      <div class="info-value">${getStatusBadge(data.id_estado_fk, data.nombre_estado)}</div>
    </div>
    <div class="info-item mb-3">
      <div class="info-label">Fecha de postulacion</div>
      <div class="info-value">${formatDate(data.fecha_postulacion)}</div>
    </div>
    <div class="info-label mb-2">Actualizar proceso</div>
    <select id="selectEstado" class="form-select form-select-lg rounded-4 mb-3">
      <option value="1" ${Number(data.id_estado_fk) === 1 ? "selected" : ""}>Recibida</option>
      <option value="2" ${Number(data.id_estado_fk) === 2 ? "selected" : ""}>En revision</option>
      <option value="3" ${Number(data.id_estado_fk) === 3 ? "selected" : ""}>Entrevista</option>
      <option value="4" ${Number(data.id_estado_fk) === 4 ? "selected" : ""}>Rechazada</option>
      <option value="5" ${Number(data.id_estado_fk) === 5 ? "selected" : ""}>Contratado</option>
    </select>
    <button class="btn btn-primary w-100 rounded-4" id="btnGuardarEstado">
      <i class="bi bi-check2-square me-2"></i>Guardar nuevo estado
    </button>
  `;

  document.getElementById("btnGuardarEstado").addEventListener("click", async () => {
    await actualizarEstado();
  });
};

const renderDetalle = (data) => {
  currentPostulacion = data;
  updateHero(data);
  renderPostulante(data);
  renderVacante(data);
  renderEstado(data);
  renderTimeline(data.id_estado_fk);
};

const cargarDetalle = async () => {
  try {
    const id = getPostulacionId();

    if (!id) {
      showAlert("No se encontro el id de la postulacion.");
      return;
    }

    const response = await fetch(`${API_URL}/empresa/postulaciones/${id}`, {
      headers: authHeaders
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudo cargar el detalle.");
      return;
    }

    renderDetalle(data);
  } catch (error) {
    console.error(error);
    showAlert("Error de conexion con el servidor.");
  }
};

const actualizarEstado = async () => {
  try {
    if (!currentPostulacion) {
      return;
    }

    const selectEstado = document.getElementById("selectEstado");
    const nuevoEstado = Number(selectEstado.value);

    const response = await fetch(`${API_URL}/postulaciones/${currentPostulacion.id_postulacion}/estado`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders
      },
      body: JSON.stringify({ id_estado_fk: nuevoEstado })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "No se pudo actualizar el estado.");
    }

    currentPostulacion.id_estado_fk = nuevoEstado;
    currentPostulacion.nombre_estado = statusMap[nuevoEstado]?.label || currentPostulacion.nombre_estado;

    renderDetalle(currentPostulacion);
    showAlert("Estado actualizado correctamente.", "success");
    showToast("Estado del proceso actualizado.");
  } catch (error) {
    console.error(error);
    showAlert(error.message || "No se pudo actualizar el estado.");
  }
};

btnCopiarCorreo.addEventListener("click", async () => {
  try {
    if (!currentPostulacion?.correo_electronico) {
      showAlert("No hay correo disponible para copiar.");
      return;
    }

    await navigator.clipboard.writeText(currentPostulacion.correo_electronico);
    showToast("Correo copiado al portapapeles.");
  } catch (error) {
    console.error(error);
    showAlert("No se pudo copiar el correo.");
  }
});

btnContactar.addEventListener("click", () => {
  if (!currentPostulacion?.correo_electronico) {
    showAlert("No hay correo disponible para este postulante.");
    return;
  }

  const subject = encodeURIComponent(`Seguimiento de postulacion - ${currentPostulacion.titulo_puesto}`);
  const body = encodeURIComponent(`Hola ${currentPostulacion.nombres},%0D%0A%0D%0ATe contactamos para dar seguimiento a tu postulacion.%0D%0A%0D%0ASaludos.`);
  window.location.href = `mailto:${currentPostulacion.correo_electronico}?subject=${subject}&body=${body}`;
});

cargarDetalle();
