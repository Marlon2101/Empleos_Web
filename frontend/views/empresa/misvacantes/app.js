import { API_URL } from "../../../assets/js/shared/config.js";


// import { requireAuth, logout } from "../../../assets/js/shared/auth.js";
// requireAuth(["empresa"]);

const contenedorVacantes = document.getElementById("contenedorVacantes");

const formatearFecha = (fecha) => {
    if (!fecha) return "Reciente";
    const opciones = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(fecha).toLocaleDateString("es-SV", opciones);
};

const renderVacantes = (items) => {
    if (!items || items.length === 0) {
        contenedorVacantes.innerHTML = `
            <div class="alert alert-light border text-center p-5 rounded-4 text-muted fw-bold">
                Todavía no has publicado vacantes. ¡Publica tu primera vacante!
            </div>
        `;
        return;
    }


    contenedorVacantes.innerHTML = items.map(item => `
        <div class="card bg-white border-0 shadow-sm rounded-4 mb-4 position-relative hover-shadow transition-all cursor-pointer">
            <div class="card-body p-4 p-md-5">
                <div class="row align-items-center g-3">
                    <div class="col-12 col-md-6">
                        <a href="../postulaciones/index.html" class="text-decoration-none stretched-link">
                            <h4 class="fw-bold text-dark mb-3">${item.titulo_puesto}</h4>
                        </a>
                        <p class="text-dark fw-bold small mb-2">Contrato: ${item.modalidad}</p>
                        <p class="text-primary fw-bold small mb-0">
                            <i class="bi bi-person-lines-fill me-1"></i> 0 Postulantes nuevos
                        </p>
                    </div>
                    <div class="col-6 col-md-3 text-md-center">
                        <span class="badge bg-success rounded-pill px-4 py-2 fs-6 shadow-sm">Activa</span>
                    </div>
                    <div class="col-6 col-md-3 text-md-center">
                        <span class="text-dark fw-bold small">${formatearFecha(item.fecha_creacion || item.fecha_publicacion)}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join("");
};

const cargarMisVacantes = async () => {
    try {
        const idEmpresaBypass = 1;

        const response = await fetch(`${API_URL}/vacantes/empresa/${idEmpresaBypass}`);
        const data = await response.json();

        if (!response.ok) {
            console.error(data.mensaje || "Error al cargar las vacantes");
            contenedorVacantes.innerHTML = `<div class="alert alert-danger">Error al cargar las vacantes.</div>`;
            return;
        }

        renderVacantes(data);

    } catch (error) {
        console.error(error);
        contenedorVacantes.innerHTML = `<div class="alert alert-danger">Error de conexión con el servidor.</div>`;
    }
};

cargarMisVacantes();

window.eliminarVacante = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar esta vacante?")) return;
    try {
        const res = await fetch(`${API_URL}/vacantes/${id}`, { method: "DELETE" });
        if (res.ok) {
            cargarMisVacantes(); 
        }
    } catch (error) {
        alert("Error al eliminar");
    }
};