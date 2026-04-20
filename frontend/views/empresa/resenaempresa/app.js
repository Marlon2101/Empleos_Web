import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth } from "../../../assets/js/shared/auth.js";

requireAuth(["empresa"]);

const listaResenas = document.getElementById("listaResenas");
const selectPostulacion = document.getElementById("id_postulacion_fk");
const comentarioInput = document.getElementById("comentarioResena");
const etiquetasInput = document.getElementById("etiquetasResena");
const btnGuardar = document.getElementById("btnGuardarResena");
const alertContainer = document.getElementById("alertContainer");
const resumenPromedio = document.getElementById("resumenPromedio");
const resumenTotal = document.getElementById("resumenTotal");
const resumenCobertura = document.getElementById("resumenCobertura");

let puntuacionActual = 0;
let postulaciones = [];
let resenas = [];

const authHeaders = (withJson = false) => ({
  ...(withJson ? { "Content-Type": "application/json" } : {}),
  Authorization: `Bearer ${getToken()}`
});

const showAlert = (message, type = "danger") => {
  if (!alertContainer) return;
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show rounded-4" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
};

const formatearFecha = (fecha) => {
  if (!fecha) return "N/D";
  return new Date(fecha).toLocaleDateString("es-SV", { dateStyle: "medium" });
};

const renderStars = (value) => {
  const full = Math.round(Number(value || 0));
  return Array.from({ length: 5 }, (_, index) =>
    `<i class="bi ${index < full ? "bi-star-fill" : "bi-star"}"></i>`
  ).join("");
};

const renderPostulaciones = () => {
  if (!selectPostulacion) return;

  selectPostulacion.innerHTML = [
    `<option value="">Selecciona una postulacion</option>`,
    ...postulaciones.map((item) => {
      const nombre = `${item.nombres} ${item.apellidos}`;
      return `<option value="${item.id_postulacion}">${nombre} · ${item.titulo_puesto}</option>`;
    })
  ].join("");
};

const renderResenas = () => {
  if (!listaResenas) return;

  if (!resenas.length) {
    listaResenas.innerHTML = `<p class="text-muted mb-0">Todavia no has dejado reseñas a postulantes.</p>`;
    return;
  }

  listaResenas.innerHTML = resenas.map((item) => `
    <div class="review-card">
      <div class="d-flex gap-3 mb-3">
        <div class="avatar-circle">${(item.nombres?.[0] || "") + (item.apellidos?.[0] || "")}</div>
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="fw-bold mb-1">${item.nombres} ${item.apellidos}</h6>
              <p class="text-secondary small mb-1">Postulante a ${item.titulo_puesto}</p>
            </div>
            <span class="text-secondary small">${formatearFecha(item.fecha_resena)}</span>
          </div>
        </div>
      </div>
      <div class="stars mb-2">${renderStars(item.puntuacion)} <span class="text-secondary small ms-2">${item.puntuacion}/5</span></div>
      <p class="text-secondary mb-3">${item.comentario}</p>
      <div class="d-flex gap-2 flex-wrap">
        ${(item.etiquetas || []).map((tag) => `<span class="badge bg-light text-dark px-3 py-2">${tag}</span>`).join("")}
      </div>
    </div>
  `).join("");
};

const renderResumen = () => {
  const promedio = resenas.length
    ? (resenas.reduce((acc, item) => acc + Number(item.puntuacion || 0), 0) / resenas.length).toFixed(1)
    : "0.0";

  if (resumenPromedio) resumenPromedio.textContent = `${promedio} ★`;
  if (resumenTotal) resumenTotal.textContent = String(resenas.length);
  if (resumenCobertura) {
    const totalResenables = postulaciones.length || 1;
    resumenCobertura.textContent = `${Math.round((resenas.length / totalResenables) * 100)}%`;
  }
};

const bindStars = () => {
  document.querySelectorAll(".star-interactive").forEach((star) => {
    star.addEventListener("click", () => {
      puntuacionActual = Number(star.dataset.value);
      document.querySelectorAll(".star-interactive").forEach((item) => {
        const active = Number(item.dataset.value) <= puntuacionActual;
        item.classList.toggle("active", active);
        item.classList.toggle("bi-star-fill", active);
        item.classList.toggle("bi-star", !active);
      });
    });
  });
};

const cargarPanel = async () => {
  const response = await fetch(`${API_URL}/empresa/resenas-postulantes`, {
    headers: authHeaders()
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudieron cargar las reseñas.");
  }

  postulaciones = Array.isArray(data.postulaciones) ? data.postulaciones : [];
  resenas = Array.isArray(data.resenas) ? data.resenas : [];
  renderPostulaciones();
  renderResenas();
  renderResumen();
};

btnGuardar?.addEventListener("click", async () => {
  try {
    if (!selectPostulacion?.value) {
      throw new Error("Selecciona una postulacion.");
    }

    if (!puntuacionActual) {
      throw new Error("Selecciona una puntuacion.");
    }

    if (!comentarioInput?.value.trim()) {
      throw new Error("Escribe una reseña.");
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
      throw new Error(data.mensaje || "No se pudo guardar la reseña.");
    }

    comentarioInput.value = "";
    etiquetasInput.value = "";
    selectPostulacion.value = "";
    puntuacionActual = 0;
    document.querySelectorAll(".star-interactive").forEach((item) => {
      item.classList.remove("active", "bi-star-fill");
      item.classList.add("bi-star");
    });

    showAlert("Reseña guardada correctamente.", "success");
    await cargarPanel();
  } catch (error) {
    console.error(error);
    showAlert(error.message);
  }
});

bindStars();
cargarPanel().catch((error) => {
  console.error(error);
  showAlert(error.message || "No se pudo cargar la vista.");
});
