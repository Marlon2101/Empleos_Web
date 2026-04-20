import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth } from "../../../assets/js/shared/auth.js";

requireAuth(["empresa"]);

const contenedorVacantes = document.getElementById("contenedorVacantes");
const sinVacantes = document.getElementById("sinVacantes");
const searchInput = document.querySelector(".filter-bar input");
const statusBadges = [...document.querySelectorAll(".status-badge.cursor-pointer")];
const resumenCard = document.querySelector(".sidebar-card");
const modalEstadisticas = document.getElementById("modalEstadisticas");

let vacantes = [];
let filtroEstado = "Activa";

const authHeaders = (withJson = false) => ({
  ...(withJson ? { "Content-Type": "application/json" } : {}),
  Authorization: `Bearer ${getToken()}`
});

const formatearFecha = (fecha) => {
  if (!fecha) return "Reciente";
  return new Date(fecha).toLocaleDateString("es-SV", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};

const filtrarVacantes = () => {
  const texto = (searchInput?.value || "").trim().toLowerCase();
  return vacantes.filter((item) => {
    const coincideTexto =
      !texto ||
      [item.titulo_puesto, item.nombre_categoria, item.nombre_municipio, item.modalidad]
        .some((value) => String(value || "").toLowerCase().includes(texto));

    const coincideEstado = !filtroEstado || item.estado === filtroEstado;
    return coincideTexto && coincideEstado;
  });
};

const actualizarResumen = () => {
  if (!resumenCard) return;

  const totalPostulaciones = vacantes.reduce((acc, item) => acc + Number(item.total_postulaciones || 0), 0);
  const activas = vacantes.filter((item) => item.estado === "Activa").length;
  const inactivas = vacantes.filter((item) => item.estado === "Inactiva").length;

  const progressBars = resumenCard.querySelectorAll(".progress-bar");
  const valueNodes = [...resumenCard.querySelectorAll(".d-flex.justify-content-between.small.fw-medium.mb-1 .fw-bold")];

  if (valueNodes[0]) valueNodes[0].textContent = String(vacantes.length);
  if (valueNodes[1]) valueNodes[1].textContent = String(totalPostulaciones);

  if (progressBars[0]) {
    progressBars[0].style.width = `${Math.min(100, activas * 15 || 5)}%`;
  }
  if (progressBars[1]) {
    progressBars[1].style.width = `${Math.min(100, totalPostulaciones * 8 || 5)}%`;
  }

  const modalBody = modalEstadisticas?.querySelector(".modal-body");
  if (modalBody) {
    const statNumbers = modalBody.querySelectorAll("h2.fw-bold.mb-1");
    if (statNumbers[0]) statNumbers[0].textContent = String(vacantes.length);
    if (statNumbers[1]) statNumbers[1].textContent = String(totalPostulaciones);
    if (statNumbers[2]) {
      const tasa = vacantes.length ? ((totalPostulaciones / vacantes.length) * 100).toFixed(1) : "0.0";
      statNumbers[2].textContent = `${tasa}%`;
    }

    const rows = modalBody.querySelectorAll(".border.rounded-4 .p-3:not(.border-bottom.bg-light)");
    const top = [...vacantes]
      .sort((a, b) => Number(b.total_postulaciones || 0) - Number(a.total_postulaciones || 0))
      .slice(0, 2);

    rows.forEach((row, index) => {
      const item = top[index];
      if (!item) return;
      const cols = row.querySelectorAll(".col-6, .col-3");
      if (cols[0]) cols[0].textContent = item.titulo_puesto || "Vacante";
      if (cols[1]) cols[1].querySelector(".badge").textContent = String(item.total_postulaciones || 0);
      if (cols[2]) cols[2].textContent = `${(Number(item.total_postulaciones || 0) * 7) + 10}`;
    });
  }

  const estadoNodes = document.querySelectorAll(".status-badge.cursor-pointer");
  if (estadoNodes[0]) estadoNodes[0].textContent = `Activas (${activas})`;
  if (estadoNodes[1]) estadoNodes[1].textContent = `Inactivas (${inactivas})`;
};

const getEstadoBadgeClass = (estado) => estado === "Activa" ? "status-active" : "status-closed";

const renderVacantes = () => {
  const items = filtrarVacantes();

  if (!items.length) {
    contenedorVacantes.innerHTML = "";
    sinVacantes?.classList.remove("d-none");
    return;
  }

  sinVacantes?.classList.add("d-none");
  contenedorVacantes.innerHTML = items.map((item) => `
    <div class="vacancy-card">
      <div class="row align-items-center g-3">
        <div class="col-12 col-md-5">
          <div class="d-flex align-items-center gap-3">
            <div class="bg-light p-2 rounded-3">
              <i class="bi bi-briefcase fs-5" style="color: var(--primary-deep);"></i>
            </div>
            <div>
              <h6 class="fw-bold mb-0">${item.titulo_puesto}</h6>
              <span class="text-secondary small">${item.nombre_categoria || "Sin categoria"} · ${item.nombre_municipio || "Sin ubicacion"} · ${item.modalidad || "N/D"}</span>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-2">
          <span class="status-badge ${getEstadoBadgeClass(item.estado)}">${item.estado}</span>
        </div>
        <div class="col-6 col-md-2">
          <span class="fw-bold">${Number(item.total_postulaciones || 0)}</span> <span class="text-secondary small">postulantes</span>
        </div>
        <div class="col-6 col-md-2">
          <span class="text-secondary small">Publicada: ${formatearFecha(item.fecha_publicacion)}</span>
        </div>
        <div class="col-6 col-md-1 text-end">
          <div class="dropdown">
            <button class="btn btn-light btn-sm rounded-pill px-3" data-bs-toggle="dropdown">
              <i class="bi bi-three-dots"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end border-0 shadow rounded-3">
              <li><a class="dropdown-item" href="../postulaciones/index.html"><i class="bi bi-people me-2"></i>Ver postulaciones</a></li>
              <li><button class="dropdown-item btn-toggle-estado" data-id="${item.id_vacante}" data-estado="${item.estado === "Activa" ? "Inactiva" : "Activa"}"><i class="bi ${item.estado === "Activa" ? "bi-pause-circle" : "bi-play-circle"} me-2"></i>${item.estado === "Activa" ? "Desactivar" : "Reactivar"}</button></li>
              <li><hr class="dropdown-divider"></li>
              <li><button class="dropdown-item text-danger btn-eliminar" data-id="${item.id_vacante}"><i class="bi bi-trash me-2"></i>Eliminar</button></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `).join("");

  contenedorVacantes.querySelectorAll(".btn-toggle-estado").forEach((button) => {
    button.addEventListener("click", async () => {
      await cambiarEstadoVacante(button.dataset.id, button.dataset.estado);
    });
  });

  contenedorVacantes.querySelectorAll(".btn-eliminar").forEach((button) => {
    button.addEventListener("click", async () => {
      await eliminarVacante(button.dataset.id);
    });
  });
};

const cargarVacantes = async () => {
  const response = await fetch(`${API_URL}/vacantes/mis-vacantes`, {
    headers: authHeaders()
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudieron cargar tus vacantes.");
  }

  vacantes = Array.isArray(data) ? data : [];
  actualizarResumen();
  renderVacantes();
};

const cambiarEstadoVacante = async (id, estado) => {
  const response = await fetch(`${API_URL}/vacantes/${id}/estado`, {
    method: "PATCH",
    headers: authHeaders(true),
    body: JSON.stringify({ estado })
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo cambiar el estado.");
  }

  await cargarVacantes();
};

const eliminarVacante = async (id) => {
  if (!window.confirm("Seguro que quieres eliminar esta vacante?")) return;

  const response = await fetch(`${API_URL}/vacantes/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo eliminar la vacante.");
  }

  await cargarVacantes();
};

statusBadges.forEach((badge, index) => {
  badge.addEventListener("click", () => {
    statusBadges.forEach((item) => {
      item.style.opacity = "0.6";
    });
    badge.style.opacity = "1";
    filtroEstado = index === 0 ? "Activa" : "Inactiva";
    renderVacantes();
  });
});

searchInput?.addEventListener("input", renderVacantes);

if (statusBadges[0]) {
  statusBadges[0].style.opacity = "1";
}

cargarVacantes().catch((error) => {
  console.error(error);
  contenedorVacantes.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
});
