import { API_URL, getToken, getUsuario } from "../../../assets/js/shared/config.js";
const contenedor = document.getElementById("contenedor-vacantes");

const cargarVacantes = async () => {
    try {
        // Asegúrate de que la ruta coincida con tu backend (ej. /vacantes)
        const response = await fetch(`${API_URL}/vacantes`); 
        const vacantes = await response.json();

        if (vacantes.length === 0) {
            contenedor.innerHTML = `
                <div class="alert alert-info border-0 rounded-4 text-center p-5">
                    No hay vacantes disponibles que coincidan con tu búsqueda.
                </div>`;
            return;
        }

        renderizarTarjetas(vacantes);
    } catch (error) {
        console.error("Error al conectar:", error);
        contenedor.innerHTML = "<p class='text-center py-5'>Error al cargar vacantes. Verifica que el servidor esté activo.</p>";
    }
};

const renderizarTarjetas = (vacantes) => {
    contenedor.innerHTML = ""; // Esto quita el spinner de carga
    vacantes.forEach(item => {
        contenedor.innerHTML += `
            <div class="card bg-white border-0 rounded-4 shadow-sm p-4 mb-4">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-pencil-square fs-2 text-dark me-3"></i>
                        <div>
                            <h5 class="fw-bold text-dark mb-0">${item.titulo_puesto}</h5>
                        </div>
                    </div>
                    <span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">Nuevo</span>
                </div>

                <div class="ms-5 ps-2">
                    <ul class="list-unstyled d-flex gap-4 text-secondary mb-3 small">
                        <li><i class="bi bi-building me-2"></i>${item.nombre_comercial}</li>
                        <li><i class="bi bi-geo-alt me-2"></i>${item.nombre_municipio || 'El Salvador'}</li>
                        <li class="fw-bold text-dark"><i class="bi bi-cash me-2"></i>$${item.salario_offrecido}</li>
                    </ul>

                    <p class="text-muted small mb-3">
                        ${item.descripcion_puesto ? item.descripcion_puesto.substring(0, 150) + '...' : 'Sin descripción.'}
                    </p>

                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <span class="badge bg-primary-subtle text-primary rounded-pill px-3">${item.nombre_categoria || 'Tecnología'}</span>
                        <a href="../detalleempleo/index.html?id=${item.id_vacante}" class="btn btn-primary px-4 py-2 fw-semibold rounded-3">
                            Ver Detalles
                        </a>
                    </div>
                </div>
            </div>`;
    });
};

document.addEventListener("DOMContentLoaded", cargarVacantes);