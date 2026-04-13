import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth, logout } from "../../../assets/js/shared/auth.js";

// --- SEGURIDAD ---
// Solo ejecuta la protección si estamos en una zona privada (dashboard)
if (document.getElementById("nombreUsuario")) {
    requireAuth(["usuario"]);
}

// --- REFERENCIAS AL DOM ---
const nombreUsuario = document.getElementById("nombreUsuario");
const totalPostulaciones = document.getElementById("totalPostulaciones");
const totalHabilidades = document.getElementById("totalHabilidades");
const ultimasPostulaciones = document.getElementById("ultimasPostulaciones");
const vacantesRecientes = document.getElementById("vacantesRecientes");
const btnLogout = document.getElementById("btnLogout");
const alertContainer = document.getElementById("alertContainer");

if (btnLogout) btnLogout.addEventListener("click", logout);

// --- UTILIDADES ---
const showAlert = (message, type = "danger") => {
    if (alertContainer) {
        alertContainer.innerHTML = `<div class="alert alert-${type}" role="alert">${message}</div>`;
    }
};

// --- RENDERIZADO DE DASHBOARD ---
const renderPostulaciones = (items) => {
    if (!ultimasPostulaciones) return;
    if (!items || items.length === 0) {
        ultimasPostulaciones.innerHTML = `<div class="text-muted">No hay postulaciones todavía.</div>`;
        return;
    }
    ultimasPostulaciones.innerHTML = items.map(item => `
        <div class="list-group-item-custom">
            <div class="fw-semibold">${item.titulo_puesto}</div>
            <div class="text-muted">${item.nombre_comercial}</div>
            <div class="small mt-1">Estado: ${item.nombre_estado}</div>
        </div>
    `).join("");
};

const renderVacantes = (items) => {
    if (!vacantesRecientes) return;
    if (!items || items.length === 0) {
        vacantesRecientes.innerHTML = `<div class="text-muted">No hay vacantes recientes.</div>`;
        return;
    }
    vacantesRecientes.innerHTML = items.map(item => `
        <div class="list-group-item-custom">
            <div class="fw-semibold">${item.titulo_puesto}</div>
            <div class="text-muted">${item.nombre_comercial}</div>
            <div class="small mt-1">${item.nombre_categoria} · ${item.modalidad}</div>
        </div>
    `).join("");
};

// --- LÓGICA DE CARGA (DASHBOARD) ---
const cargarDashboard = async () => {
    if (!nombreUsuario) return; // Si no hay dashboard, no pedimos estos datos
    try {
        const response = await fetch(`${API_URL}/dashboard/usuario`, {
            headers: { "Authorization": `Bearer ${getToken()}` }
        });
        const data = await response.json();
        if (!response.ok) {
            showAlert(data.mensaje || "No se pudo cargar el dashboard");
            return;
        }
        nombreUsuario.textContent = `${data.usuario.nombres} ${data.usuario.apellidos}`;
        totalPostulaciones.textContent = data.metricas.total_postulaciones ?? 0;
        totalHabilidades.textContent = data.metricas.total_habilidades ?? 0;
        renderPostulaciones(data.ultimasPostulaciones);
        renderVacantes(data.vacantesRecientes);
    } catch (error) {
        console.error(error);
        showAlert("Error de conexión con el servidor");
    }
};

// --- LÓGICA DE CARGA (EMPLEOS DESTACADOS) ---
// Reemplaza los datos random por los de la API manteniendo tu formato de tarjetas
const cargarEmpleosDestacados = async () => {
    const contenedor = document.getElementById('contenedor-destacados');
    if (!contenedor) return;

    try {
        const respuesta = await fetch(`${API_URL}/vacantes`);
        if (!respuesta.ok) throw new Error("Error al obtener vacantes");
        
        const vacantes = await respuesta.json();
        contenedor.innerHTML = ''; // Quitamos el spinner

        // Tomamos las primeras 3 vacantes
        vacantes.slice(0, 3).forEach(item => {
            contenedor.innerHTML += `
                <div class="col-12 col-md-4">
                    <div class="card bg-white border-0 rounded-4 shadow-sm p-4 h-100 position-relative">
                        <div class="position-absolute top-0 end-0 mt-3 me-3">
                            <span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">Nuevo</span>
                        </div>
                        <div class="mb-3">
                            <i class="bi bi-pencil-square display-6 text-dark"></i>
                        </div>
                        <h5 class="fw-bold text-dark mb-2">${item.titulo_puesto}</h5>
                        <ul class="list-unstyled text-dark fs-6 mb-3">
                            <li class="mb-1"><i class="bi bi-building me-2"></i>${item.nombre_comercial}</li>
                            <li class="mb-1"><i class="bi bi-geo-alt me-2"></i>${item.nombre_municipio || 'El Salvador'}</li>
                            <li class="fw-bold"><i class="bi bi-cash me-2"></i>$${item.salario_offrecido}</li>
                        </ul>
                        <div class="d-flex flex-wrap align-items-end justify-content-between gap-3 mt-auto">
                            <div>
                                <span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">${item.modalidad}</span>
                            </div>
                            <button type="button" class="btn btn-primary px-4 py-2 fw-semibold rounded-3" 
                                onclick="window.location.href='../detalleempleo/index.html?id=${item.id_vacante}'">
                                Ver Detalles
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error("Error destacados:", error);
        contenedor.innerHTML = `<div class="text-center text-danger">No se pudieron cargar los empleos.</div>`;
    }
};

// --- INICIO ---
document.addEventListener("DOMContentLoaded", () => {
    cargarDashboard();
    cargarEmpleosDestacados();
});




