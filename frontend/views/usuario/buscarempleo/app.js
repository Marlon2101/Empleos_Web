import { API_URL } from "../../../assets/js/shared/config.js";

document.addEventListener("DOMContentLoaded", () => {
    // 1. REFERENCIAS A LOS ELEMENTOS DEL DOM
    const contenedorVacantes = document.getElementById("contenedor-vacantes");
    const inputBusqueda = document.getElementById("inputBusquedaPrincipal");
    const btnBuscar = document.getElementById("btnBuscarPrincipal");
    const btnAplicarFiltros = document.getElementById("btnAplicarFiltros");
    const btnAplicarMobile = document.getElementById("btnAplicarFiltrosMobile");
    const textoBarraEstado = document.getElementById("textoBarraEstado");

    // 2. FUNCIÓN PRINCIPAL PARA CONSULTAR LA API Y DIBUJAR TARJETAS
    const cargarVacantes = async (parametrosURL = "") => {
        // Mostramos el spinner mientras carga
        contenedorVacantes.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2 text-secondary">Buscando vacantes reales...</p>
            </div>
        `;

        try {
            // Hacemos la petición a la API con los filtros
            const url = parametrosURL 
                ? `${API_URL}/vacantes/busqueda/filtros?${parametrosURL}` 
                : `${API_URL}/vacantes`; // Si no hay parámetros, trae todas

            const response = await fetch(url);
            if (!response.ok) throw new Error("Error al consultar la API");
            
            const vacantes = await response.json();

            // Actualizamos la barra de estado superior
            if (parametrosURL && !parametrosURL.includes("q=")) {
                 textoBarraEstado.textContent = `Se encontraron ${vacantes.length} resultados con los filtros seleccionados`;
            } else if (vacantes.length > 0) {
                 textoBarraEstado.textContent = `Mostrando ${vacantes.length} vacantes disponibles`;
            }

            // Si no hay resultados
            if (vacantes.length === 0) {
                contenedorVacantes.innerHTML = `
                    <div class="text-center py-5 bg-white rounded-4 border">
                        <i class="bi bi-search fs-1 text-muted opacity-50 mb-3 d-block"></i>
                        <h5 class="fw-bold text-dark">No encontramos vacantes</h5>
                        <p class="text-secondary">Intenta buscar con otras palabras o limpia los filtros laterales.</p>
                    </div>`;
                return;
            }

            // Limpiamos el contenedor y dibujamos
            contenedorVacantes.innerHTML = "";
            vacantes.forEach(v => {
                contenedorVacantes.innerHTML += `
                    <div class="card mb-4 p-4 border-0 shadow-sm" style="border-radius: 20px; transition: transform 0.2s;">
                        <div class="row align-items-center">
                            <div class="col-md-9">
                                <div class="d-flex align-items-center mb-2">
                                    <h5 class="fw-bold mb-0 me-3" style="color: #121826;">${v.titulo_puesto || v.titulo}</h5>
                                    <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill fw-medium px-3">${v.modalidad || 'Híbrido'}</span>
                                </div>
                                <p class="text-secondary fw-medium mb-3">${v.nombre_empresa || v.empresa || 'Empresa Confidencial'}</p>
                                
                                <div class="d-flex flex-wrap gap-3 small text-muted">
                                    <div class="d-flex align-items-center">
                                        <i class="bi bi-geo-alt me-1"></i> ${v.nombre_municipio || v.ubicacion || 'El Salvador'}
                                    </div>
                                    <div class="d-flex align-items-center">
                                        <i class="bi bi-cash me-1"></i> ${v.salario_offrecido ? '$'+v.salario_offrecido : 'A convenir'}
                                    </div>
                                    <div class="d-flex align-items-center">
                                        <i class="bi bi-clock me-1"></i> Publicado recientemente
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3 text-md-end mt-4 mt-md-0">
                                <a href="../detalleempleo/index.html?id=${v.id_vacante}" class="btn px-4 py-2 fw-semibold w-100 w-md-auto text-white" style="background-color: var(--primary-deep); border-radius: 30px;">
                                    Ver detalles <i class="bi bi-arrow-right ms-1"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            });

        } catch (error) {
            console.error("Error:", error);
            contenedorVacantes.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-exclamation-triangle text-danger fs-1"></i>
                    <p class="text-danger mt-2">Hubo un error al conectar con el servidor.</p>
                </div>`;
        }
    };

    // 3. REVISAR SI LLEGAMOS DESDE OTRA PÁGINA CON UNA BÚSQUEDA (?q=developer)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('q') || urlParams.has('tipo') || urlParams.has('ubicacion')) {
        
        // Ponemos el texto en la barra de búsqueda para que el usuario lo vea
        if (urlParams.has('q')) {
            inputBusqueda.value = urlParams.get('q');
            textoBarraEstado.textContent = `Resultados para: "${urlParams.get('q')}"`;
        }
        
        // Ejecutamos la búsqueda con esos parámetros iniciales
        cargarVacantes(urlParams.toString());
    } else {
        // Si entramos directo a la página, cargamos todo
        cargarVacantes();
    }

    // 4. BÚSQUEDA DESDE LA BARRA SUPERIOR
    const ejecutarBusquedaBarra = () => {
        const query = inputBusqueda.value.trim();
        if (query) {
            textoBarraEstado.textContent = `Resultados para: "${query}"`;
            cargarVacantes(`q=${encodeURIComponent(query)}`);
            
            // Actualizamos la URL arriba sin recargar la página (para poder compartir el link)
            window.history.pushState({}, '', `?q=${encodeURIComponent(query)}`);
        } else {
            cargarVacantes(); // Carga todo si borra el texto
            window.history.pushState({}, '', window.location.pathname);
        }
    };

    if (btnBuscar) btnBuscar.addEventListener("click", ejecutarBusquedaBarra);
    if (inputBusqueda) {
        inputBusqueda.addEventListener("keypress", (e) => {
            if (e.key === "Enter") ejecutarBusquedaBarra();
        });
    }

    // 5. RECOLECTAR Y APLICAR FILTROS LATERALES
    const recolectarFiltrosYBuscar = () => {
        const params = new URLSearchParams();

        // 1. Barra de búsqueda
        const query = inputBusqueda.value.trim();
        if (query) params.append("q", query);

        // 2. Fecha de publicación
        if (document.getElementById("fecha2")?.checked) params.append("fecha", "24h");
        else if (document.getElementById("fecha3")?.checked) params.append("fecha", "semana");
        else if (document.getElementById("fecha4")?.checked) params.append("fecha", "mes");

        // 3. Experiencia
        const niveles = [];
        // OJO: Estos values deben coincidir con cómo los tienes en tu base de datos
        if (document.getElementById("nivel1")?.checked) niveles.push("Practicante");
        if (document.getElementById("nivel2")?.checked) niveles.push("Junior");
        if (document.getElementById("nivel3")?.checked) niveles.push("Semi-senior");
        if (document.getElementById("nivel4")?.checked) niveles.push("Senior");
        if (niveles.length > 0) params.append("experiencia", niveles.join(","));

        // 4. Salario
        if (document.getElementById("salario1")?.checked) params.append("max", "500");
        else if (document.getElementById("salario2")?.checked) params.append("max", "800");
        else if (document.getElementById("salario3")?.checked) params.append("max", "1000");
        else if (document.getElementById("salario4")?.checked) params.append("max", "1500");
        else if (document.getElementById("salario5")?.checked) params.append("min", "2000");

        cargarVacantes(params.toString());
        
        const toastElement = document.getElementById('toastFiltros');
        if (toastElement) new bootstrap.Toast(toastElement).show();
    };
    if (btnAplicarFiltros) btnAplicarFiltros.addEventListener("click", recolectarFiltrosYBuscar);
    if (btnAplicarMobile) btnAplicarMobile.addEventListener("click", recolectarFiltrosYBuscar);
});