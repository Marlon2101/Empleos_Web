import { API_URL, getUsuario } from "../../../assets/js/shared/config.js";
import { requireAuth } from "../../../assets/js/shared/auth.js";

requireAuth(["usuario"]);

const contenedorDestacados = document.getElementById("contenedor-destacados");
const nombreUsuario = document.getElementById("nombreUsuario");
const btnBusquedaRapida = document.getElementById("btnBusquedaRapida");
const inputBusquedaRapida = document.getElementById("inputBusquedaRapida");
const btnAplicarFiltros = document.getElementById("btnAplicarFiltros");
const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");
const seccionResultados = document.getElementById("seccion-resultados-busqueda");
const contenedorResultados = document.getElementById("contenedor-resultados");
const contadorResultados = document.getElementById("contador-resultados");

const obtenerNombreVisible = () => {
  const usuario = getUsuario();

  if (!usuario) {
    return "Usuario";
  }

  return (
    usuario.nombres ||
    usuario.nombre ||
    usuario.nombre_comercial ||
    usuario.correo_electronico ||
    "Usuario"
  );
};

const formatearSalario = (vacante) => {
  if (vacante.salario_offrecido === null || vacante.salario_offrecido === undefined || vacante.salario_offrecido === "") {
    return "A convenir";
  }

  return `$${Number(vacante.salario_offrecido).toFixed(2)}`;
};

const tarjetaVacante = (vacante) => `
  <div class="col-md-4 mb-4">
    <div class="job-card bg-white rounded-4 p-4 h-100 d-flex flex-column position-relative" style="border: 1px solid #e0e5f0; transition: all 0.3s ease;">
      <div class="d-flex align-items-start mb-3 mt-2">
        <div class="bg-light rounded-3 d-flex align-items-center justify-content-center me-3 flex-shrink-0" style="width: 50px; height: 50px; border: 1px solid #edf0f7;">
          <i class="bi bi-buildings fs-4" style="color: var(--primary-deep);"></i>
        </div>
        <div>
          <h6 class="fw-bold mb-1" style="color: #121826; font-size: 1.05rem;">${vacante.titulo_puesto || vacante.titulo || "Vacante"}</h6>
          <p class="text-secondary small mb-0 fw-medium">${vacante.nombre_empresa || vacante.nombre_comercial || vacante.empresa || "Empresa"}</p>
        </div>
      </div>
      <div class="mb-4 mt-2">
        <div class="d-flex align-items-center text-muted small mb-2">
          <i class="bi bi-geo-alt me-2 text-secondary"></i> ${vacante.nombre_municipio || "El Salvador"}
        </div>
        <div class="d-flex align-items-center text-muted small mb-2">
          <i class="bi bi-cash-stack me-2 text-secondary"></i> ${formatearSalario(vacante)}
        </div>
        <div class="d-flex align-items-center text-muted small">
          <i class="bi bi-bar-chart-steps me-2 text-secondary"></i> ${vacante.experiencia_nivel || "No especificado"}
        </div>
      </div>
      <div class="mt-auto pt-3 border-top">
        <a href="../detalleempleo/index.html?id=${vacante.id_vacante}" class="btn text-white w-100 rounded-pill fw-medium py-2" style="background-color: var(--primary-deep); box-shadow: 0 4px 10px rgba(63, 81, 181, 0.2);">
          Ver vacante <i class="bi bi-arrow-right-short ms-1 fs-5 align-middle"></i>
        </a>
      </div>
    </div>
  </div>
`;

const renderDestacados = (vacantes) => {
  if (!contenedorDestacados) return;

  if (!vacantes.length) {
    contenedorDestacados.innerHTML = "<p class='text-center text-muted'>No hay empleos destacados por ahora.</p>";
    return;
  }

  contenedorDestacados.innerHTML = vacantes.slice(0, 6).map(tarjetaVacante).join("");
};

const renderResultados = (vacantes) => {
  if (!seccionResultados || !contenedorResultados || !contadorResultados) return;

  seccionResultados.classList.remove("d-none");
  contadorResultados.textContent = `${vacantes.length} encontrados`;

  if (!vacantes.length) {
    contenedorResultados.innerHTML = `
      <div class="col-12 text-center py-4 bg-white rounded-4 border">
        <i class="bi bi-search fs-1 text-muted opacity-50"></i>
        <h6 class="mt-3 fw-bold">No se encontraron vacantes</h6>
        <p class="text-muted small">Intenta buscar con otras palabras o ajusta los filtros.</p>
      </div>
    `;
    return;
  }

  contenedorResultados.innerHTML = vacantes.map(tarjetaVacante).join("");
};

const cargarEmpleosDestacados = async () => {
  if (!contenedorDestacados) return;

  try {
    const response = await fetch(`${API_URL}/vacantes`);
    if (!response.ok) throw new Error("No se pudieron cargar las vacantes");

    const vacantes = await response.json();
    renderDestacados(Array.isArray(vacantes) ? vacantes : []);
  } catch (error) {
    console.error("Error cargando empleos:", error);
    contenedorDestacados.innerHTML = "<p class='text-danger text-center'><i class='bi bi-exclamation-circle'></i> Error al conectar con el servidor.</p>";
  }
};

const normalizarTexto = (value = "") =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const obtenerModalidades = () => {
  const modalidades = [];
  if (document.getElementById("filtroRemoto")?.checked) modalidades.push("Remoto");
  if (document.getElementById("filtroPresencial")?.checked) modalidades.push("Presencial");
  if (document.getElementById("filtroHibrido")?.checked) modalidades.push("Hibrido");
  return modalidades;
};

const construirFiltros = () => {
  const params = new URLSearchParams();

  const palabra = document.getElementById("filtroPalabra")?.value.trim() || "";
  const ubicacion = document.getElementById("filtroUbicacion")?.value.trim() || "";
  const tipo = document.getElementById("filtroTipo")?.value || "";
  const experiencia = document.getElementById("filtroExperiencia")?.value || "";
  const salarioMin = document.getElementById("filtroSalarioMin")?.value || "";
  const salarioMax = document.getElementById("filtroSalarioMax")?.value || "";
  const modalidades = obtenerModalidades();

  if (palabra) params.set("q", palabra);
  if (ubicacion) params.set("ubicacion", ubicacion);

  if (tipo && !normalizarTexto(tipo).includes("todos")) {
    params.set("tipo", tipo);
  }

  if (experiencia && !normalizarTexto(experiencia).includes("todos")) {
    params.set("experiencia", experiencia);
  }

  if (salarioMin && !normalizarTexto(salarioMin).includes("min")) {
    params.set("min", salarioMin);
  }

  if (salarioMax && !normalizarTexto(salarioMax).includes("max")) {
    params.set("max", salarioMax);
  }

  if (modalidades.length > 0) {
    params.set("modalidad", modalidades.join(","));
  }

  return params;
};

const buscarConFiltros = async () => {
  if (!contenedorResultados) return;

  const params = construirFiltros();
  contenedorResultados.innerHTML = `<div class="col-12 text-center py-5"><div class="spinner-border text-primary" role="status"></div><p class="mt-2 text-muted">Buscando los mejores empleos para ti...</p></div>`;
  seccionResultados?.classList.remove("d-none");
  seccionResultados?.scrollIntoView({ behavior: "smooth", block: "start" });

  try {
    const response = await fetch(`${API_URL}/vacantes/busqueda/filtros?${params.toString()}`);
    if (!response.ok) throw new Error("No se pudieron filtrar las vacantes");

    let vacantes = await response.json();
    vacantes = Array.isArray(vacantes) ? vacantes : [];

    const modalidades = obtenerModalidades().map(normalizarTexto);
    if (modalidades.length > 0) {
      vacantes = vacantes.filter((vacante) => {
        const modalidadVacante = normalizarTexto(vacante.modalidad || "");
        return modalidades.some((modalidad) => modalidadVacante.includes(modalidad));
      });
    }

    renderResultados(vacantes);
  } catch (error) {
    console.error("Error filtrando vacantes:", error);
    contenedorResultados.innerHTML = `<div class="col-12 text-center text-danger"><i class="bi bi-x-circle fs-3"></i><p>Hubo un problema al buscar vacantes.</p></div>`;
  }
};

const limpiarFiltros = () => {
  document.getElementById("filtroPalabra").value = "";
  document.getElementById("filtroUbicacion").value = "";
  document.getElementById("filtroTipo").selectedIndex = 0;
  document.getElementById("filtroExperiencia").selectedIndex = 0;
  document.getElementById("filtroSalarioMin").selectedIndex = 0;
  document.getElementById("filtroSalarioMax").selectedIndex = 0;
  document.getElementById("filtroRemoto").checked = false;
  document.getElementById("filtroPresencial").checked = false;
  document.getElementById("filtroHibrido").checked = false;
  seccionResultados?.classList.add("d-none");
};

const irABusqueda = () => {
  const query = inputBusquedaRapida?.value.trim();
  if (!query) {
    window.location.href = "../buscarempleo/index.html";
    return;
  }

  btnBusquedaRapida?.setAttribute("disabled", "true");
  btnBusquedaRapida.innerHTML = `Buscando <span class="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>`;
  window.location.href = `../buscarempleo/index.html?q=${encodeURIComponent(query)}`;
};

document.addEventListener("DOMContentLoaded", () => {
  if (nombreUsuario) {
    nombreUsuario.textContent = obtenerNombreVisible();
  }

  cargarEmpleosDestacados();

  btnBusquedaRapida?.addEventListener("click", irABusqueda);
  inputBusquedaRapida?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      irABusqueda();
    }
  });

  btnAplicarFiltros?.addEventListener("click", buscarConFiltros);
  btnLimpiarFiltros?.addEventListener("click", limpiarFiltros);
});
