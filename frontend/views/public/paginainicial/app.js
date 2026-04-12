import { API_URL } from "../../../assets/js/shared/config.js";

const contenedorVacantes = document.getElementById("contenedorVacantes");
const alertContainer = document.getElementById("alertContainer");
const statVacantes = document.getElementById("statVacantes");

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
};

const renderVacantes = (items) => {
  statVacantes.textContent = items?.length ?? 0;

  if (!items || items.length === 0) {
    contenedorVacantes.innerHTML = `
      <div class="col-12">
        <div class="alert alert-light border">No hay vacantes disponibles en este momento.</div>
      </div>
    `;
    return;
  }

  const top = items.slice(0, 6);

  contenedorVacantes.innerHTML = top.map(item => `
    <div class="col-md-6 col-xl-4">
      <div class="card card-custom vacante-card">
        <div class="card-body">
          <span class="badge bg-primary-subtle text-primary mb-2">${item.nombre_categoria}</span>
          <h5 class="card-title">${item.titulo_puesto}</h5>
          <p class="text-muted mb-2">${item.nombre_comercial}</p>

          <div class="vacante-meta mb-3">
            <div><strong>Municipio:</strong> ${item.nombre_municipio ?? "No definido"}</div>
            <div><strong>Modalidad:</strong> ${item.modalidad}</div>
            <div><strong>Salario:</strong> $${Number(item.salario_offrecido ?? 0).toFixed(2)}</div>
          </div>

          <p class="card-text">${(item.descripcion_puesto ?? "").slice(0, 120)}...</p>

          <div class="vacante-footer mt-3">
            <a href="../../public/login/index.html" class="btn btn-primary btn-sm">
              Inicia sesión para aplicar
            </a>
          </div>
        </div>
      </div>
    </div>
  `).join("");
};

const cargarVacantes = async () => {
  try {
    const response = await fetch(`${API_URL}/vacantes/busqueda/filtros`);
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

cargarVacantes();