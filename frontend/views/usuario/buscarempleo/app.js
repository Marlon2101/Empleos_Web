import { API_URL } from "../../../assets/js/shared/config.js";
import { requireAuth, logout } from "../../../assets/js/shared/auth.js";

requireAuth(["usuario"]);

const btnLogout = document.getElementById("btnLogout");
const btnBuscar = document.getElementById("btnBuscar");
const btnLimpiar = document.getElementById("btnLimpiar");

const filtroTitulo = document.getElementById("filtroTitulo");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroMunicipio = document.getElementById("filtroMunicipio");
const filtroModalidad = document.getElementById("filtroModalidad");

const contenedorVacantes = document.getElementById("contenedorVacantes");
const contadorResultados = document.getElementById("contadorResultados");
const alertContainer = document.getElementById("alertContainer");

btnLogout.addEventListener("click", logout);

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
};

const cargarCategorias = async () => {
  const response = await fetch(`${API_URL}/catalogos/categorias`);
  const data = await response.json();

  filtroCategoria.innerHTML = `<option value="">Todas las categorías</option>`;
  data.forEach(item => {
    filtroCategoria.innerHTML += `<option value="${item.id_categoria}">${item.nombre_categoria}</option>`;
  });
};

const cargarMunicipios = async () => {
  const response = await fetch(`${API_URL}/catalogos/municipios`);
  const data = await response.json();

  filtroMunicipio.innerHTML = `<option value="">Todos los municipios</option>`;
  data.forEach(item => {
    filtroMunicipio.innerHTML += `<option value="${item.id_municipio}">${item.nombre_municipio}</option>`;
  });
};

const renderVacantes = (items) => {
  contadorResultados.textContent = `${items.length} vacante(s)`;

  if (!items || items.length === 0) {
    contenedorVacantes.innerHTML = `
      <div class="col-12">
        <div class="alert alert-light border">No se encontraron vacantes con esos filtros.</div>
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
          <p class="text-muted mb-2">${item.nombre_comercial}</p>

          <div class="vacante-meta mb-3">
            <div><strong>Municipio:</strong> ${item.nombre_municipio ?? "No definido"}</div>
            <div><strong>Modalidad:</strong> ${item.modalidad}</div>
            <div><strong>Salario:</strong> $${Number(item.salario_offrecido ?? 0).toFixed(2)}</div>
          </div>

          <p class="card-text">${(item.descripcion_puesto ?? "").slice(0, 120)}...</p>

          <div class="vacante-footer mt-3">
            <a href="../detalleempleo/index.html?id=${item.id_vacante}" class="btn btn-primary btn-sm">
              Ver detalle
            </a>
          </div>
        </div>
      </div>
    </div>
  `).join("");
};

const cargarVacantes = async () => {
  try {
    alertContainer.innerHTML = "";

    const params = new URLSearchParams();

    if (filtroTitulo.value.trim()) {
      params.append("titulo", filtroTitulo.value.trim());
    }

    if (filtroCategoria.value) {
      params.append("id_categoria", filtroCategoria.value);
    }

    if (filtroMunicipio.value) {
      params.append("id_municipio", filtroMunicipio.value);
    }

    if (filtroModalidad.value) {
      params.append("modalidad", filtroModalidad.value);
    }

    const url = `${API_URL}/vacantes/busqueda/filtros?${params.toString()}`;
    const response = await fetch(url);
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

btnBuscar.addEventListener("click", cargarVacantes);

btnLimpiar.addEventListener("click", () => {
  filtroTitulo.value = "";
  filtroCategoria.value = "";
  filtroMunicipio.value = "";
  filtroModalidad.value = "";
  cargarVacantes();
});

const init = async () => {
  try {
    await cargarCategorias();
    await cargarMunicipios();
    await cargarVacantes();
  } catch (error) {
    console.error(error);
    showAlert("No se pudo inicializar la vista");
  }
};

init();