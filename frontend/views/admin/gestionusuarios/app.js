import { API_URL, getToken, clearSession } from "../../../assets/js/shared/config.js";

const btnLogout = document.getElementById("btnLogout");
const tablaUsuarios = document.getElementById("tablaUsuarios");
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

const renderUsuarios = (items) => {
  if (!items || items.length === 0) {
    tablaUsuarios.innerHTML = `
      <tr>
        <td colspan="6" class="text-muted">No hay usuarios registrados.</td>
      </tr>
    `;
    return;
  }

  tablaUsuarios.innerHTML = items.map(item => `
    <tr>
      <td>
        <div class="fw-semibold">${item.nombres} ${item.apellidos}</div>
      </td>
      <td>${item.correo_electronico}</td>
      <td>${item.telefono ?? "N/D"}</td>
      <td>${item.id_municipio_fk ?? "N/D"}</td>
      <td class="resumen-cell">${item.resumen_profesional ?? ""}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${item.id_usuario}">
          Eliminar
        </button>
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
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudieron cargar los usuarios");
      return;
    }

    renderUsuarios(data);
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
};

const eliminarUsuario = async (id) => {
  try {
    const response = await fetch(`${API_URL}/admin/usuarios/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudo eliminar el usuario");
      return;
    }

    showAlert("Usuario eliminado correctamente", "success");
    await cargarUsuarios();
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
};

cargarUsuarios();