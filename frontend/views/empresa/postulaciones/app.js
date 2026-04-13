import { API_URL } from "../../../assets/js/shared/config.js";

// ❌ BYPASS: Comentamos la seguridad temporalmente para hacer pruebas rápidas
// import { requireAuth, logout } from "../../../assets/js/shared/auth.js";
// requireAuth(["empresa"]);

const contenedorPostulaciones = document.getElementById("contenedorPostulaciones");

const formatearFecha = (fecha) => {
    if (!fecha) return "N/D";
    return new Date(fecha).toLocaleDateString("es-SV");
};

// --- ⚙️ FUNCIÓN PARA CAMBIAR EL ESTADO ---
window.actualizarEstado = async (idPostulacion, nuevoEstadoId) => {
    try {
        console.log(`Enviando cambio: Postulación ${idPostulacion} -> Estado ${nuevoEstadoId}`);
        
        // Esta es la ruta que tu Node.js debe tener para recibir la actualización
        const response = await fetch(`${API_URL}/postulaciones/${idPostulacion}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_estado_fk: parseInt(nuevoEstadoId) })
        });

        if (response.ok) {
            alert("¡Estado del candidato actualizado correctamente!");
        } else {
            alert("Error al actualizar el estado. Verifica la consola de Node.js.");
        }
    } catch (error) {
        console.error("Error al hacer el PUT:", error);
        alert("Error de conexión al intentar cambiar el estado.");
    }
};

// --- 🎨 FUNCIÓN PARA DIBUJAR LOS CANDIDATOS ---
const renderPostulaciones = (items) => {
    if (!items || items.length === 0) {
        contenedorPostulaciones.innerHTML = `
            <div class="text-center p-5 text-muted fw-bold border border-secondary border-opacity-25 rounded-3 bg-light m-3">
                <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                Aún no tienes postulantes para tus vacantes.
            </div>
        `;
        return;
    }

    // Inyectamos el diseño por cada postulante
    contenedorPostulaciones.innerHTML = items.map(item => `
        <div class="row align-items-center border-bottom pb-3 mb-3 px-2 g-3">
            <div class="col-12 col-md-3 d-flex align-items-center gap-3">
                <div class="bg-secondary-subtle rounded-circle p-2 d-inline-flex align-items-center justify-content-center flex-shrink-0">
                    <i class="bi bi-person fs-5 text-dark"></i>
                </div>
                <div>
                    <div class="fw-bold text-dark small lh-sm">${item.nombres || 'Candidato'} ${item.apellidos || ''}</div>
                    <div class="small text-dark fw-bold lh-sm text-truncate" style="max-width: 150px;">
                        ${item.correo_electronico || 'Sin correo'}
                    </div>
                </div>
            </div>
            
            <div class="col-12 col-md-3 fw-bold text-dark small">
                <span class="d-md-none text-muted me-2">Vacante:</span>
                ${item.titulo_puesto || 'Puesto Desconocido'}
            </div>
            
            <div class="col-12 col-md-2">
                <select class="form-select form-select-sm shadow-sm rounded-pill border-secondary border-opacity-25 fw-bold text-dark" 
                        onchange="actualizarEstado(${item.id_postulacion || item.id}, this.value)">
                    <option value="1" ${item.id_estado_fk == 1 ? 'selected' : ''}>En Revisión</option>
                    <option value="2" ${item.id_estado_fk == 2 ? 'selected' : ''}>Entrevista</option>
                    <option value="3" ${item.id_estado_fk == 3 ? 'selected' : ''}>Aprobado</option>
                    <option value="4" ${item.id_estado_fk == 4 ? 'selected' : ''}>Rechazado</option>
                </select>
            </div>

            <div class="col-12 col-md-2 fw-bold text-dark small">
                <span class="d-md-none text-muted me-2">Fecha:</span>
                ${formatearFecha(item.fecha_postulacion)}
            </div>
            
            <div class="col-12 col-md-2 d-flex justify-content-md-center gap-2">
                <button type="button" class="btn bg-primary-subtle text-dark fw-bold btn-sm px-3 rounded-pill shadow-sm btn-ver-perfil" 
                    data-nombre="${item.nombres || 'Candidato'} ${item.apellidos || ''}" 
                    data-puesto="${item.titulo_puesto || 'Puesto'}" 
                    data-bs-toggle="modal" data-bs-target="#modalPerfilCandidato">
                    Ver perfil
                </button>
            </div>
        </div>
    `).join("");

    // Reactivamos los botones de los modales después de inyectar el HTML
    vincularModales();
};

// --- 📡 FUNCIÓN PARA TRAER LOS DATOS DE NODE.JS ---
const cargarPostulaciones = async () => {
    try {
        // 🚨 Fetch SIN TOKEN. (Node.js no debe pedirlo por ahora)
        const response = await fetch(`${API_URL}/empresa/postulaciones`);
        
        if (!response.ok) {
            // Si el error es 401, te aviso de inmediato en la pantalla
            if(response.status === 401) {
                throw new Error("🚨 Error 401: Tu servidor Node.js sigue pidiendo Token. Tienes que quitarle el 'verificarToken' a la ruta.");
            }
            throw new Error("Error al cargar los datos desde la base de datos.");
        }
        
        const data = await response.json();
        renderPostulaciones(data);

    } catch (error) {
        console.error(error);
        contenedorPostulaciones.innerHTML = `
            <div class="alert alert-danger shadow-sm m-3 fw-bold">
                ${error.message}
            </div>
        `;
    }
};

// --- 🖱️ PASAR DATOS AL MODAL ---
const vincularModales = () => {
    const botonesPerfil = document.querySelectorAll('.btn-ver-perfil');
    botonesPerfil.forEach(boton => {
        boton.addEventListener('click', function() {
            document.getElementById('perfilNombre').textContent = this.getAttribute('data-nombre');
            document.getElementById('perfilPuesto').textContent = this.getAttribute('data-puesto');
        });
    });
};

// Iniciar
cargarPostulaciones();