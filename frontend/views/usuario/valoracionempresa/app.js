import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth } from "../../../assets/js/shared/auth.js";

requireAuth(["usuario"]);

const selectorEmpresa = document.getElementById("selectorEmpresa");
const listaEmpresas = document.getElementById("listaEmpresas");
const resumenEmpresa = document.getElementById("resumenEmpresa");
const listaValoraciones = document.getElementById("listaValoraciones");
const formValoracion = document.getElementById("formValoracion");
const alertContainer = document.getElementById("alertContainer");
const inputPuntuacion = document.getElementById("puntuacion");
const inputComentario = document.getElementById("comentario");
const estadoPermiso = document.getElementById("estadoPermiso");
const btnEnviarValoracion = document.getElementById("btnEnviarValoracion");
const starRating = document.getElementById("starRating");

let empresas = [];
let empresaSeleccionada = null;
let miValoracion = null;

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`
});

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show rounded-4" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
};

const formatearFecha = (fecha) => {
  if (!fecha) {
    return "Reciente";
  }

  const date = new Date(fecha);
  return Number.isNaN(date.getTime())
    ? "Reciente"
    : date.toLocaleDateString("es-SV", { dateStyle: "medium" });
};

const buildStars = (value) => {
  const rating = Number(value || 0);
  return Array.from({ length: 5 }, (_, index) =>
    `<i class="bi ${index < rating ? "bi-star-fill text-warning" : "bi-star text-secondary"}"></i>`
  ).join("");
};

const renderStarSelector = () => {
  starRating.innerHTML = Array.from({ length: 5 }, (_, index) => `
    <button class="star-option ${index < Number(inputPuntuacion.value) ? "active" : ""}" type="button" data-value="${index + 1}" ${btnEnviarValoracion.disabled ? "disabled" : ""}>
      <i class="bi bi-star-fill"></i>
    </button>
  `).join("");

  starRating.querySelectorAll("[data-value]").forEach((button) => {
    button.addEventListener("click", () => {
      inputPuntuacion.value = button.dataset.value;
      renderStarSelector();
    });
  });
};

const hydrateForm = () => {
  if (miValoracion) {
    inputPuntuacion.value = String(miValoracion.puntuacion || 0);
    inputComentario.value = miValoracion.comentario || "";
  } else {
    inputPuntuacion.value = "0";
    inputComentario.value = "";
  }

  renderStarSelector();
};

const updateReviewAvailability = (empresa) => {
  const puedeValorar = Number(empresa?.puede_valorar || 0) === 1;
  const yaValoro = Number(empresa?.ya_valoro || 0) === 1;

  if (yaValoro) {
    estadoPermiso.className = "badge rounded-pill text-bg-info";
    estadoPermiso.textContent = "Ya valoraste esta empresa. Puedes editar tu comentario.";
    btnEnviarValoracion.disabled = false;
    btnEnviarValoracion.innerHTML = '<i class="bi bi-pencil-square me-2"></i>Actualizar valoración';
    inputComentario.disabled = false;
    hydrateForm();
    return;
  }

  if (puedeValorar) {
    estadoPermiso.className = "badge rounded-pill text-bg-success";
    estadoPermiso.textContent = "Puedes valorar esta empresa";
    btnEnviarValoracion.disabled = false;
    btnEnviarValoracion.innerHTML = '<i class="bi bi-send me-2"></i>Enviar valoración';
    inputComentario.disabled = false;
    hydrateForm();
    return;
  }

  estadoPermiso.className = "badge rounded-pill text-bg-warning";
  estadoPermiso.textContent = "Solo puedes valorar si postulaste o trabajaste aquí";
  btnEnviarValoracion.disabled = true;
  btnEnviarValoracion.innerHTML = '<i class="bi bi-lock me-2"></i>Valoración bloqueada';
  inputComentario.disabled = true;
  inputPuntuacion.value = miValoracion ? String(miValoracion.puntuacion || 0) : "0";
  inputComentario.value = miValoracion?.comentario || "";
  renderStarSelector();
};

const renderEmpresas = () => {
  selectorEmpresa.innerHTML = empresas.map((empresa) => `
    <option value="${empresa.id_empresa}">${empresa.nombre_comercial}</option>
  `).join("");

  if (empresaSeleccionada) {
    selectorEmpresa.value = String(empresaSeleccionada.id_empresa);
  }

  listaEmpresas.innerHTML = empresas.map((empresa) => `
    <article class="empresa-card p-3 ${Number(empresaSeleccionada?.id_empresa) === Number(empresa.id_empresa) ? "active" : ""}" data-id="${empresa.id_empresa}">
      <div class="d-flex justify-content-between gap-3">
        <div>
          <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
            <h3 class="h6 fw-bold mb-0">${empresa.nombre_comercial}</h3>
            ${Number(empresa.puede_valorar) === 1 ? '<span class="badge text-bg-success">Valorable</span>' : ""}
            ${Number(empresa.ya_valoro) === 1 ? '<span class="badge text-bg-info">Ya valorada</span>' : ""}
          </div>
          <p class="text-muted small mb-2">${[empresa.nombre_municipio, empresa.nombre_departamento].filter(Boolean).join(", ") || "El Salvador"}</p>
          <div class="small text-muted">${empresa.descripcion_empresa || "Empresa activa en Workly."}</div>
        </div>
        <div class="text-end">
          <div class="fw-bold">${empresa.promedio || "0.0"}</div>
          <small class="text-muted">${empresa.total_valoraciones || 0} reseñas</small>
        </div>
      </div>
    </article>
  `).join("");

  listaEmpresas.querySelectorAll("[data-id]").forEach((card) => {
    card.addEventListener("click", () => {
      seleccionarEmpresa(Number(card.dataset.id));
    });
  });
};

const renderResumen = (payload) => {
  const { empresa, resumen, mi_valoracion } = payload;
  empresaSeleccionada = empresa;
  miValoracion = mi_valoracion || null;

  resumenEmpresa.innerHTML = `
    <div class="d-flex flex-column flex-lg-row justify-content-between gap-4">
      <div>
        <h2 class="h4 fw-bold mb-1">${empresa.nombre_comercial}</h2>
        <p class="text-muted mb-2">${empresa.descripcion_empresa || "Empresa sin descripción registrada."}</p>
        <div class="text-muted small">${[empresa.nombre_municipio, empresa.nombre_departamento].filter(Boolean).join(", ") || "El Salvador"}</div>
      </div>
      <div class="text-lg-end">
        <div class="display-6 fw-bold mb-1">${resumen?.promedio || empresa.promedio || "0.0"}</div>
        <div class="mb-2">${buildStars(Math.round(Number(resumen?.promedio || empresa.promedio || 0)))}</div>
        <span class="badge text-bg-light rounded-pill">${resumen?.total_valoraciones || empresa.total_valoraciones || 0} valoraciones</span>
      </div>
    </div>
  `;

  updateReviewAvailability(empresa);
  renderEmpresas();
};

const renderValoraciones = (items) => {
  if (!items.length) {
    listaValoraciones.innerHTML = `
      <div class="text-center py-4 text-muted border rounded-4 bg-light">
        Esta empresa todavía no tiene comentarios publicados.
      </div>
    `;
    return;
  }

  listaValoraciones.innerHTML = items.map((item) => `
    <article class="border rounded-4 p-4">
      <div class="d-flex justify-content-between flex-wrap gap-2 mb-2">
        <div>
          <h3 class="h6 fw-bold mb-1">${item.nombre_usuario}</h3>
          <div>${buildStars(item.puntuacion)}</div>
        </div>
        <small class="text-muted">${formatearFecha(item.fecha_valoracion)}</small>
      </div>
      <p class="text-muted mb-0">${item.comentario || "Sin comentario adicional."}</p>
    </article>
  `).join("");
};

const getPreferredEmpresaId = () => {
  const urlId = Number(new URLSearchParams(window.location.search).get("id_empresa"));

  if (urlId) {
    return urlId;
  }

  const editable = empresas.find((empresa) => Number(empresa.puede_valorar) === 1 && Number(empresa.ya_valoro) === 0);
  if (editable) {
    return Number(editable.id_empresa);
  }

  const alreadyRated = empresas.find((empresa) => Number(empresa.ya_valoro) === 1);
  if (alreadyRated) {
    return Number(alreadyRated.id_empresa);
  }

  return Number(empresas[0]?.id_empresa);
};

const cargarEmpresas = async () => {
  const response = await fetch(`${API_URL}/valoraciones/empresas`, {
    headers: authHeaders()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudieron cargar las empresas");
  }

  empresas = data;

  const initialId = getPreferredEmpresaId();
  if (initialId) {
    await seleccionarEmpresa(initialId, false);
  }
};

const seleccionarEmpresa = async (idEmpresa, syncSelect = true) => {
  const response = await fetch(`${API_URL}/valoraciones/empresa/${idEmpresa}`, {
    headers: authHeaders()
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo cargar el detalle de la empresa");
  }

  renderResumen(data);
  renderValoraciones(data.valoraciones || []);

  if (syncSelect) {
    selectorEmpresa.value = String(idEmpresa);
  }

  const url = new URL(window.location.href);
  url.searchParams.set("id_empresa", idEmpresa);
  window.history.replaceState({}, "", url);
};

formValoracion.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    if (!empresaSeleccionada) {
      throw new Error("Selecciona una empresa para valorar.");
    }

    if (btnEnviarValoracion.disabled) {
      throw new Error("No tienes permiso para valorar esta empresa.");
    }

    if (Number(inputPuntuacion.value) < 1) {
      throw new Error("Selecciona una puntuación de 1 a 5 estrellas.");
    }

    if (!inputComentario.value.trim()) {
      throw new Error("Escribe un comentario antes de enviar.");
    }

    const isEditing = Boolean(miValoracion?.id_valoracion);
    const endpoint = isEditing
      ? `${API_URL}/valoraciones/empresa/${empresaSeleccionada.id_empresa}`
      : `${API_URL}/valoraciones`;

    const response = await fetch(endpoint, {
      method: isEditing ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
      body: JSON.stringify({
        id_empresa_fk: Number(empresaSeleccionada.id_empresa),
        puntuacion: Number(inputPuntuacion.value),
        comentario: inputComentario.value.trim()
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "No se pudo guardar la valoración");
    }

    showAlert(data.mensaje, "success");
    await cargarEmpresas();
    await seleccionarEmpresa(Number(empresaSeleccionada.id_empresa));
  } catch (error) {
    console.error(error);
    showAlert(error.message || "No se pudo enviar la valoración");
  }
});

selectorEmpresa.addEventListener("change", async () => {
  try {
    await seleccionarEmpresa(Number(selectorEmpresa.value));
  } catch (error) {
    showAlert(error.message);
  }
});

renderStarSelector();

cargarEmpresas().catch((error) => {
  console.error(error);
  showAlert(error.message || "No se pudo inicializar la vista de valoraciones");
});

