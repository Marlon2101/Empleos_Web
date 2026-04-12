import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth, logout } from "../../../assets/js/shared/auth.js";

requireAuth(["empresa"]);

const btnLogout = document.getElementById("btnLogout");
const tablaPostulaciones = document.getElementById("tablaPostulaciones");
const alertContainer = document.getElementById("alertContainer");

btnLogout.addEventListener("click", logout);

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

const badgeEstado = (estado) => {
  const map = {
    "Recibida": "secondary",
    "En Revisión": "info",
    "Entrevista": "warning",
    "Rechazada": "danger",
    "Contratado": "success"
  };

  const color = map[estado] || "secondary";
  return `<span class="badge text-bg-${color} badge-estado">${estado}</span>`;
};

const renderPostulaciones = (items) => {
  if (!items || items.length === 0) {
    tablaPostulaciones.innerHTML = `
      <tr>
        <td colspan="6" class="text-muted">No hay postulaciones registradas.</td>
      </tr>
    `;
    return;
  }

  tablaPostulaciones.innerHTML = items.map(item => `
    <tr>
      <td>
        <div class="fw-semibold">${item.nombres} ${item.apellidos}</div>
        <div class="small text-muted">${item.resumen_profesional ?? ""}</div>
      </td>
      <td>
        <div>${item.correo_electronico}</div>
        <div class="small text-muted">${item.telefono ?? ""}</div>
      </td>
      <td>${item.titulo_puesto}</td>
      <td>${badgeEstado(item.nombre_estado)}</td>
      <td>${formatearFecha(item.fecha_postulacion)}</td>
      <td>
        <a href="./detalle.html?id=${item.id_postulacion}" class="btn btn-sm btn-outline-primary">
          Ver detalle
        </a>
      </td>
    </tr>
  `).join("");
};

const cargarPostulaciones = async () => {
  try {
    const response = await fetch(`${API_URL}/empresa/postulaciones`, {
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudieron cargar las postulaciones");
      return;
    }

    renderPostulaciones(data);
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
};

cargarPostulaciones();