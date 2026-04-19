import { API_URL, getToken, clearSession } from "../../../assets/js/shared/config.js";
import { requireAuth } from "../../../assets/js/shared/auth.js";

requireAuth(["admin"]);

const alertContainer = document.getElementById("alertContainer");
const tablaEmpresas = document.getElementById("tablaEmpresas");
const filtroEmpresa = document.getElementById("filtroEmpresa");
const btnFiltrar = document.getElementById("btnFiltrar");
const btnNuevaEmpresa = document.getElementById("btnNuevaEmpresa");
const btnGuardarEmpresa = document.getElementById("btnGuardarEmpresa");
const resumenTotal = document.getElementById("resumenTotal");
const resumenWeb = document.getElementById("resumenWeb");
const resumenSinWeb = document.getElementById("resumenSinWeb");
const actividadEmpresas = document.getElementById("actividadEmpresas");
const selectMunicipio = document.getElementById("empresaMunicipio");

let empresasGlobal = [];

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  "Content-Type": "application/json"
});

const redirectToLogin = () => {
  clearSession();
  window.location.href = "../../public/login/index.html";
};

const showAlert = (message, type = "danger") => {
  if (!alertContainer) return;
  alertContainer.innerHTML = `
    <div class="alert alert-${type} rounded-4" role="alert">
      ${message}
    </div>
  `;
};

const renderResumen = (empresas) => {
  if (resumenTotal) resumenTotal.textContent = empresas.length;
  if (resumenWeb) resumenWeb.textContent = empresas.filter((item) => (item.sitio_web || "").trim() !== "").length;
  if (resumenSinWeb) resumenSinWeb.textContent = empresas.filter((item) => !(item.sitio_web || "").trim()).length;
};

const renderActividad = (empresas) => {
  if (!actividadEmpresas) return;

  const top = empresas.slice(0, 3);
  if (!top.length) {
    actividadEmpresas.innerHTML = `
      <div class="p-3 rounded-4 bg-light border-start border-4 border-primary text-muted">
        No hay actividad disponible.
      </div>
    `;
    return;
  }

  actividadEmpresas.innerHTML = top.map((empresa, index) => `
    <div class="p-3 rounded-4 bg-light border-start border-4 ${index === 0 ? "border-primary" : index === 1 ? "border-success" : "border-warning"}">
      <div class="d-flex justify-content-between align-items-center">
        <h6 class="fw-bold mb-1">${empresa.nombre_comercial || "Empresa"}</h6>
        <small class="text-muted">Registro reciente</small>
      </div>
      <p class="small mb-0 text-muted">${empresa.correo_electronico || "Sin correo"}${empresa.sitio_web ? " · " + empresa.sitio_web : ""}</p>
    </div>
  `).join("");
};

const renderEmpresas = (empresas) => {
  if (!tablaEmpresas) return;

  if (!empresas.length) {
    tablaEmpresas.innerHTML = `
      <tr>
        <td colspan="5" class="text-muted">No hay empresas registradas.</td>
      </tr>
    `;
    return;
  }

  tablaEmpresas.innerHTML = empresas.map((item) => `
    <tr>
      <td>
        <div class="d-flex align-items-center">
          <i class="bi bi-building empresa-row-icon me-2"></i>
          <div>
            <div class="fw-bold">${item.nombre_comercial || "N/D"}</div>
            <div class="small text-muted">${item.razon_social || ""}</div>
          </div>
        </div>
      </td>
      <td>${item.correo_electronico || "N/D"}</td>
      <td>${item.sitio_web || "N/D"}</td>
      <td>${item.nombre_municipio || item.id_municipio_fk || "N/D"}</td>
      <td>
        <button class="btn btn-sm fw-bold px-3 btn-eliminar text-white" data-id="${item.id_empresa}" style="background-color:#dc3545; border-radius: 6px;">
          Eliminar
        </button>
      </td>
    </tr>
  `).join("");

  tablaEmpresas.querySelectorAll(".btn-eliminar").forEach((button) => {
    button.addEventListener("click", async () => {
      if (window.confirm("¿Seguro que deseas eliminar esta empresa?")) {
        await eliminarEmpresa(button.dataset.id);
      }
    });
  });
};

const cargarMunicipios = async () => {
  if (!selectMunicipio) return;

  const response = await fetch(`${API_URL}/catalogos/municipios-agrupados`);
  const municipios = response.ok ? await response.json() : [];

  selectMunicipio.innerHTML = `<option value="">Selecciona un municipio</option>${municipios.map((item) => `
    <option value="${item.id_municipio}">${item.nombre_departamento} - ${item.nombre_municipio}</option>
  `).join("")}`;
};

const cargarEmpresas = async () => {
  const response = await fetch(`${API_URL}/admin/empresas`, {
    headers: authHeaders()
  });

  let data = [];
  try {
    data = await response.json();
  } catch {}

  if (response.status === 401 || response.status === 403) {
    redirectToLogin();
    return;
  }

  if (!response.ok) {
    showAlert(data.mensaje || "No se pudieron cargar las empresas.");
    return;
  }

  empresasGlobal = Array.isArray(data) ? data : [];
  renderEmpresas(empresasGlobal);
  renderResumen(empresasGlobal);
  renderActividad(empresasGlobal);
};

const eliminarEmpresa = async (id) => {
  const response = await fetch(`${API_URL}/admin/empresas/${id}`, {
    method: "DELETE",
    headers: authHeaders()
  });

  let data = {};
  try {
    data = await response.json();
  } catch {}

  if (response.status === 401 || response.status === 403) {
    redirectToLogin();
    return;
  }

  if (!response.ok) {
    showAlert(data.mensaje || "No se pudo eliminar la empresa.");
    return;
  }

  showAlert("Empresa eliminada correctamente.", "success");
  await cargarEmpresas();
};

const aplicarFiltro = () => {
  const texto = (filtroEmpresa?.value || "").trim().toLowerCase();

  if (!texto) {
    renderEmpresas(empresasGlobal);
    renderResumen(empresasGlobal);
    renderActividad(empresasGlobal);
    return;
  }

  const filtradas = empresasGlobal.filter((item) =>
    (item.nombre_comercial || "").toLowerCase().includes(texto) ||
    (item.correo_electronico || "").toLowerCase().includes(texto) ||
    (item.razon_social || "").toLowerCase().includes(texto)
  );

  renderEmpresas(filtradas);
  renderResumen(filtradas);
  renderActividad(filtradas);
};

const limpiarFormulario = () => {
  document.getElementById("formEmpresa").reset();
};

const guardarEmpresa = async () => {
  const payload = {
    nombre_comercial: document.getElementById("empresaNombreComercial").value.trim(),
    razon_social: document.getElementById("empresaRazonSocial").value.trim(),
    correo_electronico: document.getElementById("empresaCorreo").value.trim(),
    sitio_web: document.getElementById("empresaSitioWeb").value.trim(),
    descripcion_empresa: document.getElementById("empresaDescripcion").value.trim(),
    id_municipio_fk: document.getElementById("empresaMunicipio").value,
    contrasena: document.getElementById("empresaContrasena").value.trim()
  };

  if (!payload.nombre_comercial || !payload.correo_electronico || !payload.contrasena) {
    showAlert("Completa nombre comercial, correo y contraseña.", "warning");
    return;
  }

  const response = await fetch(`${API_URL}/admin/empresas`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });

  let data = {};
  try {
    data = await response.json();
  } catch {}

  if (response.status === 401 || response.status === 403) {
    redirectToLogin();
    return;
  }

  if (!response.ok) {
    showAlert(data.mensaje || "No se pudo crear la empresa.");
    return;
  }

  showAlert("Empresa creada correctamente.", "success");
  bootstrap.Modal.getInstance(document.getElementById("modalEmpresa"))?.hide();
  limpiarFormulario();
  await cargarEmpresas();
};

btnFiltrar?.addEventListener("click", aplicarFiltro);
filtroEmpresa?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") aplicarFiltro();
});
btnNuevaEmpresa?.addEventListener("click", limpiarFormulario);
btnGuardarEmpresa?.addEventListener("click", guardarEmpresa);

await cargarMunicipios();
await cargarEmpresas();
