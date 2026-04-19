import { API_URL, getToken, getUsuario } from "../../../assets/js/shared/config.js";
import { requireAuth } from "../../../assets/js/shared/auth.js";

requireAuth(["usuario"]);

const alertContainer = document.getElementById("alertContainer");
const contenedorAccion = document.getElementById("contenedorAccionPrincipal");

const showAlert = (message, type = "danger") => {
  if (!alertContainer) {
    return;
  }

  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
};

const getVacanteId = () => new URLSearchParams(window.location.search).get("id");

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`
});

const formatLista = (texto) => {
  if (!texto || texto.trim() === "") {
    return "<li>Informacion no detallada.</li>";
  }

  return texto
    .split(".")
    .filter((item) => item.trim().length > 3)
    .map((item) => `<li>${item.trim()}.</li>`)
    .join("");
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

  document.getElementById("btnPostularme").addEventListener("click", () => realizarPostulacion(idVacante));
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

    document.getElementById("vacanteTitulo").textContent = vacante.titulo_puesto;
    document.getElementById("empresaNombre").textContent = vacante.nombre_comercial;
    document.getElementById("vacanteUbicacion").textContent = vacante.nombre_municipio
      ? `${vacante.nombre_municipio}, ${vacante.nombre_departamento}`
      : "El Salvador";
    document.getElementById("vacanteSalario").textContent = vacante.salario_offrecido
      ? `$${Number(vacante.salario_offrecido).toLocaleString()}`
      : "A convenir";
    document.getElementById("vacanteDescripcion").textContent = vacante.descripcion_puesto;
    document.getElementById("vacanteModalidad").textContent = vacante.modalidad || "No especificada";
    document.getElementById("empresaDescripcion").textContent = vacante.descripcion_empresa || "Empresa destacada del sector.";
    document.getElementById("listaResponsabilidades").innerHTML = formatLista(vacante.responsabilidades);
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
      <span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fw-semibold">ID: #VAC-${vacante.id_vacante}</span>
    `;

    renderBotonAccion(data.yaPostulado, vacante.id_vacante);
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
    setTimeout(cargarDetalle, 1200);
  } catch (error) {
    console.error(error);
    showAlert(error.message || "No se pudo registrar la postulacion.");
  }
};

document.getElementById("btnGuardar")?.addEventListener("click", (event) => {
  event.preventDefault();
  const icono = document.getElementById("iconoGuardar");

  if (icono.classList.contains("bi-bookmark")) {
    icono.classList.replace("bi-bookmark", "bi-bookmark-fill");
    new bootstrap.Toast(document.getElementById("toastGuardado")).show();
    return;
  }

  icono.classList.replace("bi-bookmark-fill", "bi-bookmark");
});

document.getElementById("btnCopiarEnlace")?.addEventListener("click", async () => {
  const link = window.location.href;
  await navigator.clipboard.writeText(link);
  const modal = bootstrap.Modal.getInstance(document.getElementById("modalCompartir"));
  if (modal) {
    modal.hide();
  }
  new bootstrap.Toast(document.getElementById("toastCopiado")).show();
});

cargarDetalle();

