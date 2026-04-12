import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth, logout } from "../../../assets/js/shared/auth.js";

requireAuth(["usuario"]);

const btnLogout = document.getElementById("btnLogout");
const formValoracion = document.getElementById("formValoracion");
const resumenEmpresa = document.getElementById("resumenEmpresa");
const listaValoraciones = document.getElementById("listaValoraciones");
const alertContainer = document.getElementById("alertContainer");

btnLogout.addEventListener("click", logout);

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
};

const getEmpresaId = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("id_empresa");
};

const formatearFecha = (fecha) => {
  if (!fecha) return "N/D";
  return new Date(fecha).toLocaleDateString("es-SV");
};

const renderResumen = (resumen) => {
  resumenEmpresa.innerHTML = `
    <div class="row g-3">
      <div class="col-md-6">
        <div class="text-muted">Promedio</div>
        <div class="fs-3 fw-bold">${resumen?.promedio ?? 0}</div>
      </div>
      <div class="col-md-6">
        <div class="text-muted">Total valoraciones</div>
        <div class="fs-3 fw-bold">${resumen?.total_valoraciones ?? 0}</div>
      </div>
    </div>
  `;
};

const renderValoraciones = (items) => {
  if (!items || items.length === 0) {
    listaValoraciones.innerHTML = `<p class="text-muted mb-0">Esta empresa todavía no tiene valoraciones.</p>`;
    return;
  }

  listaValoraciones.innerHTML = items.map(item => `
    <div class="valoracion-item">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div class="valoracion-usuario">${item.nombre_usuario}</div>
        <span class="badge text-bg-primary">${item.puntuacion}/5</span>
      </div>
      <div class="mb-2">${item.comentario}</div>
      <div class="valoracion-meta">${formatearFecha(item.fecha_valoracion)}</div>
    </div>
  `).join("");
};

const cargarValoraciones = async () => {
  try {
    const idEmpresa = getEmpresaId();

    if (!idEmpresa) {
      showAlert("No se encontró el id de la empresa");
      return;
    }

    const response = await fetch(`${API_URL}/valoraciones/empresa/${idEmpresa}`);
    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudieron cargar las valoraciones");
      return;
    }

    renderResumen(data.resumen);
    renderValoraciones(data.valoraciones);
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
};

formValoracion.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const idEmpresa = getEmpresaId();

    if (!idEmpresa) {
      showAlert("No se encontró el id de la empresa");
      return;
    }

    const body = {
      id_empresa_fk: Number(idEmpresa),
      puntuacion: Number(document.getElementById("puntuacion").value),
      comentario: document.getElementById("comentario").value.trim()
    };

    const response = await fetch(`${API_URL}/valoraciones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudo guardar la valoración");
      return;
    }

    showAlert("Valoración enviada correctamente", "success");
    formValoracion.reset();
    await cargarValoraciones();
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
});

cargarValoraciones();