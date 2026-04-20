import { API_URL } from "../../../assets/js/shared/config.js";

const PAGE_SIZE = 6;

document.addEventListener("DOMContentLoaded", () => {
  const contenedorVacantes = document.getElementById("contenedor-vacantes");
  const inputBusqueda = document.getElementById("inputBusquedaPrincipal");
  const btnBuscar = document.getElementById("btnBuscarPrincipal");
  const btnAplicarFiltros = document.getElementById("btnAplicarFiltros");
  const btnAplicarMobile = document.getElementById("btnAplicarFiltrosMobile");
  const textoBarraEstado = document.getElementById("textoBarraEstado");
  const paginacionRoot = document.querySelector(".pagination-container");

  let resultadosActuales = [];
  let paginaActual = 1;

  const formatearFecha = (fecha) => {
    if (!fecha) return "Sin fecha";
    const parsed = new Date(fecha);
    if (Number.isNaN(parsed.getTime())) return "Sin fecha";
    return parsed.toLocaleDateString("es-SV");
  };

  const formatearSalario = (vacante) => {
    if (vacante.salario_offrecido === null || vacante.salario_offrecido === undefined || vacante.salario_offrecido === "") {
      return "A convenir";
    }

    return `$${Number(vacante.salario_offrecido).toFixed(2)}`;
  };

  const normalizarTexto = (value = "") =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const parseFechaVacante = (value) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const aplicarFiltroLocalFecha = (vacantes) => {
    let rangoDias = null;

    if (document.getElementById("fecha2")?.checked) rangoDias = 1;
    else if (document.getElementById("fecha3")?.checked) rangoDias = 7;
    else if (document.getElementById("fecha4")?.checked) rangoDias = 30;

    if (!rangoDias) {
      return vacantes;
    }

    const ahora = Date.now();
    return vacantes.filter((vacante) => {
      const fecha = parseFechaVacante(vacante.fecha_publicacion);
      if (!fecha) return false;
      const diferenciaDias = (ahora - fecha.getTime()) / (1000 * 60 * 60 * 24);
      return diferenciaDias >= 0 && diferenciaDias <= rangoDias;
    });
  };

  const tarjetaVacante = (vacante) => `
    <div class="card mb-4 p-4 border-0 shadow-sm" style="border-radius: 20px; transition: transform 0.2s;">
      <div class="row align-items-center">
        <div class="col-md-9">
          <div class="d-flex align-items-center mb-2 flex-wrap gap-2">
            <h5 class="fw-bold mb-0 me-3" style="color: #121826;">${vacante.titulo_puesto || "Vacante"}</h5>
            <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill fw-medium px-3">${vacante.modalidad || "Modalidad no indicada"}</span>
            <span class="badge bg-light text-dark rounded-pill fw-medium px-3">${vacante.experiencia_nivel || "No especificado"}</span>
          </div>
          <p class="text-secondary fw-medium mb-3">${vacante.nombre_empresa || vacante.nombre_comercial || vacante.empresa || "Empresa confidencial"}</p>

          <div class="d-flex flex-wrap gap-3 small text-muted">
            <div class="d-flex align-items-center">
              <i class="bi bi-geo-alt me-1"></i> ${vacante.nombre_municipio || "El Salvador"}
            </div>
            <div class="d-flex align-items-center">
              <i class="bi bi-cash me-1"></i> ${formatearSalario(vacante)}
            </div>
            <div class="d-flex align-items-center">
              <i class="bi bi-clock me-1"></i> ${formatearFecha(vacante.fecha_publicacion)}
            </div>
          </div>
        </div>
        <div class="col-md-3 text-md-end mt-4 mt-md-0">
          <a href="../detalleempleo/index.html?id=${vacante.id_vacante}" class="btn px-4 py-2 fw-semibold w-100 w-md-auto text-white" style="background-color: var(--primary-deep); border-radius: 30px;">
            Ver detalles <i class="bi bi-arrow-right ms-1"></i>
          </a>
        </div>
      </div>
    </div>
  `;

  const getCheckedValues = (ids) =>
    ids
      .map((id) => document.getElementById(id))
      .filter((input) => input?.checked);

  const obtenerParametrosFiltros = () => {
    const params = new URLSearchParams();
    const query = inputBusqueda?.value.trim();

    if (query) params.set("q", query);

    if (document.getElementById("fecha2")?.checked) params.set("fecha", "24h");
    else if (document.getElementById("fecha3")?.checked) params.set("fecha", "semana");
    else if (document.getElementById("fecha4")?.checked) params.set("fecha", "mes");

    const experiencia = [];
    if (document.getElementById("nivel1")?.checked) experiencia.push("Practicante");
    if (document.getElementById("nivel2")?.checked) experiencia.push("Junior");
    if (document.getElementById("nivel3")?.checked) experiencia.push("Semi-senior");
    if (document.getElementById("nivel4")?.checked) experiencia.push("Senior");
    if (experiencia.length > 0) params.set("experiencia", experiencia.join(","));

    if (document.getElementById("salario1")?.checked) {
      params.set("min", "0");
      params.set("max", "500");
    } else if (document.getElementById("salario2")?.checked) {
      params.set("min", "501");
      params.set("max", "800");
    } else if (document.getElementById("salario3")?.checked) {
      params.set("min", "801");
      params.set("max", "1000");
    } else if (document.getElementById("salario4")?.checked) {
      params.set("min", "1001");
      params.set("max", "1500");
    } else if (document.getElementById("salario5")?.checked) {
      params.set("min", "2000");
    }

    return params;
  };

  const syncUrl = (params) => {
    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  };

  const renderPaginacion = () => {
    if (!paginacionRoot) return;

    const totalPaginas = Math.max(1, Math.ceil(resultadosActuales.length / PAGE_SIZE));
    const paginas = [];

    for (let page = 1; page <= totalPaginas; page += 1) {
      paginas.push(`
        <button class="btn btn-link text-decoration-none p-0 mx-1 page-link-custom ${page === paginaActual ? "page-active" : "text-secondary"}" data-page="${page}">
          ${page}
        </button>
      `);
    }

    paginacionRoot.innerHTML = `
      <button class="btn btn-link text-secondary text-decoration-none small fw-medium" id="btnPaginaAnterior" ${paginaActual === 1 ? "disabled" : ""}>
        <i class="bi bi-arrow-left me-1"></i> Anterior
      </button>
      <div class="d-flex gap-2 align-items-center">${paginas.join("")}</div>
      <button class="btn btn-link text-secondary text-decoration-none small fw-medium" id="btnPaginaSiguiente" ${paginaActual === totalPaginas ? "disabled" : ""}>
        Siguiente <i class="bi bi-arrow-right ms-1"></i>
      </button>
    `;

    document.getElementById("btnPaginaAnterior")?.addEventListener("click", () => {
      if (paginaActual > 1) {
        paginaActual -= 1;
        renderResultadosPaginados();
      }
    });

    document.getElementById("btnPaginaSiguiente")?.addEventListener("click", () => {
      if (paginaActual < totalPaginas) {
        paginaActual += 1;
        renderResultadosPaginados();
      }
    });

    paginacionRoot.querySelectorAll("[data-page]").forEach((button) => {
      button.addEventListener("click", () => {
        paginaActual = Number(button.dataset.page);
        renderResultadosPaginados();
      });
    });
  };

  const renderResultadosPaginados = () => {
    if (!contenedorVacantes) return;

    if (!resultadosActuales.length) {
      contenedorVacantes.innerHTML = `
        <div class="text-center py-5 bg-white rounded-4 border">
          <i class="bi bi-search fs-1 text-muted opacity-50 mb-3 d-block"></i>
          <h5 class="fw-bold text-dark">No encontramos vacantes</h5>
          <p class="text-secondary">Intenta buscar con otras palabras o limpia los filtros laterales.</p>
        </div>
      `;
      renderPaginacion();
      return;
    }

    const inicio = (paginaActual - 1) * PAGE_SIZE;
    const pagina = resultadosActuales.slice(inicio, inicio + PAGE_SIZE);
    contenedorVacantes.innerHTML = pagina.map(tarjetaVacante).join("");
    renderPaginacion();
  };

  const aplicarFiltroLocalModalidad = (vacantes) => {
    const modalidadesSeleccionadas = getCheckedValues(["modalidadRemoto", "modalidadPresencial", "modalidadHibrido"]);

    if (!modalidadesSeleccionadas.length) {
      return vacantes;
    }

    const modalidades = modalidadesSeleccionadas.map((input) => normalizarTexto(input.value));
    return vacantes.filter((vacante) => {
      const modalidadVacante = normalizarTexto(vacante.modalidad || "");
      return modalidades.some((modalidad) => modalidadVacante.includes(modalidad));
    });
  };

  const cargarVacantes = async (params = new URLSearchParams()) => {
    if (!contenedorVacantes) return;

    contenedorVacantes.innerHTML = `
      <div class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-secondary">Buscando vacantes reales...</p>
      </div>
    `;

    try {
      const query = params.toString();
      const url = query ? `${API_URL}/vacantes/busqueda/filtros?${query}` : `${API_URL}/vacantes`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error al consultar la API");

      let vacantes = await response.json();
      vacantes = Array.isArray(vacantes) ? vacantes : [];
      vacantes = aplicarFiltroLocalModalidad(vacantes);
      vacantes = aplicarFiltroLocalFecha(vacantes);

      resultadosActuales = vacantes;
      paginaActual = 1;

      if (textoBarraEstado) {
        if (query) {
          textoBarraEstado.textContent = `Se encontraron ${resultadosActuales.length} resultados con los filtros seleccionados`;
        } else {
          textoBarraEstado.textContent = `Mostrando ${resultadosActuales.length} vacantes disponibles`;
        }
      }

      syncUrl(params);
      renderResultadosPaginados();
    } catch (error) {
      console.error("Error cargando vacantes:", error);
      contenedorVacantes.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-exclamation-triangle text-danger fs-1"></i>
          <p class="text-danger mt-2">Hubo un error al conectar con el servidor.</p>
        </div>
      `;
    }
  };

  const aplicarFiltros = () => {
    const params = obtenerParametrosFiltros();
    cargarVacantes(params);

    const toastElement = document.getElementById("toastFiltros");
    if (toastElement) {
      new bootstrap.Toast(toastElement).show();
    }
  };

  const hidratarDesdeUrl = () => {
    const params = new URLSearchParams(window.location.search);

    if (inputBusqueda && params.has("q")) {
      inputBusqueda.value = params.get("q");
    }

    const fecha = params.get("fecha");
    if (!fecha) document.getElementById("fecha1").checked = true;
    else if (fecha === "24h") document.getElementById("fecha2").checked = true;
    else if (fecha === "semana") document.getElementById("fecha3").checked = true;
    else if (fecha === "mes") document.getElementById("fecha4").checked = true;

    const experiencia = normalizarTexto(params.get("experiencia") || "");
    if (experiencia.includes("practic")) document.getElementById("nivel1").checked = true;
    if (experiencia.includes("junior")) document.getElementById("nivel2").checked = true;
    if (experiencia.includes("semi")) document.getElementById("nivel3").checked = true;
    if (experiencia.includes("senior")) document.getElementById("nivel4").checked = true;

    const min = params.get("min");
    const max = params.get("max");
    if (min === "0" && max === "500") document.getElementById("salario1").checked = true;
    else if (min === "501" && max === "800") document.getElementById("salario2").checked = true;
    else if (min === "801" && max === "1000") document.getElementById("salario3").checked = true;
    else if (min === "1001" && max === "1500") document.getElementById("salario4").checked = true;
    else if (min === "2000") document.getElementById("salario5").checked = true;

    return params;
  };

  const configurarGruposExclusivos = () => {
    [
      ["fecha1", "fecha2", "fecha3", "fecha4"],
      ["salario1", "salario2", "salario3", "salario4", "salario5"]
    ].forEach((group) => {
      group.forEach((id) => {
        const input = document.getElementById(id);
        input?.addEventListener("change", () => {
          if (!input.checked) return;
          group
            .filter((otherId) => otherId !== id)
            .forEach((otherId) => {
              const otherInput = document.getElementById(otherId);
              if (otherInput) otherInput.checked = false;
            });
        });
      });
    });
  };

  btnBuscar?.addEventListener("click", aplicarFiltros);
  inputBusqueda?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      aplicarFiltros();
    }
  });

  btnAplicarFiltros?.addEventListener("click", aplicarFiltros);
  btnAplicarMobile?.addEventListener("click", aplicarFiltros);

  configurarGruposExclusivos();
  const paramsIniciales = hidratarDesdeUrl();
  cargarVacantes(paramsIniciales);
});
