
import { resolveViewPath } from "./config.js";

const verificarAcceso = () => {
   
    const token = localStorage.getItem("token");

    if (!token) {
        expulsarUsuario();
        return;
    }

    try {
       
        const payloadBase64 = token.split('.')[1];
        const payloadDecodificado = JSON.parse(atob(payloadBase64)); 
        
        const rolDelToken = payloadDecodificado.tipo; 
        const rutaActual = window.location.pathname;

        // 3. Verificamos las carpetas
        if (rutaActual.includes("/usuario/") && rolDelToken !== "usuario") {
            expulsarUsuario();
        } 
        else if (rutaActual.includes("/empresa/") && rolDelToken !== "empresa") {
            expulsarUsuario();
        } 
        else if (rutaActual.includes("/sesiondashboard/") && rolDelToken !== "admin") {
            expulsarUsuario();
        }
        
    } catch (error) {
        console.error("Token manipulado o inválido");
        expulsarUsuario();
    }
};

const expulsarUsuario = () => {
    
    localStorage.removeItem("token");
    localStorage.removeItem("tipo");
    localStorage.removeItem("usuario");
    
    
    window.location.href = resolveViewPath("public/login/index.html");
};

verificarAcceso();
