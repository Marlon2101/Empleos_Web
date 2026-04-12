import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth, logout } from "../../../assets/js/shared/auth.js";

requireAuth(["empresa"]);

const btnLogout = document.getElementById("btnLogout");
const formPerfilEmpresa = document.getElementById("formPerfilEmpresa");
const alertContainer = document.getElementById("alertContainer");
const selectMunicipio = document.getElementById("id_municipio_fk");

btnLogout.addEventListener("click", logout);

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
};

const authHeaders = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`
});

const cargarMunicipios = async () => {
  const response = await fetch(`${API_URL}/catalogos/municipios`);
  const data = await response.json();

  selectMunicipio.innerHTML = `<option value="">Selecciona un municipio</option>`;
  data.forEach(item => {
    selectMunicipio.innerHTML += `<option value="${item.id_municipio}">${item.nombre_municipio}</option>`;
  });
};

const cargarPerfilEmpresa = async () => {
  const response = await fetch(`${API_URL}/perfil/empresa`, {
    headers: {
      "Authorization": `Bearer ${getToken()}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo cargar el perfil de empresa");
  }

  document.getElementById("nombre_comercial").value = data.nombre_comercial ?? "";
  document.getElementById("razon_social").value = data.razon_social ?? "";
  document.getElementById("correo_electronico").value = data.correo_electronico ?? "";
  document.getElementById("sitio_web").value = data.sitio_web ?? "";
  document.getElementById("id_municipio_fk").value = data.id_municipio_fk ?? "";
  document.getElementById("descripcion_empresa").value = data.descripcion_empresa ?? "";
};

formPerfilEmpresa.addEventListener("submit", async (e) => {
  e.preventDefault();
  alertContainer.innerHTML = "";

  try {
    const body = {
      nombre_comercial: document.getElementById("nombre_comercial").value.trim(),
      razon_social: document.getElementById("razon_social").value.trim(),
      sitio_web: document.getElementById("sitio_web").value.trim(),
      descripcion_empresa: document.getElementById("descripcion_empresa").value.trim(),
      id_municipio_fk: Number(document.getElementById("id_municipio_fk").value)
    };

    const response = await fetch(`${API_URL}/perfil/empresa`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudo actualizar el perfil");
      return;
    }

    showAlert("Perfil de empresa actualizado correctamente", "success");
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
});

const init = async () => {
  try {
    await cargarMunicipios();
    await cargarPerfilEmpresa();
  } catch (error) {
    console.error(error);
    showAlert(error.message || "No se pudo inicializar la vista");
  }
};

init();