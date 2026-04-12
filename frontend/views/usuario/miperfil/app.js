import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth, logout } from "../../../assets/js/shared/auth.js";

requireAuth(["usuario"]);

const btnLogout = document.getElementById("btnLogout");
const formPerfil = document.getElementById("formPerfil");
const btnAgregarHabilidad = document.getElementById("btnAgregarHabilidad");

const alertContainer = document.getElementById("alertContainer");
const selectMunicipio = document.getElementById("id_municipio_fk");
const selectHabilidad = document.getElementById("id_habilidad_fk");
const listaHabilidades = document.getElementById("listaHabilidades");

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

const cargarCatalogoHabilidades = async () => {
  const response = await fetch(`${API_URL}/catalogos/habilidades`);
  const data = await response.json();

  selectHabilidad.innerHTML = `<option value="">Selecciona una habilidad</option>`;
  data.forEach(item => {
    selectHabilidad.innerHTML += `<option value="${item.id_habilidad}">${item.nombre_habilidad}</option>`;
  });
};

const cargarPerfil = async () => {
  const response = await fetch(`${API_URL}/perfil/usuario`, {
    headers: {
      "Authorization": `Bearer ${getToken()}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo cargar el perfil");
  }

  document.getElementById("nombres").value = data.nombres ?? "";
  document.getElementById("apellidos").value = data.apellidos ?? "";
  document.getElementById("telefono").value = data.telefono ?? "";
  document.getElementById("id_municipio_fk").value = data.id_municipio_fk ?? "";
  document.getElementById("resumen_profesional").value = data.resumen_profesional ?? "";
};

const renderHabilidades = (items) => {
  if (!items || items.length === 0) {
    listaHabilidades.innerHTML = `<p class="text-muted mb-0">No has agregado habilidades todavía.</p>`;
    return;
  }

  listaHabilidades.innerHTML = items.map(item => `
    <div class="habilidad-item">
      <span>${item.nombre_habilidad}</span>
      <button class="btn btn-sm btn-outline-danger btn-eliminar-habilidad" data-id="${item.id_habilidad_fk}">
        Quitar
      </button>
    </div>
  `).join("");

  document.querySelectorAll(".btn-eliminar-habilidad").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      await eliminarHabilidad(id);
    });
  });
};

const cargarHabilidades = async () => {
  const response = await fetch(`${API_URL}/perfil/usuario/habilidades`, {
    headers: {
      "Authorization": `Bearer ${getToken()}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudieron cargar las habilidades");
  }

  renderHabilidades(data);
};

formPerfil.addEventListener("submit", async (e) => {
  e.preventDefault();
  alertContainer.innerHTML = "";

  try {
    const body = {
      nombres: document.getElementById("nombres").value.trim(),
      apellidos: document.getElementById("apellidos").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      id_municipio_fk: Number(document.getElementById("id_municipio_fk").value),
      resumen_profesional: document.getElementById("resumen_profesional").value.trim()
    };

    const response = await fetch(`${API_URL}/perfil/usuario`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudo actualizar el perfil");
      return;
    }

    showAlert("Perfil actualizado correctamente", "success");
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
});

btnAgregarHabilidad.addEventListener("click", async () => {
  try {
    const id_habilidad_fk = Number(selectHabilidad.value);

    if (!id_habilidad_fk) {
      showAlert("Selecciona una habilidad");
      return;
    }

    const response = await fetch(`${API_URL}/perfil/usuario/habilidades`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ id_habilidad_fk })
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudo agregar la habilidad");
      return;
    }

    showAlert("Habilidad agregada correctamente", "success");
    selectHabilidad.value = "";
    await cargarHabilidades();
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
});

const eliminarHabilidad = async (id) => {
  try {
    const response = await fetch(`${API_URL}/perfil/usuario/habilidades/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      showAlert(data.mensaje || "No se pudo eliminar la habilidad");
      return;
    }

    showAlert("Habilidad eliminada correctamente", "success");
    await cargarHabilidades();
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
};

const init = async () => {
  try {
    await cargarMunicipios();
    await cargarCatalogoHabilidades();
    await cargarPerfil();
    await cargarHabilidades();
  } catch (error) {
    console.error(error);
    showAlert(error.message || "No se pudo inicializar la vista");
  }
};

init();