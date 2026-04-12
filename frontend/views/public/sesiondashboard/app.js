import { getToken, getTipo, getUsuario } from "../../../assets/js/shared/config.js";

const estadoSesion = document.getElementById("estadoSesion");
const btnContinuar = document.getElementById("btnContinuar");

const renderEstado = () => {
  const token = getToken();
  const tipo = getTipo();
  const usuario = getUsuario();

  if (!token || !tipo) {
    estadoSesion.innerHTML = `
      <div class="alert alert-warning mb-0">
        No hay una sesión activa.
      </div>
    `;
    btnContinuar.textContent = "Ir a login";
    return;
  }

  estadoSesion.innerHTML = `
    <div class="alert alert-success mb-0 text-start">
      <div><strong>Tipo:</strong> ${tipo}</div>
      <div><strong>Sesión:</strong> activa</div>
      <div><strong>Usuario:</strong> ${usuario?.correo_electronico || usuario?.nombre_comercial || "Identificado"}</div>
    </div>
  `;

  btnContinuar.textContent = "Ir a mi panel";
};

const redirigir = () => {
  const token = getToken();
  const tipo = getTipo();

  if (!token || !tipo) {
    window.location.href = "../login/index.html";
    return;
  }

  if (tipo === "usuario") {
    window.location.href = "../../usuario/principal/index.html";
    return;
  }

  if (tipo === "empresa") {
    window.location.href = "../../empresa/principal/index.html";
    return;
  }

  if (tipo === "admin") {
    window.location.href = "../../admin/principal/index.html";
    return;
  }

  window.location.href = "../login/index.html";
};

btnContinuar.addEventListener("click", redirigir);

renderEstado();