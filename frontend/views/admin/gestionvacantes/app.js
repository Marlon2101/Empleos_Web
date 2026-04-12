import { API_URL, getToken, clearSession } from "../../../assets/js/shared/config.js";

const btnLogout = document.getElementById("btnLogout");
const tablaVacantes = document.getElementById("tablaVacantes");
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

const formatearFecha = (fecha) => {
  if (!fecha) return "N/D";
  return new Date(fecha).toLocaleDateString("es-SV");
};

const renderVacantes = (items) => {
  if (!items || items.length === 0) {
    tablaVacantes.innerHTML = `
      <tr>
        <td colspan="7" class="text-muted">No hay vacantes registradas.</td>
      </tr>
    `;
    return;
  }

  tablaVacantes.innerHTML = items.map(item => `
    <tr>
      <td class="puesto-cell">
        <div class="fw-semibold">${item.titulo_puesto}</div>
      </td>
      <td>${item.nombre_comercial}</td>
      <td>${item.nombre_categoria}</td>
      <td>${item.modalidad ?? "N/D"}</td>
      <td>$${Number(item.salario_offrecido ?? 0).toFixed(2)}</td>
      <td>${formatearFecha(item.fecha_publicacion)}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${item.id_vacante}">
          Eliminar
        </button>
      </td>
    </tr>
  `).join("");

  document.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const confirmado = confirm("¿Seguro que deseas eliminar esta vacante?");
      if (confirmado) {
        await eliminarVacante(id);
      }
    });
  });
};

const cargarVacantes = async () => {
  try {
    const response = await fetch(`${API_URL}/admin/vacantes`, {
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudieron cargar las vacantes");
      return;
    }

    renderVacantes(data);
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
};

const eliminarVacante = async (id) => {
  try {
    const response = await fetch(`${API_URL}/admin/vacantes/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudo eliminar la vacante");
      return;
    }

    showAlert("Vacante eliminada correctamente", "success");
    await cargarVacantes();
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
};

cargarVacantes();