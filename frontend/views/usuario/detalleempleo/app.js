import { API_URL, getToken, getUsuario } from "../../../assets/js/shared/config.js";
import { requireAuth } from "../../../assets/js/shared/auth.js";

requireAuth(["usuario"]);

const alertContainer = document.getElementById("alertContainer");
const contenedorAccion = document.getElementById("contenedorAccionPrincipal");

const showAlert = (message, type = "danger") => {
  if (!alertContainer) return;

  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
};

const getVacanteId = () => new URLSearchParams(window.location.search).get("id");

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const formatLista = (texto) => {
  if (!texto || texto.trim() === "") {
    return "<li><i class='bi bi-check-circle-fill me-2' style='color: var(--primary-deep);'></i>Informacion no detallada.</li>";
  }

  return texto
    .split(/\n|[.;]\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 2)
    .map((item) => `<li class="mb-2"><i class="bi bi-check-circle-fill me-2" style="color: var(--primary-deep);"></i>${item.replace(/[.;]$/, "")}</li>`)
    .join("");
};

const formatSalary = (value) => {
  if (value === null || value === undefined || value === "") {
    return "A convenir";
  }

  return `$${Number(value).toLocaleString("es-SV", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const inferirContrato = (vacante) => {
  const texto = `${vacante.titulo_puesto || ""} ${vacante.descripcion_puesto || ""} ${vacante.requisitos || ""}`.toLowerCase();
  if (texto.includes("medio tiempo") || texto.includes("part time")) return "Medio tiempo";
  if (texto.includes("freelance") || texto.includes("por proyecto")) return "Freelance";
  if (texto.includes("practica") || texto.includes("pasantia") || texto.includes("becario")) return "Practicas";
  return vacante.modalidad ? `Tiempo completo · ${vacante.modalidad}` : "Tiempo completo";
};

const inferirEducacion = (vacante) => {
  const texto = `${vacante.requisitos || ""} ${vacante.descripcion_puesto || ""}`.toLowerCase();
  const coincidencia = texto.match(/(bachiller|tecnico|licenciatura|ingenieria|maestria)[^.|\n]*/i);
  return coincidencia ? coincidencia[0].trim() : "No especificada";
};

const inferirIdiomas = (vacante) => {
  const texto = `${vacante.requisitos || ""} ${vacante.descripcion_puesto || ""}`.toLowerCase();
  const idiomas = [];
  if (texto.includes("ingles")) idiomas.push("Ingles");
  if (texto.includes("espanol") || texto.includes("español")) idiomas.push("Espanol");
  return idiomas.length ? idiomas.join(", ") : "No especificados";
};

const obtenerSeccionSimilares = () => {
  const headings = [...document.querySelectorAll("h5")];
  const heading = headings.find((item) => item.textContent.toLowerCase().includes("empleos similares"));
  return heading?.nextElementSibling || null;
};

const obtenerCamposDetalle = () => {
  const detallesCard = [...document.querySelectorAll(".sidebar-card")]
    .find((card) => card.textContent.toLowerCase().includes("detalles del empleo"));

  if (!detallesCard) return {};

  const bloques = detallesCard.querySelectorAll(".mb-3, .mb-0");
  return {
    contrato: bloques[0]?.querySelector(".text-secondary"),
    experiencia: bloques[1]?.querySelector(".text-secondary"),
    educacion: bloques[2]?.querySelector(".text-secondary"),
    idiomas: bloques[3]?.querySelector(".text-secondary"),
    modalidad: document.getElementById("vacanteModalidad"),
    fecha: document.getElementById("vacanteFecha")
  };
};

const renderBotonAccion = (yaPostulado, idVacante) => {
  if (yaPostulado) {
    contenedorAccion.innerHTML = `
      <button class="btn btn-success px-4 py-2 fw-bold shadow-sm" style="border-radius: 8px;" disabled>
        Ya te postulaste <i class="bi bi-check-all ms-1"></i>
      </button>
    `;
    return;
  }

  contenedorAccion.innerHTML = `
    <button class="btn btn-primary px-4 py-2 fw-bold shadow-sm" style="border-radius: 8px;" id="btnPostularme">
      Aplicar ahora <i class="bi bi-send ms-1"></i>
    </button>
  `;

  document.getElementById("btnPostularme")?.addEventListener("click", () => realizarPostulacion(idVacante));
};

const renderSimilares = async (idVacante) => {
  const contenedor = obtenerSeccionSimilares();
  if (!contenedor) return;

  try {
    const response = await fetch(`${API_URL}/vacantes/${idVacante}/similares?limit=3`);
    if (!response.ok) throw new Error("No se pudieron cargar vacantes similares");

    const items = await response.json();

    if (!Array.isArray(items) || !items.length) {
      contenedor.innerHTML = `
        <div class="col-12">
          <div class="similar-job-card">
            <p class="text-secondary mb-0">No encontramos vacantes similares por el momento.</p>
          </div>
        </div>
      `;
      return;
    }

    contenedor.innerHTML = items.map((item) => `
      <div class="col-12 col-md-4">
        <div class="similar-job-card d-flex flex-column">
          <h6 class="fw-bold mb-3">${item.titulo_puesto || "Vacante similar"}</h6>
          <ul class="list-unstyled text-secondary small mb-4">
            <li class="mb-1"><i class="bi bi-building me-2"></i>${item.nombre_empresa || item.nombre_comercial || "Empresa"}</li>
            <li class="mb-1"><i class="bi bi-geo-alt me-2"></i>${item.nombre_municipio || "El Salvador"}</li>
            <li class="mb-1"><i class="bi bi-bar-chart-steps me-2"></i>${item.experiencia_nivel || "No especificado"}</li>
            <li class="fw-bold"><i class="bi bi-cash me-2"></i>${formatSalary(item.salario_offrecido)}</li>
          </ul>
          <a class="btn btn-outline-primary w-100 mt-auto rounded-pill py-2 fw-semibold" style="border-color: var(--primary-deep); color: var(--primary-deep);" href="../detalleempleo/index.html?id=${item.id_vacante}">
            Ver detalles
          </a>
        </div>
      </div>
    `).join("");
  } catch (error) {
    console.error(error);
  }
};

const actualizarEstadoGuardado = (guardado) => {
  const icono = document.getElementById("iconoGuardar");
  const texto = document.querySelector("#btnGuardar");

  if (!icono || !texto) return;

  if (guardado) {
    icono.classList.remove("bi-bookmark");
    icono.classList.add("bi-bookmark-fill");
    texto.lastChild.textContent = " Guardado";
    return;
  }

  icono.classList.remove("bi-bookmark-fill");
  icono.classList.add("bi-bookmark");
  texto.lastChild.textContent = " Guardar";
};

const cargarDetalle = async () => {
  const idVacante = getVacanteId();

  if (!idVacante) {
    showAlert("Agrega ?id=1 a la URL para ver un empleo real.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/vacantes/detalle/${idVacante}`, {
      headers: authHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "No se pudo cargar la vacante");
    }

    const vacante = data.vacante;
    const campos = obtenerCamposDetalle();
    const empresaButton = [...document.querySelectorAll(".sidebar-card .btn-outline-primary")]
      .find((item) => item.textContent.toLowerCase().includes("ver perfil de empresa"));

    document.getElementById("vacanteTitulo").textContent = vacante.titulo_puesto || "Vacante";
    document.getElementById("empresaNombre").textContent = vacante.nombre_comercial || "Empresa";
    document.getElementById("vacanteUbicacion").textContent = vacante.nombre_municipio
      ? `${vacante.nombre_municipio}, ${vacante.nombre_departamento || ""}`.replace(/, $/, "")
      : "El Salvador";
    document.getElementById("vacanteSalario").textContent = formatSalary(vacante.salario_offrecido);
    document.getElementById("vacanteDescripcion").textContent = vacante.descripcion_puesto || "Sin descripcion disponible.";
    document.getElementById("vacanteModalidad").textContent = vacante.modalidad || "No especificada";
    document.getElementById("empresaDescripcion").textContent = vacante.descripcion_empresa || "Empresa destacada del sector.";
    document.getElementById("listaResponsabilidades").innerHTML = formatLista(vacante.responsabilidades || vacante.descripcion_puesto);
    document.getElementById("listaRequisitos").innerHTML = formatLista(vacante.requisitos);

    if (vacante.fecha_publicacion) {
      document.getElementById("vacanteFecha").textContent = new Date(vacante.fecha_publicacion).toLocaleDateString("es-SV", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    }

    document.getElementById("badgesContenedor").innerHTML = `
      <span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fw-semibold">${vacante.modalidad || "Presencial"}</span>
      <span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fw-semibold">${vacante.nombre_categoria || "Categoria general"}</span>
      <span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fw-semibold">ID: #VAC-${vacante.id_vacante}</span>
    `;

    if (campos.contrato) campos.contrato.textContent = inferirContrato(vacante);
    if (campos.experiencia) campos.experiencia.textContent = vacante.experiencia_nivel || "No especificada";
    if (campos.educacion) campos.educacion.textContent = inferirEducacion(vacante);
    if (campos.idiomas) campos.idiomas.textContent = inferirIdiomas(vacante);

    if (empresaButton && vacante.id_empresa) {
      empresaButton.href = `../valoracionempresa/index.html?id_empresa=${vacante.id_empresa}`;
    }

    document.getElementById("linkCompartir").value = window.location.href;
    actualizarEstadoGuardado(Boolean(data.yaGuardado));
    renderBotonAccion(data.yaPostulado, vacante.id_vacante);
    await renderSimilares(vacante.id_vacante);
  } catch (error) {
    console.error(error);
    showAlert(error.message || "Error de conexion al cargar la vacante.");
  }
};

const realizarPostulacion = async (idVacante) => {
  try {
    const usuario = getUsuario();

    if (!usuario?.id_usuario) {
      throw new Error("No se encontro una sesion valida para postular.");
    }

    const response = await fetch(`${API_URL}/postulaciones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
      body: JSON.stringify({
        id_usuario_fk: usuario.id_usuario,
        id_vacante_fk: Number(idVacante),
        id_estado_fk: 1
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensaje || "Error al postularse.");
    }

    new bootstrap.Toast(document.getElementById("toastPostulado")).show();
    setTimeout(cargarDetalle, 800);
  } catch (error) {
    console.error(error);
    showAlert(error.message || "No se pudo registrar la postulacion.");
  }
};

const toggleGuardado = async () => {
  const usuario = getUsuario();
  const idVacante = getVacanteId();
  const icono = document.getElementById("iconoGuardar");

  if (!usuario?.id_usuario || !idVacante || !icono) {
    showAlert("No se pudo identificar la vacante que deseas guardar.");
    return;
  }

  const yaGuardado = icono.classList.contains("bi-bookmark-fill");

  try {
    const response = await fetch(`${API_URL}/guardados/${idVacante}`, {
      method: yaGuardado ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
      body: yaGuardado ? undefined : JSON.stringify({ id_vacante_fk: Number(idVacante) })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.mensaje || "No se pudo actualizar el guardado");
    }

    actualizarEstadoGuardado(!yaGuardado);
    if (!yaGuardado) {
      new bootstrap.Toast(document.getElementById("toastGuardado")).show();
    }
  } catch (error) {
    console.error(error);
    showAlert(error.message || "No se pudo actualizar la vacante guardada.");
  }
};

document.getElementById("btnGuardar")?.addEventListener("click", (event) => {
  event.preventDefault();
  toggleGuardado();
});

document.getElementById("btnCopiarEnlace")?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalCompartir"));
    modal?.hide();
    new bootstrap.Toast(document.getElementById("toastCopiado")).show();
  } catch (error) {
    console.error(error);
    showAlert("No se pudo copiar el enlace.");
  }
});

cargarDetalle();
