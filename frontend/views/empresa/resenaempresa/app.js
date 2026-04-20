import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth } from "../../../assets/js/shared/auth.js";

requireAuth(["empresa"]);

const listaResenas = document.getElementById("listaResenas");
const listaResenasExternas = document.getElementById("listaResenasExternas");
const listaValoracionesEmpresa = document.getElementById("listaValoracionesEmpresa");
const selectPostulacion = document.getElementById("id_postulacion_fk");
const comentarioInput = document.getElementById("comentarioResena");
const etiquetasInput = document.getElementById("etiquetasResena");
const btnGuardar = document.getElementById("btnGuardarResena");
const alertContainer = document.getElementById("alertContainer");

const resumenPromedio = document.getElementById("resumenPromedio");
const resumenTotal = document.getElementById("resumenTotal");
const resumenCobertura = document.getElementById("resumenCobertura");
const resumenResenables = document.getElementById("resumenResenables");
const badgeMisResenas = document.getElementById("badgeMisResenas");
const badgeReferenciasExternas = document.getElementById("badgeReferenciasExternas");
const metricEmpresaPromedio = document.getElementById("metricEmpresaPromedio");
const metricEmpresaTotal = document.getElementById("metricEmpresaTotal");
const metricMisResenas = document.getElementById("metricMisResenas");
const metricExternas = document.getElementById("metricExternas");
const empresaPromedioDetalle = document.getElementById("empresaPromedioDetalle");
const empresaTotalDetalle = document.getElementById("empresaTotalDetalle");

let puntuacionActual = 0;
let postulaciones = [];
let resenas = [];
let resenasExternas = [];
let valoracionesEmpresa = [];
let resumenEmpresa = { promedio: 0, total_valoraciones: 0 };

const authHeaders = (withJson = false) => ({
  ...(withJson ? { "Content-Type": "application/json" } : {}),
  Authorization: `Bearer ${getToken()}`
});

const showAlert = (message, type = "danger") => {
  if (!alertContainer) return;

  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show rounded-4 shadow-sm" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>
  `;
};

const formatearFecha = (fecha) => {
  if (!fecha) return "Reciente";
  const date = new Date(fecha);
  return Number.isNaN(date.getTime())
    ? "Reciente"
    : date.toLocaleDateString("es-SV", { dateStyle: "medium" });
};

const renderStars = (value) => {
  const full = Math.round(Number(value || 0));
  return Array.from({ length: 5 }, (_, index) =>
    `<i class="bi ${index < full ? "bi-star-fill" : "bi-star"}"></i>`
  ).join("");
};

const getInitials = (nombre = "", apellido = "") =>
  `${nombre.trim()[0] || ""}${apellido.trim()[0] || ""}`.toUpperCase();

const renderTags = (tags = []) => {
  if (!tags.length) {
    return '<span class="text-muted small">Sin etiquetas registradas</span>';
  }

  return tags.map((tag) => `<span class="tag-chip">${tag}</span>`).join("");
};

const renderEmptyState = (message, icon = "bi-inbox") => `
  <div class="empty-state text-center p-4">
    <div class="mb-2"><i class="bi ${icon} fs-2 text-primary"></i></div>
    <p class="text-muted mb-0">${message}</p>
  </div>
`;

const syncStars = () => {
  document.querySelectorAll(".star-interactive").forEach((item) => {
    const active = Number(item.dataset.value) <= puntuacionActual;
    item.classList.toggle("active", active);
    item.classList.toggle("bi-star-fill", active);
    item.classList.toggle("bi-star", !active);
  });
};

const resetForm = () => {
  if (selectPostulacion) selectPostulacion.value = "";
  if (comentarioInput) comentarioInput.value = "";
  if (etiquetasInput) etiquetasInput.value = "";
  puntuacionActual = 0;
  syncStars();
};

const hydrateFormFromPostulacion = () => {
  const selected = postulaciones.find((item) => Number(item.id_postulacion) === Number(selectPostulacion?.value));

  if (!selected) {
    resetForm();
    return;
  }

  puntuacionActual = Number(selected.puntuacion || 0);
  if (comentarioInput) comentarioInput.value = selected.comentario || "";
  if (etiquetasInput) etiquetasInput.value = Array.isArray(selected.etiquetas) ? selected.etiquetas.join(", ") : "";
  syncStars();
};

const renderPostulaciones = () => {
  if (!selectPostulacion) return;

  selectPostulacion.innerHTML = [
    '<option value="">Selecciona una postulacion</option>',
    ...postulaciones.map((item) => {
      const nombre = `${item.nombres} ${item.apellidos}`;
      const estado = item.id_resena ? " | con resena" : "";
      return `<option value="${item.id_postulacion}">${nombre} | ${item.titulo_puesto}${estado}</option>`;
    })
  ].join("");
};

const renderMisResenas = () => {
  if (!listaResenas) return;

  if (!resenas.length) {
    listaResenas.innerHTML = renderEmptyState("Todavia no has creado resenas para tus postulantes.", "bi-stars");
    return;
  }

  listaResenas.innerHTML = resenas.map((item) => `
    <article class="review-card">
      <div class="d-flex gap-3">
        <div class="avatar-circle flex-shrink-0">${getInitials(item.nombres, item.apellidos)}</div>
        <div class="flex-grow-1">
          <div class="d-flex flex-column flex-lg-row justify-content-between gap-2 mb-2">
            <div>
              <h3 class="h6 fw-bold mb-1">${item.nombres} ${item.apellidos}</h3>
              <p class="text-muted small mb-0">Postulante a ${item.titulo_puesto}</p>
            </div>
            <small class="text-muted">${formatearFecha(item.fecha_resena)}</small>
          </div>
          <div class="stars mb-2">${renderStars(item.puntuacion)} <span class="text-muted small ms-2">${item.puntuacion}/5</span></div>
          <p class="text-muted mb-3">${item.comentario || "Sin comentario adicional."}</p>
          <div class="d-flex gap-2 flex-wrap">${renderTags(item.etiquetas || [])}</div>
        </div>
      </div>
    </article>
  `).join("");
};

const renderValoracionesEmpresa = () => {
  if (!listaValoracionesEmpresa) return;

  if (!valoracionesEmpresa.length) {
    listaValoracionesEmpresa.innerHTML = renderEmptyState("Tu empresa aun no tiene comentarios publicados por usuarios.", "bi-chat-square-heart");
    return;
  }

  listaValoracionesEmpresa.innerHTML = valoracionesEmpresa.map((item) => `
    <article class="review-card">
      <div class="d-flex gap-3">
        <div class="avatar-circle flex-shrink-0">${getInitials(...String(item.nombre_usuario || " ").split(" "))}</div>
        <div class="flex-grow-1">
          <div class="d-flex flex-column flex-lg-row justify-content-between gap-2 mb-2">
            <div>
              <h3 class="h6 fw-bold mb-1">${item.nombre_usuario}</h3>
              <div class="stars">${renderStars(item.puntuacion)} <span class="text-muted small ms-2">${item.puntuacion}/5</span></div>
            </div>
            <small class="text-muted">${formatearFecha(item.fecha_valoracion)}</small>
          </div>
          <p class="text-muted mb-0">${item.comentario || "Sin comentario adicional."}</p>
        </div>
      </div>
    </article>
  `).join("");
};

const renderResenasExternas = () => {
  if (!listaResenasExternas) return;

  if (!resenasExternas.length) {
    listaResenasExternas.innerHTML = renderEmptyState("Todavia no hay referencias externas para tus postulantes actuales.", "bi-diagram-3");
    return;
  }

  listaResenasExternas.innerHTML = resenasExternas.map((item) => `
    <article class="review-card">
      <div class="d-flex gap-3">
        <div class="avatar-circle flex-shrink-0">${getInitials(item.nombres, item.apellidos)}</div>
        <div class="flex-grow-1">
          <div class="d-flex flex-column flex-lg-row justify-content-between gap-2 mb-2">
            <div>
              <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                <h3 class="h6 fw-bold mb-0">${item.nombres} ${item.apellidos}</h3>
                <span class="badge text-bg-light rounded-pill">${item.nombre_comercial}</span>
              </div>
              <p class="text-muted small mb-0">Referenciado por ${item.nombre_comercial} para ${item.titulo_puesto}</p>
            </div>
            <small class="text-muted">${formatearFecha(item.fecha_resena)}</small>
          </div>
          <div class="stars mb-2">${renderStars(item.puntuacion)} <span class="text-muted small ms-2">${item.puntuacion}/5</span></div>
          <p class="text-muted mb-3">${item.comentario || "Sin comentario adicional."}</p>
          <div class="d-flex gap-2 flex-wrap">${renderTags(item.etiquetas || [])}</div>
        </div>
      </div>
    </article>
  `).join("");
};

const renderResumen = () => {
  const promedioMisResenas = resenas.length
    ? (resenas.reduce((acc, item) => acc + Number(item.puntuacion || 0), 0) / resenas.length).toFixed(1)
    : "0.0";

  const totalResenables = postulaciones.length;
  const cobertura = totalResenables ? Math.round((resenas.length / totalResenables) * 100) : 0;

  if (resumenPromedio) resumenPromedio.textContent = promedioMisResenas;
  if (resumenTotal) resumenTotal.textContent = String(resenas.length);
  if (resumenCobertura) resumenCobertura.textContent = `${cobertura}%`;
  if (resumenResenables) resumenResenables.textContent = String(totalResenables);
  if (badgeMisResenas) badgeMisResenas.textContent = `${resenas.length} resenas`;
  if (badgeReferenciasExternas) badgeReferenciasExternas.textContent = `${resenasExternas.length} referencias`;

  if (metricEmpresaPromedio) metricEmpresaPromedio.textContent = Number(resumenEmpresa.promedio || 0).toFixed(1);
  if (metricEmpresaTotal) metricEmpresaTotal.textContent = String(resumenEmpresa.total_valoraciones || 0);
  if (metricMisResenas) metricMisResenas.textContent = String(resenas.length);
  if (metricExternas) metricExternas.textContent = String(resenasExternas.length);
  if (empresaPromedioDetalle) empresaPromedioDetalle.textContent = `${Number(resumenEmpresa.promedio || 0).toFixed(1)} / 5`;
  if (empresaTotalDetalle) empresaTotalDetalle.textContent = `${resumenEmpresa.total_valoraciones || 0} resenas recibidas`;
};

const bindStars = () => {
  document.querySelectorAll(".star-interactive").forEach((star) => {
    star.addEventListener("click", () => {
      puntuacionActual = Number(star.dataset.value);
      syncStars();
    });
  });
};

const cargarPanel = async () => {
  const response = await fetch(`${API_URL}/empresa/resenas-postulantes`, {
    headers: authHeaders()
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudieron cargar las resenas.");
  }

  postulaciones = Array.isArray(data.postulaciones) ? data.postulaciones : [];
  resenas = Array.isArray(data.resenas) ? data.resenas : [];
  resenasExternas = Array.isArray(data.resenas_externas) ? data.resenas_externas : [];
  valoracionesEmpresa = Array.isArray(data.valoraciones_empresa) ? data.valoraciones_empresa : [];
  resumenEmpresa = data.resumen_empresa || { promedio: 0, total_valoraciones: 0 };

  renderPostulaciones();
  renderMisResenas();
  renderValoracionesEmpresa();
  renderResenasExternas();
  renderResumen();
};

selectPostulacion?.addEventListener("change", hydrateFormFromPostulacion);

btnGuardar?.addEventListener("click", async () => {
  try {
    if (!selectPostulacion?.value) {
      throw new Error("Selecciona una postulacion.");
    }

    if (!puntuacionActual) {
      throw new Error("Selecciona una puntuacion.");
    }

    if (!comentarioInput?.value.trim()) {
      throw new Error("Escribe una resena.");
    }

    const response = await fetch(`${API_URL}/empresa/resenas-postulantes`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify({
        id_postulacion_fk: Number(selectPostulacion.value),
        puntuacion: puntuacionActual,
        comentario: comentarioInput.value.trim(),
        etiquetas: etiquetasInput.value.split(",").map((item) => item.trim()).filter(Boolean)
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.mensaje || "No se pudo guardar la resena.");
    }

    showAlert("Resena guardada correctamente.", "success");
    await cargarPanel();
    hydrateFormFromPostulacion();
  } catch (error) {
    console.error(error);
    showAlert(error.message);
  }
});

bindStars();
syncStars();

cargarPanel().catch((error) => {
  console.error(error);
  showAlert(error.message || "No se pudo cargar la vista.");
});
