import { API_URL } from "../../../assets/js/shared/config.js";

const contenedorPostulaciones = document.getElementById("contenedorPostulaciones");

const formatearFecha = (fecha) => {
    if (!fecha) return "N/D";
    return new Date(fecha).toLocaleDateString("es-SV");
};

// --- 👤 FUNCIÓN: ABRIR PERFIL CON INFORMACIÓN COMPLETA ---
window.abrirPerfil = (itemString) => {
    // Decodificamos el objeto que pasamos como string
    const item = JSON.parse(decodeURIComponent(itemString));
    
    // Rellenamos el Modal de Perfil con los datos de la base de datos
    document.getElementById('perfilNombre').textContent = `${item.nombres} ${item.apellidos}`;
    document.getElementById('perfilPuesto').textContent = item.titulo_puesto;
    
    // Si tienes campos adicionales en tu modal de perfil, agrégalos aquí:
    // Ejemplo: document.getElementById('perfilCorreo').textContent = item.correo_electronico;

    const modalPerfil = new bootstrap.Modal(document.getElementById('modalPerfilCandidato'));
    modalPerfil.show();
};

// --- ✉️ FUNCIÓN: ABRIR FORMULARIO DE CONTACTO ---
window.abrirContacto = (nombre, apellidos, correo) => {
    const inputDestino = document.getElementById('contactoDestino');
    if (inputDestino) {
        // Rellenamos el campo "Para:" automáticamente
        inputDestino.value = `${nombre} ${apellidos} (${correo})`;
    }
    
    const modalContacto = new bootstrap.Modal(document.getElementById('modalContactar'));
    modalContacto.show();
};

// --- ⚙️ FUNCIÓN: ACTUALIZAR ESTADO ---
window.actualizarEstado = async (idPostulacion, nuevoEstadoId, elementoSelect) => {
    try {
        const response = await fetch(`${API_URL}/postulaciones/${idPostulacion}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_estado_fk: parseInt(nuevoEstadoId) })
        });

        if (response.ok) {
            elementoSelect.className = "form-select form-select-sm rounded-pill shadow-sm fw-bold px-3 py-1 border-0";
            if (nuevoEstadoId == 1) elementoSelect.classList.add('bg-warning', 'text-dark');
            else if (nuevoEstadoId == 2) elementoSelect.classList.add('bg-primary-subtle', 'text-primary'); 
            else if (nuevoEstadoId == 3) elementoSelect.classList.add('bg-success', 'text-white');
            else if (nuevoEstadoId == 4) elementoSelect.classList.add('bg-danger', 'text-white');
        }
    } catch (error) {
        console.error("Error al actualizar estado:", error);
    }
};

// --- 🎨 RENDERIZADO DE LA LISTA ---
const renderPostulaciones = (items) => {
    if (!items.length) {
        contenedorPostulaciones.innerHTML = `<div class="text-center p-5 fw-bold text-muted">No hay postulantes registrados.</div>`;
        return;
    }

    contenedorPostulaciones.innerHTML = items.map(item => {
        let colorClase = "bg-warning text-dark"; 
        if (item.id_estado_fk == 2) colorClase = "bg-primary-subtle text-primary";
        if (item.id_estado_fk == 3) colorClase = "bg-success text-white";
        if (item.id_estado_fk == 4) colorClase = "bg-danger text-white";

        const nombreCompleto = `${item.nombres} ${item.apellidos}`;
        // Convertimos el objeto item a string para pasarlo a la función de Perfil
        const itemData = encodeURIComponent(JSON.stringify(item));

        return `
        <div class="row align-items-center bg-white py-3 mb-2 px-2 shadow-sm rounded-2 g-3 mx-0">
            <div class="col-12 col-md-3 d-flex align-items-center gap-2">
                <div class="bg-primary-subtle rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                    <i class="bi bi-person-fill text-primary fs-5"></i>
                </div>
                <div class="fw-bold small text-dark">${nombreCompleto}</div>
            </div>

            <div class="col-12 col-md-3 fw-bold small text-dark">
                <i class="bi bi-briefcase me-2 text-muted"></i>${item.titulo_puesto}
            </div>
            
            <div class="col-12 col-md-2">
                <select class="form-select form-select-sm rounded-pill fw-bold ${colorClase} border-0 shadow-none cursor-pointer" 
                        onchange="actualizarEstado(${item.id_postulacion}, this.value, this)">
                    <option value="1" ${item.id_estado_fk == 1 ? 'selected' : ''}>En revisión</option>
                    <option value="2" ${item.id_estado_fk == 2 ? 'selected' : ''}>Entrevista</option>
                    <option value="3" ${item.id_estado_fk == 3 ? 'selected' : ''}>Aprobado</option>
                    <option value="4" ${item.id_estado_fk == 4 ? 'selected' : ''}>Rechazado</option>
                </select>
            </div>

            <div class="col-12 col-md-2 fw-bold small text-dark">
                <i class="bi bi-calendar3 me-2 text-muted"></i>${formatearFecha(item.fecha_postulacion)}
            </div>
            
            <div class="col-12 col-md-2 d-flex justify-content-center gap-2">
                <button onclick="abrirPerfil('${itemData}')" 
                    class="btn btn-sm bg-primary-subtle text-dark fw-bold rounded-pill px-2 border-0 shadow-sm" 
                    style="font-size: 0.75rem; min-width: 65px;">
                    Ver<br>perfil
                </button>
                
                <button onclick="abrirContacto('${item.nombres}', '${item.apellidos}', '${item.correo_electronico}')" 
                    class="btn btn-sm bg-primary-subtle text-dark fw-bold rounded-pill px-3 border-0 shadow-sm">
                    Contactar
                </button>
            </div>
        </div>`;
    }).join("");
};

const cargarLista = async () => {
    try {
        const response = await fetch(`${API_URL}/postulaciones/empresa`);
        const data = await response.json();
        renderPostulaciones(data);
    } catch (e) {
        console.error("Error al cargar lista:", e);
    }
};

cargarLista();