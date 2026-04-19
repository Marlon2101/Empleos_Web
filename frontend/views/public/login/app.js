import { API_URL, saveSession } from "../../../assets/js/shared/config.js";

const formLogin = document.getElementById("formLogin");

if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // El error da aquí porque estos ID no existen en el Dashboard
        const correoElement = document.getElementById("correo");
        const passwordElement = document.getElementById("password");

        if (!correoElement || !passwordElement) return;

        const correoInput = correoElement.value.trim();
        const passwordInput = passwordElement.value.trim();

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    correo_electronico: correoInput,
                    contrasena: passwordInput
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.mensaje || "Error de acceso");

            // Guardamos Token, Tipo y los Datos del usuario (Nombre, etc.)
            saveSession(data.token, data.tipo, data.data);

            // Redirección profesional
            const destinos = {
                'usuario': '../../usuario/principal/index.html',
                'empresa': '../../empresa/principal/index.html'
            };

            window.location.href = destinos[data.tipo] || '../../public/paginainicial/index.html';

        } catch (error) {
            alert(error.message);
        }
    });
}