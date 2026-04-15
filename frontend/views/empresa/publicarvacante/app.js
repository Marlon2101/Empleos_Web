import { API_URL } from "../../../assets/js/shared/config.js";

const formVacante = document.getElementById("formVacante");
const btnConfirmarFinal = document.getElementById("btnConfirmarFinal");

const enviarVacante = async () => {
    try {
        // --- SEGURO PARA DETECTAR EL ID FALTANTE ---
        const elCategoria = document.getElementById("id_categoria_fk");
        const elMunicipio = document.getElementById("id_municipio_fk");
        const elTitulo = document.getElementById("titulo_puesto");
        const elDesc = document.getElementById("descripcion_puesto");
        const elSalario = document.getElementById("salario_offrecido");
        const elModalidad = document.getElementById("modalidad");
        
      
        const elResponsabilidades = document.getElementById("responsabilidades");
        const elRequisitos = document.getElementById("requisitos");

        if (!elCategoria || !elMunicipio || !elTitulo || !elDesc || !elSalario || !elModalidad || !elResponsabilidades || !elRequisitos) {
            let faltantes = [];
            if (!elCategoria) faltantes.push("id_categoria_fk");
            if (!elMunicipio) faltantes.push("id_municipio_fk");
            if (!elTitulo) faltantes.push("titulo_puesto");
            if (!elDesc) faltantes.push("descripcion_puesto");
            if (!elSalario) faltantes.push("salario_offrecido");
            if (!elModalidad) faltantes.push("modalidad");
            
            
            if (!elResponsabilidades) faltantes.push("responsabilidades");
            if (!elRequisitos) faltantes.push("requisitos");

            console.error("IDs NO ENCONTRADOS EN EL HTML:", faltantes);
            alert("Error de Programación: Los siguientes IDs no existen en tu HTML: " + faltantes.join(", "));
            return;
        }

        const body = {
            id_empresa_fk: 1, // Bypass temporal (Hackeo)
            id_categoria_fk: parseInt(elCategoria.value),
            id_municipio_fk: parseInt(elMunicipio.value),
            titulo_puesto: elTitulo.value.trim(),
            descripcion_puesto: elDesc.value.trim(),
         
            responsabilidades: elResponsabilidades.value.trim(),
            requisitos: elRequisitos.value.trim(),

            salario_offrecido: parseFloat(elSalario.value) || 0,
            modalidad: elModalidad.value
        };

        console.log("Enviando datos al servidor:", body);

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

        
        alert("¡Vacante publicada con éxito en Workly!");
        
   
        window.location.href = "../misvacantes/index.html";

    } catch (error) {
        console.error("Error detallado:", error);
        alert("Ocurrió un error: " + error.message);
    }
};


if (formVacante) {
    formVacante.addEventListener("submit", (e) => {
        e.preventDefault();
       
    });
}


if (btnConfirmarFinal) {
    btnConfirmarFinal.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Iniciando publicación desde el botón del modal...");
        enviarVacante();
    });
}