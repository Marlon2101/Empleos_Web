import { API_URL, getToken, clearSession } from "../../../assets/js/shared/config.js";

const alertContainer = document.getElementById("alertContainer");
const tablaUsuarios = document.getElementById("tablaUsuarios");
const filtroUsuario = document.getElementById("filtroUsuario");
const btnFiltrar = document.getElementById("btnFiltrar");

const resumenTotal = document.getElementById("resumenTotal");
const resumenTelefono = document.getElementById("resumenTelefono");
const resumenSinTelefono = document.getElementById("resumenSinTelefono");
const actividadUsuarios = document.getElementById("actividadUsuarios");

let usuariosGlobal = [];

const requireAdmin = () => {
  const token = getToken();
  const tipo = localStorage.getItem("tipo");

  if (!token || tipo !== "admin") {
    if (typeof clearSession === "function") {
      clearSession();
    }
    window.location.href = "../../public/login/index.html";
  }
};

requireAdmin();

const showAlert = (message, type = "danger") => {
  if (!alertContainer) return;

  alertContainer.innerHTML = `
    <div class="alert alert-${type} rounded-4" role="alert">
      ${message}
    </div>
  `;
};

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json"
});

const renderResumen = (usuarios) => {
  if (resumenTotal) {
    resumenTotal.textContent = usuarios.length;
  }

  if (resumenTelefono) {
    resumenTelefono.textContent = usuarios.filter(x => (x.telefono || "").trim() !== "").length;
  }

  if (resumenSinTelefono) {
    resumenSinTelefono.textContent = usuarios.filter(x => !(x.telefono || "").trim()).length;
  }
};

const renderActividad = (usuarios) => {
  if (!actividadUsuarios) return;

  const top = usuarios.slice(0, 3);

  if (!top.length) {
    actividadUsuarios.innerHTML = `
      <div class="p-3 rounded-4 bg-light border-start border-4 border-primary text-muted">
        No hay actividad disponible.
      </div>
    `;
    return;
  }

  actividadUsuarios.innerHTML = top.map((usuario, index) => `
    <div class="p-3 rounded-4 bg-light border-start border-4 ${
      index === 0 ? "border-primary" : index === 1 ? "border-success" : "border-warning"
    }">
      <div class="d-flex justify-content-between align-items-center">
        <h6 class="fw-bold mb-1">${usuario.nombres || ""} ${usuario.apellidos || ""}</h6>
        <small class="text-muted">Registro reciente</small>
      </div>
      <p class="small mb-0 text-muted">
        ${usuario.correo_electronico || "Sin correo"}${usuario.telefono ? " · " + usuario.telefono : ""}
      </p>
    </div>
  `).join("");
};

const renderUsuarios = (usuarios) => {
  if (!tablaUsuarios) return;

  if (!usuarios.length) {
    tablaUsuarios.innerHTML = `
      <tr>
        <td colspan="5" class="text-muted">No hay usuarios registrados.</td>
      </tr>
    `;
    return;
  }

  tablaUsuarios.innerHTML = usuarios.map(item => `
    <tr>
      <td>
        <div class="d-flex align-items-center">
          <i class="bi bi-person-circle fs-3 me-2 text-secondary"></i>
          <div>
            <div class="fw-bold">${item.nombres || ""} ${item.apellidos || ""}</div>
            <div class="small text-muted">${item.resumen_profesional || ""}</div>
          </div>
        </div>
      </td>
      <td>${item.correo_electronico || "N/D"}</td>
      <td>${item.telefono || "N/D"}</td>
      <td>${item.nombre_municipio || item.id_municipio_fk || "N/D"}</td>
      <td>
        <div class="d-flex align-items-center gap-2">
          <button
            class="btn btn-sm text-white fw-bold px-3 btn-eliminar"
            data-id="${item.id_usuario}"
            style="background-color:#dc3545; border-radius: 6px;"
          >
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  `).join("");

  document.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const confirmado = confirm("¿Seguro que deseas eliminar este usuario?");
      if (confirmado) {
        await eliminarUsuario(id);
      }
    });
  });
};

const cargarUsuarios = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/usuarios`, {
      headers: authHeaders()
    });

    let data = [];
    try {
      data = await response.json();
    } catch {
      data = [];
    }

    if (response.status === 401 || response.status === 403) {
      if (typeof clearSession === "function") {
        clearSession();
      }
      window.location.href = "../../public/login/index.html";
      return;
    }

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudieron cargar los usuarios.");
      return;
    }

    usuariosGlobal = Array.isArray(data) ? data : [];
    renderUsuarios(usuariosGlobal);
    renderResumen(usuariosGlobal);
    renderActividad(usuariosGlobal);
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor.");
  }
};

const eliminarUsuario = async (id) => {
  try {
    const response = await fetch(`${API_URL}/admin/usuarios/${id}`, {
      method: "DELETE",
      headers: authHeaders()
    });

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (response.status === 401 || response.status === 403) {
      if (typeof clearSession === "function") {
        clearSession();
      }
      window.location.href = "../../public/login/index.html";
      return;
    }

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudo eliminar el usuario.");
      return;
    }

    showAlert("Usuario eliminado correctamente.", "success");
    await cargarUsuarios();
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor.");
  }
};

const aplicarFiltro = () => {
  const texto = (filtroUsuario?.value || "").trim().toLowerCase();

  if (!texto) {
    renderUsuarios(usuariosGlobal);
    renderResumen(usuariosGlobal);
    renderActividad(usuariosGlobal);
    return;
  }

  const filtrados = usuariosGlobal.filter(item =>
    `${item.nombres || ""} ${item.apellidos || ""}`.toLowerCase().includes(texto) ||
    (item.correo_electronico || "").toLowerCase().includes(texto)
  );

  renderUsuarios(filtrados);
  renderResumen(filtrados);
  renderActividad(filtrados);
};

btnFiltrar?.addEventListener("click", aplicarFiltro);

filtroUsuario?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    aplicarFiltro();
  }
});

cargarUsuarios();