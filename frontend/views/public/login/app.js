import { API_URL, saveSession } from "../../../assets/js/shared/config.js";

// Referencias al DOM
const formLogin = document.getElementById("formLogin");
const alertContainer = document.getElementById("alertContainer");

// Función para mostrar alertas (Usa el contenedor del HTML en lugar de toasts flotantes para más seguridad)
const showAlert = (message, type = "danger") => {
    if(alertContainer) {
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
};

// Evento Principal: Submit del Login
if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault(); // Evita recargar la página

        if(alertContainer) alertContainer.innerHTML = ""; // Limpiar alertas previas

        // Captura de datos del formulario (IDs exactos del HTML)
        const correoInput = document.getElementById("correo").value.trim().toLowerCase();
        const passwordInput = document.getElementById("password").value.trim();
        const tipoInput = document.getElementById("tipo").value; 

        // Validar que no estén vacíos antes de enviar
        if (!correoInput || !passwordInput || !tipoInput) {
            showAlert("Por favor, completa todos los campos.");
            return;
        }

        try {
            // Petición al Backend
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    correo_electronico: correoInput, // Propiedad que espera Node.js
                    contrasena: passwordInput,
                    tipo: tipoInput
                })
            });

            const data = await response.json();

            // Manejo de errores de la API
            if (!response.ok) {
                showAlert(data.mensaje || "Credenciales incorrectas o error en el servidor.");
                return;
            }

            // Si todo sale bien: Guardar sesión
            saveSession(data.token, data.tipo, data.data);
            showAlert("¡Inicio de sesión exitoso! Redirigiendo...", "success");

            // Lógica de ruteo real
            setTimeout(() => {
                if (data.tipo === "usuario") {
                    window.location.href = "../../usuario/principal/index.html";
                } else if (data.tipo === "empresa") {
                    window.location.href = "../../empresa/principal/index.html";
                } else {
                     showAlert("Tipo de usuario desconocido.");
                }
            }, 1500);

        } catch (error) {
            console.error("Error en el fetch del Login:", error);
            showAlert("Error de conexión con el servidor. Revisa si la API está encendida.");
        }
    });
} else {
    console.error("No se encontró el formulario con ID 'formLogin'. Verifica tu HTML.");
}