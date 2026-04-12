import { API_URL, getToken, getUsuario } from "../../../assets/js/shared/config.js";
import { requireAuth, logout } from "../../../assets/js/shared/auth.js";

requireAuth(["empresa"]);

const btnLogout = document.getElementById("btnLogout");
const contenedorVacantes = document.getElementById("contenedorVacantes");
const alertContainer = document.getElementById("alertContainer");

btnLogout.addEventListener("click", logout);

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
};

const formatearFecha = (fecha) => {
  if (!fecha) return "N/D";
  return new Date(fecha).toLocaleDateString("es-SV");
};

const renderVacantes = (items) => {
  if (!items || items.length === 0) {
    contenedorVacantes.innerHTML = `
      <div class="col-12">
        <div class="alert alert-light border">Todavía no has publicado vacantes.</div>
      </div>
    `;
    return;
  }

  contenedorVacantes.innerHTML = items.map(item => `
    <div class="col-md-6 col-xl-4">
      <div class="card card-custom vacante-card">
        <div class="card-body">
          <span class="badge bg-primary-subtle text-primary mb-2">${item.nombre_categoria}</span>
          <h5 class="card-title">${item.titulo_puesto}</h5>

          <div class="vacante-meta mb-3">
            <div><strong>Municipio:</strong> ${item.nombre_municipio ?? "No definido"}</div>
            <div><strong>Modalidad:</strong> ${item.modalidad}</div>
            <div><strong>Salario:</strong> $${Number(item.salario_offrecido ?? 0).toFixed(2)}</div>
            <div><strong>Fecha:</strong> ${formatearFecha(item.fecha_publicacion)}</div>
          </div>

          <p class="card-text">${(item.descripcion_puesto ?? "").slice(0, 120)}...</p>

          <div class="vacante-actions d-flex gap-2 mt-3">
            <a href="../postulaciones/index.html" class="btn btn-outline-primary btn-sm">
              Ver postulaciones
            </a>
          </div>
        </div>
      </div>
    </div>
  `).join("");
};

const cargarMisVacantes = async () => {
  try {
    const empresa = getUsuario();

    if (!empresa?.id_empresa) {
      showAlert("No se pudo identificar la empresa logueada");
      return;
    }

    const response = await fetch(`${API_URL}/vacantes/empresa/${empresa.id_empresa}`, {
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudieron cargar las vacantes");
      return;
    }

    renderVacantes(data);
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
};

cargarMisVacantes();