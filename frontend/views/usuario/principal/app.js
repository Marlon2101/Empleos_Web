import { API_URL, saveSession } from "../../../assets/js/shared/config.js";

const formLogin = document.getElementById("formLogin");
const alertContainer = document.getElementById("alertContainer");

const showAlert = (message, type = "danger") => {
    if (alertContainer) {
        alertContainer.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }
};

if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const correoInput = document.getElementById("correo").value.trim();
    const passwordInput = document.getElementById("password").value.trim();

    // ELIMINAMOS LA LÍNEA 28. No buscamos "tipo" en el HTML.
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                correo_electronico: correoInput,
                contrasena: passwordInput
                // NO enviamos el tipo. Dejamos que el Backend lo descubra.
            })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.mensaje || "Error de acceso");

        // GUARDAMOS EL TOKEN Y EL TIPO QUE VIENE DE LA DB
        // El servidor nos dirá: "Este correo es un usuario" o "es una empresa"
        saveSession(data.token, data.tipo, data.data);

        // REDIRECCIÓN AUTOMÁTICA
        // El sistema usa el 'tipo' que el Backend validó matemáticamente
        const destinos = {
            'usuario': '../../usuario/principal/index.html',
            'empresa': '../../empresa/principal/index.html',
            'admin': '../../sesiondashboard/index.html'
        };

        window.location.href = destinos[data.tipo] || '../../public/paginainicial/index.html';

    } catch (error) {
        showAlert(error.message);
    }
});
}