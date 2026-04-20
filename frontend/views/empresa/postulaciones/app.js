import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth } from "../../../assets/js/shared/auth.js";

requireAuth(["empresa"]);

const contenedorPostulaciones = document.getElementById("contenedorPostulaciones");
const searchInput = document.querySelector(".filter-bar input");
const selectVacante = document.querySelectorAll(".filter-bar select")[0];
const selectEstado = document.querySelectorAll(".filter-bar select")[1];
const sidebarCards = [...document.querySelectorAll(".sidebar-card")];
const inputContactoMensaje = document.getElementById("contactoMensaje");
const btnEnviarMensaje = document.getElementById("btnEnviarMensaje");

let postulaciones = [];
let postulacionSeleccionada = null;

const authHeaders = (withJson = false) => ({
  ...(withJson ? { "Content-Type": "application/json" } : {}),
  Authorization: `Bearer ${getToken()}`
});

const formatearFecha = (fecha) => {
  if (!fecha) return "N/D";
  return new Date(fecha).toLocaleDateString("es-SV");
};

const getEstadoClass = (estadoId) => {
  if (Number(estadoId) === 2) return "bg-primary-subtle text-primary";
  if (Number(estadoId) === 3) return "bg-success text-white";
  if (Number(estadoId) === 4) return "bg-danger text-white";
  if (Number(estadoId) === 5) return "bg-dark text-white";
  return "bg-warning text-dark";
};

const abrirPerfil = (item) => {
  document.getElementById("perfilNombre").textContent = `${item.nombres} ${item.apellidos}`;
  document.getElementById("perfilPuesto").textContent = item.titulo_puesto || "Postulante";
  document.getElementById("perfilCorreo").textContent = item.correo_electronico || "---";
  document.getElementById("perfilTelefono").textContent = item.telefono || "---";
  document.getElementById("perfilResumen").textContent = item.resumen_profesional || "Sin resumen profesional.";

  const modal = new bootstrap.Modal(document.getElementById("modalPerfilCandidato"));
  modal.show();
};

const abrirContacto = (item) => {
  postulacionSeleccionada = item;
  const inputDestino = document.getElementById("contactoDestino");
  if (inputDestino) {
    inputDestino.value = `${item.nombres} ${item.apellidos} (${item.correo_electronico || "sin correo"})`;
  }
  if (inputContactoMensaje) {
    inputContactoMensaje.value = `Hola ${item.nombres}, queremos dar seguimiento a tu postulacion para ${item.titulo_puesto || "esta vacante"}.`;
  }
  const modal = new bootstrap.Modal(document.getElementById("modalContactar"));
  modal.show();
};

const enviarMensaje = async () => {
  if (!postulacionSeleccionada?.id_usuario) {
    throw new Error("No se encontro el usuario para enviar el mensaje.");
  }

  const mensaje = inputContactoMensaje?.value.trim();
  if (!mensaje) {
    throw new Error("Escribe un mensaje antes de enviarlo.");
  }

  const response = await fetch(`${API_URL}/notificaciones`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify({
      tipo_usuario: "usuario",
      id_destinatario: Number(postulacionSeleccionada.id_usuario),
      titulo: `Mensaje de empresa sobre ${postulacionSeleccionada.titulo_puesto || "tu postulacion"}`,
      mensaje,
      tipo_notificacion: "comentario",
      enlace: `/views/usuario/detalleempleo/index.html?id=${postulacionSeleccionada.id_vacante_fk}`
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo enviar el mensaje al usuario.");
  }

  inputContactoMensaje.value = "";
  bootstrap.Modal.getInstance(document.getElementById("modalContactar"))?.hide();
  window.alert("Mensaje enviado correctamente. El usuario ya lo puede ver en sus notificaciones.");
};

const actualizarEstado = async (idPostulacion, nuevoEstadoId) => {
  const response = await fetch(`${API_URL}/postulaciones/${idPostulacion}/estado`, {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify({ id_estado_fk: Number(nuevoEstadoId) })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo actualizar el estado.");
  }

  await cargarLista();
};

const filtrar = () => {
  const texto = (searchInput?.value || "").trim().toLowerCase();
  const vacante = selectVacante?.value || "Todas las vacantes";
  const estado = selectEstado?.value || "Todos los estados";

  return postulaciones.filter((item) => {
    const nombreCompleto = `${item.nombres} ${item.apellidos}`;
    const coincideTexto =
      !texto ||
      [nombreCompleto, item.correo_electronico, item.titulo_puesto]
        .some((value) => String(value || "").toLowerCase().includes(texto));

    const coincideVacante = vacante === "Todas las vacantes" || item.titulo_puesto === vacante;
    const coincideEstado = estado === "Todos los estados" || item.nombre_estado === estado;
    return coincideTexto && coincideVacante && coincideEstado;
  });
};

const renderSidebar = () => {
  const resumenCard = sidebarCards[0];
  const activasCard = sidebarCards[1];
  const recientesCard = sidebarCards[2];

  if (resumenCard) {
    const counts = {
      revision: postulaciones.filter((item) => Number(item.id_estado_fk) === 1 || Number(item.id_estado_fk) === 2).length,
      entrevistas: postulaciones.filter((item) => Number(item.id_estado_fk) === 3).length,
      aprobados: postulaciones.filter((item) => Number(item.id_estado_fk) === 5).length,
      total: postulaciones.length
    };

    const numbers = resumenCard.querySelectorAll(".fw-bold");
    if (numbers[0]) numbers[0].textContent = String(counts.revision);
    if (numbers[1]) numbers[1].textContent = String(counts.entrevistas);
    if (numbers[2]) numbers[2].textContent = String(counts.aprobados);
    const totalNode = resumenCard.querySelector(".fw-bold.fs-5");
    if (totalNode) totalNode.textContent = String(counts.total);
  }

  if (activasCard) {
    const top = Object.values(postulaciones.reduce((acc, item) => {
      const key = item.titulo_puesto || "Vacante";
      if (!acc[key]) acc[key] = { titulo: key, total: 0 };
      acc[key].total += 1;
      return acc;
    }, {})).sort((a, b) => b.total - a.total).slice(0, 3);

    const blocks = activasCard.querySelectorAll(".d-flex.flex-column.gap-3 > div");
    blocks.forEach((block, index) => {
      const item = top[index];
      if (!item) return;
      const labels = block.querySelectorAll(".small.fw-medium span");
      if (labels[0]) labels[0].textContent = item.titulo;
      if (labels[1]) labels[1].textContent = String(item.total);
      const bar = block.querySelector(".progress-bar");
      if (bar) bar.style.width = `${Math.min(100, item.total * 12)}%`;
    });
  }

  if (recientesCard) {
    const root = recientesCard.querySelector(".d-flex.flex-column.gap-3");
    if (!root) return;

    const recientes = postulaciones.slice(0, 3);
    root.innerHTML = recientes.map((item) => {
      const initials = `${item.nombres?.[0] || ""}${item.apellidos?.[0] || ""}`.toUpperCase();
      return `
        <div class="d-flex align-items-center gap-3">
          <div class="avatar-circle" style="width:40px; height:40px; font-size:0.9rem;">${initials}</div>
          <div>
            <span class="fw-semibold d-block">${item.nombres} ${item.apellidos}</span>
            <small class="text-secondary">${formatearFecha(item.fecha_postulacion)}</small>
          </div>
        </div>
      `;
    }).join("") || `<p class="text-muted mb-0">No hay postulantes recientes.</p>`;
  }
};

const renderFiltros = () => {
  const vacantesUnicas = [...new Set(postulaciones.map((item) => item.titulo_puesto).filter(Boolean))];
  const estadosUnicos = [...new Set(postulaciones.map((item) => item.nombre_estado).filter(Boolean))];
  const selectedVacante = selectVacante?.value || "Todas las vacantes";
  const selectedEstado = selectEstado?.value || "Todos los estados";

  if (selectVacante) {
    selectVacante.innerHTML = [
      "<option>Todas las vacantes</option>",
      ...vacantesUnicas.map((item) => `<option>${item}</option>`)
    ].join("");
    selectVacante.value = vacantesUnicas.includes(selectedVacante) ? selectedVacante : "Todas las vacantes";
  }

  if (selectEstado) {
    selectEstado.innerHTML = [
      "<option>Todos los estados</option>",
      ...estadosUnicos.map((item) => `<option>${item}</option>`)
    ].join("");
    selectEstado.value = estadosUnicos.includes(selectedEstado) ? selectedEstado : "Todos los estados";
  }
};

const renderPostulaciones = () => {
  const items = filtrar();

  if (!items.length) {
    contenedorPostulaciones.innerHTML = `<div class="text-center p-5 fw-bold text-muted">No hay postulantes registrados.</div>`;
    return;
  }

  contenedorPostulaciones.innerHTML = items.map((item) => {
    const nombreCompleto = `${item.nombres} ${item.apellidos}`;
    const initials = `${item.nombres?.[0] || ""}${item.apellidos?.[0] || ""}`.toUpperCase();

    return `
      <div class="candidate-card">
        <div class="d-flex align-items-center flex-wrap gap-3">
          <div class="d-flex align-items-center gap-3 flex-grow-1">
            <div class="avatar-circle">${initials}</div>
            <div>
              <h6 class="fw-bold mb-1">${nombreCompleto}</h6>
              <p class="text-secondary small mb-0">${item.correo_electronico || "Sin correo"} · ${item.titulo_puesto || "Vacante"}</p>
            </div>
            <div class="ms-md-4">
              <span class="badge bg-light text-dark px-3 py-2">${item.titulo_puesto}</span>
            </div>
            <div class="ms-auto text-end">
              <select class="form-select form-select-sm rounded-pill fw-bold ${getEstadoClass(item.id_estado_fk)} border-0 shadow-none select-estado" data-id="${item.id_postulacion}">
                <option value="1" ${Number(item.id_estado_fk) === 1 ? "selected" : ""}>Recibida</option>
                <option value="2" ${Number(item.id_estado_fk) === 2 ? "selected" : ""}>En Revisión</option>
                <option value="3" ${Number(item.id_estado_fk) === 3 ? "selected" : ""}>Entrevista</option>
                <option value="4" ${Number(item.id_estado_fk) === 4 ? "selected" : ""}>Rechazada</option>
                <option value="5" ${Number(item.id_estado_fk) === 5 ? "selected" : ""}>Contratado</option>
              </select>
              <p class="text-secondary small mb-0 mt-1">Postulado: ${formatearFecha(item.fecha_postulacion)}</p>
            </div>
          </div>
          <div class="d-flex gap-2">
            <button class="action-btn btn-ver" data-id="${item.id_postulacion}" title="Ver perfil"><i class="bi bi-eye"></i></button>
            <button class="action-btn btn-contactar" data-id="${item.id_postulacion}" title="Contactar"><i class="bi bi-chat-dots"></i></button>
            <a class="action-btn text-decoration-none" href="../detallepostulacion/index.html?id=${item.id_postulacion}" title="Abrir detalle"><i class="bi bi-box-arrow-up-right"></i></a>
          </div>
        </div>
      </div>
    `;
  }).join("");

  contenedorPostulaciones.querySelectorAll(".btn-ver").forEach((button) => {
    button.addEventListener("click", () => {
      const item = postulaciones.find((postulacion) => String(postulacion.id_postulacion) === button.dataset.id);
      if (item) abrirPerfil(item);
    });
  });

  contenedorPostulaciones.querySelectorAll(".btn-contactar").forEach((button) => {
    button.addEventListener("click", () => {
      const item = postulaciones.find((postulacion) => String(postulacion.id_postulacion) === button.dataset.id);
      if (item) abrirContacto(item);
    });
  });

  contenedorPostulaciones.querySelectorAll(".select-estado").forEach((select) => {
    select.addEventListener("change", async () => {
      try {
        await actualizarEstado(select.dataset.id, select.value);
      } catch (error) {
        console.error(error);
        window.alert(error.message);
      }
    });
  });
};

const cargarLista = async () => {
  const response = await fetch(`${API_URL}/empresa/postulaciones`, {
    headers: authHeaders()
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudieron cargar las postulaciones.");
  }

  postulaciones = Array.isArray(data) ? data : [];
  renderFiltros();
  renderSidebar();
  renderPostulaciones();
};

searchInput?.addEventListener("input", renderPostulaciones);
selectVacante?.addEventListener("change", renderPostulaciones);
selectEstado?.addEventListener("change", renderPostulaciones);
btnEnviarMensaje?.addEventListener("click", async () => {
  try {
    await enviarMensaje();
  } catch (error) {
    console.error(error);
    window.alert(error.message);
  }
});

cargarLista().catch((error) => {
  console.error(error);
  contenedorPostulaciones.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
});
