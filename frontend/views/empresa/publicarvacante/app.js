import { API_URL } from "../../../assets/js/shared/config.js";

const formVacante = document.getElementById("formVacante");
const btnConfirmarFinal = document.getElementById("btnConfirmarFinal");

// --- FUNCIÓN QUE HACE EL TRABAJO ---
const enviarVacante = async () => {
    try {
        // --- SEGURO PARA DETECTAR EL ID FALTANTE ---
        const elCategoria = document.getElementById("id_categoria_fk");
        const elMunicipio = document.getElementById("id_municipio_fk");
        const elTitulo = document.getElementById("titulo_puesto");
        const elDesc = document.getElementById("descripcion_puesto");
        const elSalario = document.getElementById("salario_offrecido");
        const elModalidad = document.getElementById("modalidad");

        // 🔍 Verificación exhaustiva: Si alguno es null, lo reportamos de inmediato
        if (!elCategoria || !elMunicipio || !elTitulo || !elDesc || !elSalario || !elModalidad) {
            let faltantes = [];
            if (!elCategoria) faltantes.push("id_categoria_fk");
            if (!elMunicipio) faltantes.push("id_municipio_fk");
            if (!elTitulo) faltantes.push("titulo_puesto");
            if (!elDesc) faltantes.push("descripcion_puesto");
            if (!elSalario) faltantes.push("salario_offrecido");
            if (!elModalidad) faltantes.push("modalidad");

            console.error("IDs NO ENCONTRADOS EN EL HTML:", faltantes);
            alert("Error de Programación: Los siguientes IDs no existen en tu HTML: " + faltantes.join(", "));
            return;
        }

        // Construcción del objeto que espera el Backend
        const body = {
            id_empresa_fk: 1, // Bypass temporal (Hackeo)
            id_categoria_fk: parseInt(elCategoria.value),
            id_municipio_fk: parseInt(elMunicipio.value),
            titulo_puesto: elTitulo.value.trim(),
            descripcion_puesto: elDesc.value.trim(),
            salario_offrecido: parseFloat(elSalario.value) || 0,
            modalidad: elModalidad.value
        };

        console.log("Enviando datos al servidor:", body);

        // --- EL FETCH (Lo que faltaba) ---
        const res = await fetch(`${API_URL}/vacantes`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.mensaje || data.error || "Error al publicar la vacante");
        }

        // Si todo sale bien
        alert("¡Vacante publicada con éxito en Workly!");
        
        // Redirigir (ajusta la ruta según tu estructura)
        window.location.href = "../misvacantes/index.html";

    } catch (error) {
        console.error("Error detallado:", error);
        alert("Ocurrió un error: " + error.message);
    }
};

// --- ESCUCHADORES DE EVENTOS ---

// 1. Manejo del Submit del formulario principal
if (formVacante) {
    formVacante.addEventListener("submit", (e) => {
        e.preventDefault();
        // Nota: Si usas un modal intermedio, este evento solo debería 
        // abrir el modal, pero aquí lo dejamos funcional por si acaso.
        enviarVacante();
    });
}

// 2. EL BOTÓN AZUL DEL MODAL (Confirmar y Publicar)
if (btnConfirmarFinal) {
    btnConfirmarFinal.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Iniciando publicación desde el botón del modal...");
        enviarVacante();
    });
}