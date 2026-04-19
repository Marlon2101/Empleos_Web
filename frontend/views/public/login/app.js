import { API_URL, saveSession } from "../../../assets/js/shared/config.js";

const formLogin = document.getElementById("formLogin");
const alertContainer = document.getElementById("alertContainer");

const showAlert = (message, type = "danger") => {
    if (alertContainer) {
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
    }
};

if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault(); 
        if (alertContainer) alertContainer.innerHTML = ""; 

        // --- SOLUCIÓN AL ERROR ---
        // Capturamos solo lo que existe en tu HTML profesional
        const correoInput = document.getElementById("correo").value.trim().toLowerCase();
        const passwordInput = document.getElementById("password").value.trim();

        // ❌ AQUÍ ESTABA LA ANTIGUA LÍNEA 28 (const tipoInput = ... )
        // La hemos eliminado porque el rol lo decide la Base de Datos, no el HTML.

        if (!correoInput || !passwordInput) {
            showAlert("Por favor, completa todos los campos.");
            return;
        }

        try {
            // Petición limpia al Backend (sin enviar el 'tipo')
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    correo_electronico: correoInput, 
                    contrasena: passwordInput
                })
            });

            const data = await response.json();

            if (!response.ok) {
                showAlert(data.mensaje || "Credenciales incorrectas.");
                return;
            }

            // --- VALIDACIÓN POR TOKEN ---
            // 'data.tipo' viene directamente de la validación en tu Base de Datos (MySQL)
            saveSession(data.token, data.tipo, data.data);
            
            showAlert("¡Inicio de sesión exitoso! Redirigiendo...", "success");

            // Redirección profesional basada en la identidad real confirmada por la DB
            setTimeout(() => {
                if (data.tipo === "usuario") {
                    window.location.href = "../../usuario/principal/index.html";
                } else if (data.tipo === "empresa") {
                    window.location.href = "../../empresa/principal/index.html";
                } else {
                    window.location.href = "../../sesiondashboard/index.html";
                }
            }, 1200);

        } catch (error) {
            console.error("Error en el fetch del Login:", error);
            showAlert("Error de conexión con el servidor.");
        }
    });
}