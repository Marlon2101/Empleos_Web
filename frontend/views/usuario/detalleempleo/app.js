import { API_URL, getToken, getUsuario } from "../../../assets/js/shared/config.js";
// import { requireAuth } from "../../../assets/js/shared/auth.js"; // Descomenta en producción

const alertContainer = document.getElementById("alertContainer");
const contenedorAccion = document.getElementById("contenedorAccionPrincipal");

// Función de alerta general
const showAlert = (message, type = "danger") => {
    if(alertContainer) {
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>`;
    }
};

const getVacanteId = () => new URLSearchParams(window.location.search).get("id");

const cargarDetalle = async () => {
    const idVacante = getVacanteId();
    if (!idVacante) return showAlert("Agrega ?id=1 a la URL para ver un empleo real.");

    try {
        const response = await fetch(`${API_URL}/vacantes/detalle/${idVacante}`, {
            headers: { "Authorization": `Bearer ${getToken()}` }
        });
        
        const data = await response.json();
        
        // 🚀 DEBUG: Imprimimos los datos en la consola
        console.log("-----------------------------------------");
        console.log("DATOS RECIBIDOS DEL BACKEND:");
        console.log("Objeto Vacante Completo:", data.vacante);
        console.log("Responsabilidades:", data.vacante?.responsabilidades);
        console.log("Requisitos:", data.vacante?.requisitos);
        console.log("-----------------------------------------");

        if (!response.ok) throw new Error(data.mensaje);

        const v = data.vacante;

        // Inyección de Textos Básicos
        document.getElementById("vacanteTitulo").textContent = v.titulo_puesto;
        document.getElementById("empresaNombre").textContent = v.nombre_comercial;
        document.getElementById("vacanteUbicacion").textContent = v.nombre_municipio ? `${v.nombre_municipio}, ${v.nombre_departamento}` : "El Salvador";
        document.getElementById("vacanteSalario").textContent = v.salario_offrecido ? `$${Number(v.salario_offrecido).toLocaleString()}` : "A convenir";
        document.getElementById("vacanteDescripcion").textContent = v.descripcion_puesto;
        document.getElementById("vacanteModalidad").textContent = v.modalidad;
        document.getElementById("empresaDescripcion").textContent = v.descripcion_empresa || "Empresa destacada del sector tecnológico.";
        
        if (v.fecha_publicacion) {
            document.getElementById("vacanteFecha").textContent = new Date(v.fecha_publicacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        }

        // Diseño de Badges
        document.getElementById("badgesContenedor").innerHTML = `
            <span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fw-semibold">${v.modalidad || 'Presencial'}</span>
            <span class="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fw-semibold">ID: #VAC-${v.id_vacante}</span>
        `;

        // Generar listas con viñetas limpias (separando por puntos)
        const formatLista = (texto) => {
            // Si el texto es null, undefined, o un string vacío, mostramos el mensaje por defecto
            if (!texto || texto.trim() === "") return "<li>Información no detallada.</li>";
            return texto.split('.')
                .filter(i => i.trim().length > 3)
                .map(i => `<li>${i.trim()}.</li>`)
                .join("");
        };

        document.getElementById("listaResponsabilidades").innerHTML = formatLista(v.responsabilidades);
        document.getElementById("listaRequisitos").innerHTML = formatLista(v.requisitos);

        // Botón principal
        renderBotonAccion(data.yaPostulado, v.id_vacante);

    } catch (error) {
        console.error(error);
        showAlert("Error de conexión al cargar la vacante.");
    }
};

const renderBotonAccion = (yaPostulado, idVacante) => {
    if (yaPostulado) {
        contenedorAccion.innerHTML = `
            <button class="btn btn-success px-4 py-2 fw-bold shadow-sm" style="border-radius: 8px;" disabled>
                Ya te postulaste <i class="bi bi-check-all ms-1"></i>
            </button>`;
    } else {
        contenedorAccion.innerHTML = `
            <button class="btn btn-primary px-4 py-2 fw-bold shadow-sm" style="border-radius: 8px;" id="btnPostularme">
                Aplicar ahora <i class="bi bi-send ms-1"></i>
            </button>`;
        document.getElementById("btnPostularme").onclick = () => realizarPostulacion(idVacante);
    }
};

const realizarPostulacion = async (idVacante) => {
    // 🚀 BYPASS: Si no hay usuario logueado, forzamos el usuario con ID = 1 para pruebas
    let usuario = getUsuario();
    if (!usuario || !usuario.id_usuario) {
        console.warn("No hay sesión activa. Forzando usuario ID = 1 para pruebas.");
        usuario = { id_usuario: 1 }; 
    }

    try {
        const bodyData = { 
            id_usuario_fk: usuario.id_usuario, 
            id_vacante_fk: parseInt(idVacante), 
            id_estado_fk: 1 
        };

        console.log("Enviando postulación al backend:", bodyData);

        const response = await fetch(`${API_URL}/postulaciones`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                // "Authorization": `Bearer ${getToken()}` // Desactivado para pruebas
            },
            body: JSON.stringify(bodyData)
        });

        const data = await response.json();

        if (response.ok) {
            new bootstrap.Toast(document.getElementById('toastPostulado')).show();
            // Recargamos el detalle para que el botón cambie a verde "Ya te postulaste"
            setTimeout(() => {
                cargarDetalle();
            }, 1500);
        } else {
            // Muestra la alerta roja si ya te habías postulado
            showAlert(data.mensaje || "Error al postularse.");
        }
    } catch (error) {
        console.error("Error crítico en el fetch:", error);
        showAlert("Error de red al intentar postularse.");
    }
};

// ==========================================
// EVENTOS PARA GUARDAR Y COMPARTIR
// ==========================================

// Guardar Empleo
document.getElementById('btnGuardar')?.addEventListener('click', function(e) {
    e.preventDefault();
    // Cambiar ícono a relleno y color principal
    const icono = document.getElementById('iconoGuardar');
    if(icono.classList.contains('bi-bookmark')) {
        icono.classList.replace('bi-bookmark', 'bi-bookmark-fill');
        this.classList.replace('text-secondary', 'text-primary');
        new bootstrap.Toast(document.getElementById('toastGuardado')).show();
    } else {
        icono.classList.replace('bi-bookmark-fill', 'bi-bookmark');
        this.classList.replace('text-primary', 'text-secondary');
    }
});

// Copiar Enlace
document.getElementById('btnCopiarEnlace')?.addEventListener('click', function() {
    const linkInput = document.getElementById('linkCompartir');
    
    // Asignar la URL actual al input
    linkInput.value = window.location.href;
    
    // Copiar al portapapeles
    linkInput.select();
    document.execCommand('copy');
    
    // Cerrar el modal y mostrar toast
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalCompartir'));
    if(modal) modal.hide();
    new bootstrap.Toast(document.getElementById('toastCopiado')).show();
});

// Iniciar carga
cargarDetalle();