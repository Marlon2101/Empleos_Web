import { API_URL } from "../../../assets/js/shared/config.js";

// ==========================================
// 1. CARGAR EMPLEOS DESTACADOS
// ==========================================
const cargarEmpleosDestacados = async () => {
    const contenedor = document.getElementById("contenedor-destacados");
    if (!contenedor) return;

    try {
        const response = await fetch(`${API_URL}/vacantes/destacadas`); 
        if (!response.ok) throw new Error("Error al consultar la API");
        
        const empleos = await response.json();

        if (empleos.length === 0) {
            contenedor.innerHTML = "<p class='text-center text-muted'>No hay empleos destacados por ahora.</p>";
            return;
        }

        contenedor.innerHTML = "";

        empleos.forEach(empleo => {
            contenedor.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="job-card bg-white rounded-4 p-4 h-100 d-flex flex-column position-relative" style="border: 1px solid #e0e5f0; transition: all 0.3s ease;">
                        <span class="position-absolute top-0 end-0 mt-3 me-3 badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1" style="font-size: 0.7rem; border: 1px solid rgba(25, 135, 84, 0.2);">
                            ✨ Destacado
                        </span>
                        <div class="d-flex align-items-start mb-3 mt-2">
                            <div class="bg-light rounded-3 d-flex align-items-center justify-content-center me-3 flex-shrink-0" style="width: 50px; height: 50px; border: 1px solid #edf0f7;">
                                <i class="bi bi-buildings fs-4" style="color: var(--primary-deep);"></i>
                            </div>
                            <div>
                                <h6 class="fw-bold mb-1" style="color: #121826; font-size: 1.05rem;">${empleo.titulo}</h6>
                                <p class="text-secondary small mb-0 fw-medium">${empleo.empresa}</p>
                            </div>
                        </div>
                        <div class="mb-4 mt-2">
                            <div class="d-flex align-items-center text-muted small mb-2">
                                <i class="bi bi-geo-alt me-2 text-secondary"></i> El Salvador (Híbrido)
                            </div>
                            <div class="d-flex align-items-center text-muted small">
                                <i class="bi bi-cash-stack me-2 text-secondary"></i> Salario a convenir
                            </div>
                        </div>
                        <div class="mt-auto pt-3 border-top">
                            <a href="../detalleempleo/index.html?id=${empleo.id_vacante}" class="btn text-white w-100 rounded-pill fw-medium py-2" style="background-color: var(--primary-deep); box-shadow: 0 4px 10px rgba(63, 81, 181, 0.2);">
                                Ver vacante <i class="bi bi-arrow-right-short ms-1 fs-5 align-middle"></i>
                            </a>
                        </div>
                    </div>
                </div>`;
        });
    } catch (error) {
        console.error("Error cargando empleos:", error);
        contenedor.innerHTML = "<p class='text-danger text-center'><i class='bi bi-exclamation-circle'></i> Error al conectar con el servidor.</p>";
    }
};


// ==========================================
// 2. LO QUE PASA AL ENTRAR A LA VISTA PRINCIPAL
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    
    // --- A. MOSTRAR NOMBRE Y VALIDAR SESIÓN ---
    const sessionData = localStorage.getItem("usuario");

    if (sessionData) {
        try {
            const user = JSON.parse(sessionData);
            const nombreDisplay = document.getElementById("nombreUsuario");
            if (nombreDisplay) nombreDisplay.textContent = user.nombres || "Usuario";
        } catch (e) {
            console.error("Error al leer sesión");
        }
    } else {
        window.location.href = "../../auth/login/index.html"; 
        return; 
    }

    // --- B. CARGAR TARJETAS ---
    cargarEmpleosDestacados();

    // --- C. BUSCADOR INTELIGENTE ---
    const btnBuscar = document.getElementById("btnBusquedaRapida");
    const inputBusqueda = document.getElementById("inputBusquedaRapida");

    if (btnBuscar && inputBusqueda) {
        
        const ejecutarBusqueda = async () => {
            const query = inputBusqueda.value.trim().toLowerCase();

            if (!query) {
                alert("⚠️ Por favor, escribe un puesto de trabajo para buscar.");
                return;
            }

            // Cambiar botón a modo "Buscando"
            const textoOriginal = btnBuscar.innerHTML;
            btnBuscar.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Buscando...`;
            btnBuscar.disabled = true;

            try {
                // Buscamos las vacantes en tu API
                const response = await fetch(`${API_URL}/vacantes/destacadas`); // Por ahora busca en destacadas
                if (!response.ok) throw new Error("Error en la API");
                const vacantes = await response.json();

                // Revisamos si el título coincide con lo que el usuario escribió
                const vacanteEncontrada = vacantes.find(v => v.titulo.toLowerCase().includes(query));

                if (vacanteEncontrada) {
                    // Si existe, nos vamos a la vista de Detalle Empleo con ese ID
                    window.location.href = `../detalleempleo/index.html?id=${vacanteEncontrada.id_vacante}`;
                } else {
                    // Si no existe
                    alert(`❌ No encontramos ningún empleo llamado "${inputBusqueda.value}". Intenta con "Desarrollador" o "Diseñador".`);
                }
            } catch (error) {
                console.error("Error en búsqueda:", error);
                alert("Ocurrió un error al buscar.");
            } finally {
                // Restaurar botón
                btnBuscar.innerHTML = textoOriginal;
                btnBuscar.disabled = false;
            }
        };

        // Escuchar clics en el botón o presionar Enter
        btnBuscar.addEventListener("click", ejecutarBusqueda);
        inputBusqueda.addEventListener("keypress", (e) => {
            if (e.key === "Enter") ejecutarBusqueda();
        });
    }
});



// ==========================================
    // 4. FILTROS AVANZADOS MULTIPLES
    // ==========================================
    const btnAplicarFiltros = document.getElementById("btnAplicarFiltros");
    const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");

    if (btnAplicarFiltros) {
        btnAplicarFiltros.addEventListener("click", () => {
            // 1. Recopilamos todos los valores de los inputs
            const palabra = document.getElementById("filtroPalabra")?.value.trim() || "";
            const ubicacion = document.getElementById("filtroUbicacion")?.value.trim() || "";
            
            // 2. Extraemos Selects (Ignorando las opciones por defecto)
            const tipo = document.getElementById("filtroTipo")?.value;
            const filtroTipo = tipo.includes("Todos") ? "" : tipo;

            const exp = document.getElementById("filtroExperiencia")?.value;
            const filtroExp = exp.includes("Todos") ? "" : exp;

            const min = document.getElementById("filtroSalarioMin")?.value;
            const filtroMin = min.includes("Mínimo") ? "" : min;

            const max = document.getElementById("filtroSalarioMax")?.value;
            const filtroMax = max.includes("Máximo") ? "" : max;

            // 3. Extraemos Checkboxes (Modalidad)
            const modalidades = [];
            if (document.getElementById("filtroRemoto")?.checked) modalidades.push("Remoto");
            if (document.getElementById("filtroPresencial")?.checked) modalidades.push("Presencial");
            if (document.getElementById("filtroHibrido")?.checked) modalidades.push("Híbrido");

            // 4. Armamos la URL Inteligente (Solo enviamos lo que el usuario llenó)
            const params = new URLSearchParams();
            if (palabra) params.append("q", palabra);
            if (ubicacion) params.append("ubicacion", ubicacion);
            if (filtroTipo) params.append("tipo", filtroTipo);
            if (filtroExp) params.append("experiencia", filtroExp);
            if (filtroMin) params.append("min", filtroMin);
            if (filtroMax) params.append("max", filtroMax);
            if (modalidades.length > 0) params.append("modalidad", modalidades.join(","));

            // 5. Redirigimos a la página de búsqueda con los filtros aplicados
            window.location.href = `../buscarempleo/index.html?${params.toString()}`;
        });
    }

    // Botón para limpiar todo de un solo clic
    if (btnLimpiarFiltros) {
        btnLimpiarFiltros.addEventListener("click", () => {
            document.getElementById("filtroPalabra").value = "";
            document.getElementById("filtroUbicacion").value = "";
            document.getElementById("filtroTipo").selectedIndex = 0;
            document.getElementById("filtroExperiencia").selectedIndex = 0;
            document.getElementById("filtroSalarioMin").selectedIndex = 0;
            document.getElementById("filtroSalarioMax").selectedIndex = 0;
            document.getElementById("filtroRemoto").checked = false;
            document.getElementById("filtroPresencial").checked = false;
            document.getElementById("filtroHibrido").checked = false;
        });
    }