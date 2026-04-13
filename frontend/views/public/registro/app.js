import { API_URL } from "../../../assets/js/shared/config.js";

// DOM - Pestañas y Contenedores
const tabUsuario = document.getElementById("tabUsuario");
const tabEmpresa = document.getElementById("tabEmpresa");
const camposUsuario = document.getElementById("camposUsuario");
const camposEmpresa = document.getElementById("camposEmpresa");

// DOM - Formulario
const formRegistro = document.getElementById("formRegistro");
const alertContainer = document.getElementById("alertContainer");

let tipoRegistro = "usuario";

// --- CAMBIO DE VISTA (TABS) ---
tabUsuario.addEventListener("click", () => {
    tipoRegistro = "usuario";
    camposUsuario.classList.remove("d-none");
    camposEmpresa.classList.add("d-none");
    tabUsuario.classList.add("active");
    tabEmpresa.classList.remove("active");
});

tabEmpresa.addEventListener("click", () => {
    tipoRegistro = "empresa";
    camposEmpresa.classList.remove("d-none");
    camposUsuario.classList.add("d-none");
    tabEmpresa.classList.add("active");
    tabUsuario.classList.remove("active");
});

// --- ALERTAS ---
const showAlert = (message, type = "danger") => {
    alertContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
};

// --- CARGAR MUNICIPIOS ---
const cargarMunicipios = async () => {
    try {
        const response = await fetch(`${API_URL}/catalogos/municipios`);
        const data = await response.json();
        
        console.log("Datos recibidos de municipios:", data); // 👀 Mira esto en la consola

        if (!data || data.length === 0) {
            console.error("La API devolvió un arreglo vacío");
            return;
        }

        const options = `<option value="">Selecciona un municipio</option>` + 
                        data.map(m => `<option value="${m.id_municipio}">${m.nombre_municipio}</option>`).join("");
        
        document.getElementById("municipioUsuario").innerHTML = options;
        document.getElementById("municipioEmpresa").innerHTML = options;
    } catch (error) {
        console.error("Error crítico al cargar municipios:", error);
        showAlert("No se pudo conectar con el servidor para cargar municipios.");
    }
};

// --- ENVÍO DE DATOS (CREATE) ---
formRegistro.addEventListener("submit", async (e) => {
    e.preventDefault();
    let url = "";
    let body = {};

    if (tipoRegistro === "usuario") {
        const pass = document.getElementById("passUsuario").value;
        const conf = document.getElementById("passConfUsuario").value;

        if (pass !== conf) return showAlert("Las contraseñas de usuario no coinciden");

        url = `${API_URL}/auth/register-user`;
        body = {
            nombres: document.getElementById("nombreUsuario").value.trim(),
            apellidos: document.getElementById("apellidosUsuario").value.trim(),
            correo_electronico: document.getElementById("emailUsuario").value.trim(),
            telefono: document.getElementById("telefonoUsuario").value.trim(),
            contrasena: pass,
            id_municipio_fk: Number(document.getElementById("municipioUsuario").value),
            resumen_profesional: document.getElementById("resumenProfesional").value.trim()
        };
    } else {
        const pass = document.getElementById("passEmpresa").value;
        const conf = document.getElementById("passConfEmpresa").value;

        if (pass !== conf) return showAlert("Las contraseñas de empresa no coinciden");

        url = `${API_URL}/auth/register-company`;
        body = {
            nombre_comercial: document.getElementById("nombreComercial").value.trim(),
            razon_social: document.getElementById("razonSocial").value.trim(),
            correo_electronico: document.getElementById("emailEmpresa").value.trim(),
            telefono: document.getElementById("telefonoEmpresa").value.trim(),
            contrasena: pass,
            id_municipio_fk: Number(document.getElementById("municipioEmpresa").value),
            descripcion_empresa: document.getElementById("descEmpresa").value.trim()
        };
    }

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.mensaje || "Error en el registro. Revisa los campos.");
        }

        showAlert("¡Registro exitoso! Redirigiendo...", "success");
        setTimeout(() => window.location.href = "../login/index.html", 2000);

    } catch (error) {
        showAlert(error.message);
    }
});

cargarMunicipios();