import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth } from "../../../assets/js/shared/auth.js";

requireAuth(["admin"]);

const alertContainer = document.getElementById("alertContainer");
const tablaEmpresas = document.getElementById("tablaEmpresas");
const filtroEmpresa = document.getElementById("filtroEmpresa");
const btnFiltrar = document.getElementById("btnFiltrar");

const resumenTotal = document.getElementById("resumenTotal");
const resumenWeb = document.getElementById("resumenWeb");
const resumenSinWeb = document.getElementById("resumenSinWeb");
const actividadEmpresas = document.getElementById("actividadEmpresas");

let empresasGlobal = [];

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

const renderResumen = (empresas) => {
  if (resumenTotal) resumenTotal.textContent = empresas.length;
  if (resumenWeb) resumenWeb.textContent = empresas.filter(x => (x.sitio_web || "").trim() !== "").length;
  if (resumenSinWeb) resumenSinWeb.textContent = empresas.filter(x => !(x.sitio_web || "").trim()).length;
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

  tablaEmpresas.innerHTML = empresas.map(item => `
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
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm fw-bold px-3 btn-eliminar text-white" data-id="${item.id_empresa}" style="background-color:#dc3545; border-radius: 6px;">
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  `).join("");

  document.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const confirmado = confirm("¿Seguro que deseas eliminar esta empresa?");
      if (confirmado) {
        await eliminarEmpresa(id);
      }
    });
  });
};

const cargarEmpresas = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/empresas`, {
      headers: authHeaders()
    });

    let data = [];
    try {
      data = await response.json();
    } catch {
      data = [];
    }

    if (response.status === 401 || response.status === 403) {
      clearSession?.();
      window.location.href = "../../public/login/index.html";
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
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor.");
  }
};

const eliminarEmpresa = async (id) => {
  try {
    const response = await fetch(`${API_URL}/admin/empresas/${id}`, {
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
      clearSession?.();
      window.location.href = "../../public/login/index.html";
      return;
    }

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudo eliminar la empresa.");
      return;
    }

    showAlert("Empresa eliminada correctamente.", "success");
    await cargarEmpresas();
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor.");
  }
};

const aplicarFiltro = () => {
  const texto = (filtroEmpresa?.value || "").trim().toLowerCase();

  if (!texto) {
    renderEmpresas(empresasGlobal);
    renderResumen(empresasGlobal);
    renderActividad(empresasGlobal);
    return;
  }

  const filtradas = empresasGlobal.filter(item =>
    (item.nombre_comercial || "").toLowerCase().includes(texto) ||
    (item.correo_electronico || "").toLowerCase().includes(texto) ||
    (item.razon_social || "").toLowerCase().includes(texto)
  );

  renderEmpresas(filtradas);
  renderResumen(filtradas);
  renderActividad(filtradas);
};

btnFiltrar?.addEventListener("click", aplicarFiltro);
filtroEmpresa?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") aplicarFiltro();
});

cargarEmpresas();