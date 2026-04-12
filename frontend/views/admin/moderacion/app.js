import { API_URL, getToken, clearSession } from "../../../assets/js/shared/config.js";

const btnLogout = document.getElementById("btnLogout");
const alertContainer = document.getElementById("alertContainer");

const totalUsuarios = document.getElementById("totalUsuarios");
const totalEmpresas = document.getElementById("totalEmpresas");
const totalVacantes = document.getElementById("totalVacantes");

const listaUsuarios = document.getElementById("listaUsuarios");
const listaEmpresas = document.getElementById("listaEmpresas");
const listaVacantes = document.getElementById("listaVacantes");

const requireAdmin = () => {
  const token = localStorage.getItem("token");
  const tipo = localStorage.getItem("tipo");

  if (!token || tipo !== "admin") {
    window.location.href = "../../public/login/index.html";
  }
};

requireAdmin();

btnLogout.addEventListener("click", () => {
  clearSession();
  window.location.href = "../../public/login/index.html";
});

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
};

const authHeader = () => ({
  "Authorization": `Bearer ${getToken()}`
});

const renderUsuarios = (items) => {
  if (!items?.length) {
    listaUsuarios.innerHTML = `<p class="text-muted mb-0">Sin registros.</p>`;
    return;
  }

  listaUsuarios.innerHTML = items.slice(0, 5).map(item => `
    <div class="list-block-item">
      <div class="fw-semibold">${item.nombres} ${item.apellidos}</div>
      <div class="small text-muted">${item.correo_electronico}</div>
    </div>
  `).join("");
};

const renderEmpresas = (items) => {
  if (!items?.length) {
    listaEmpresas.innerHTML = `<p class="text-muted mb-0">Sin registros.</p>`;
    return;
  }

  listaEmpresas.innerHTML = items.slice(0, 5).map(item => `
    <div class="list-block-item">
      <div class="fw-semibold">${item.nombre_comercial}</div>
      <div class="small text-muted">${item.correo_electronico ?? "Sin correo"}</div>
    </div>
  `).join("");
};

const renderVacantes = (items) => {
  if (!items?.length) {
    listaVacantes.innerHTML = `<p class="text-muted mb-0">Sin registros.</p>`;
    return;
  }

  listaVacantes.innerHTML = items.slice(0, 5).map(item => `
    <div class="list-block-item">
      <div class="fw-semibold">${item.titulo_puesto}</div>
      <div class="small text-muted">${item.nombre_comercial}</div>
    </div>
  `).join("");
};

const cargarDatos = async () => {
  try {
    const [usuariosRes, empresasRes, vacantesRes] = await Promise.all([
      fetch(`${API_URL}/admin/usuarios`, { headers: authHeader() }),
      fetch(`${API_URL}/admin/empresas`, { headers: authHeader() }),
      fetch(`${API_URL}/admin/vacantes`, { headers: authHeader() })
    ]);

    const usuarios = await usuariosRes.json();
    const empresas = await empresasRes.json();
    const vacantes = await vacantesRes.json();

    if (!usuariosRes.ok || !empresasRes.ok || !vacantesRes.ok) {
      showAlert("No se pudieron cargar los datos de moderación");
      return;
    }

    totalUsuarios.textContent = usuarios.length;
    totalEmpresas.textContent = empresas.length;
    totalVacantes.textContent = vacantes.length;

    renderUsuarios(usuarios);
    renderEmpresas(empresas);
    renderVacantes(vacantes);
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
};

cargarDatos();