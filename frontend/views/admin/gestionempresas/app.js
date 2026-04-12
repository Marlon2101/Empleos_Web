import { API_URL, getToken, clearSession } from "../../../assets/js/shared/config.js";

const btnLogout = document.getElementById("btnLogout");
const tablaEmpresas = document.getElementById("tablaEmpresas");
const alertContainer = document.getElementById("alertContainer");

const requireAdmin = () => {
  const token = localStorage.getItem("token");
  const tipo = localStorage.getItem("tipo");

  if (!token || tipo !== "admin") {
    window.location.href = "../../public/login/index.html";
  }
};

requireAdmin();

btnLogout.addEventListener("click", () => {
  clearSession();
  window.location.href = "../../public/login/index.html";
});

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
};

const renderEmpresas = (items) => {
  if (!items || items.length === 0) {
    tablaEmpresas.innerHTML = `
      <tr>
        <td colspan="6" class="text-muted">No hay empresas registradas.</td>
      </tr>
    `;
    return;
  }

  tablaEmpresas.innerHTML = items.map(item => `
    <tr>
      <td>
        <div class="fw-semibold">${item.nombre_comercial}</div>
        <div class="small text-muted">${item.razon_social ?? ""}</div>
      </td>
      <td>${item.correo_electronico ?? "N/D"}</td>
      <td>${item.sitio_web ?? "N/D"}</td>
      <td>${item.id_municipio_fk ?? "N/D"}</td>
      <td class="descripcion-cell">${item.descripcion_empresa ?? ""}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${item.id_empresa}">
          Eliminar
        </button>
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
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudieron cargar las empresas");
      return;
    }

    renderEmpresas(data);
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
};

const eliminarEmpresa = async (id) => {
  try {
    const response = await fetch(`${API_URL}/admin/empresas/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudo eliminar la empresa");
      return;
    }

    showAlert("Empresa eliminada correctamente", "success");
    await cargarEmpresas();
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
};

cargarEmpresas();