import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth, logout } from "../../../assets/js/shared/auth.js";

requireAuth(["empresa"]);

const btnLogout = document.getElementById("btnLogout");
const btnLimpiar = document.getElementById("btnLimpiar");
const formVacante = document.getElementById("formVacante");
const alertContainer = document.getElementById("alertContainer");

const selectCategoria = document.getElementById("id_categoria_fk");
const selectMunicipio = document.getElementById("id_municipio_fk");

btnLogout.addEventListener("click", logout);

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
};

const cargarCategorias = async () => {
  const response = await fetch(`${API_URL}/catalogos/categorias`);
  const data = await response.json();

  selectCategoria.innerHTML = `<option value="">Selecciona una categoría</option>`;
  data.forEach(item => {
    selectCategoria.innerHTML += `<option value="${item.id_categoria}">${item.nombre_categoria}</option>`;
  });
};

const cargarMunicipios = async () => {
  const response = await fetch(`${API_URL}/catalogos/municipios`);
  const data = await response.json();

  selectMunicipio.innerHTML = `<option value="">Selecciona un municipio</option>`;
  data.forEach(item => {
    selectMunicipio.innerHTML += `<option value="${item.id_municipio}">${item.nombre_municipio}</option>`;
  });
};

const limpiarFormulario = () => {
  formVacante.reset();
};

btnLimpiar.addEventListener("click", limpiarFormulario);

formVacante.addEventListener("submit", async (e) => {
  e.preventDefault();
  alertContainer.innerHTML = "";

  const body = {
    id_categoria_fk: Number(document.getElementById("id_categoria_fk").value),
    titulo_puesto: document.getElementById("titulo_puesto").value.trim(),
    descripcion_puesto: document.getElementById("descripcion_puesto").value.trim(),
    salario_offrecido: Number(document.getElementById("salario_offrecido").value),
    modalidad: document.getElementById("modalidad").value,
    id_municipio_fk: Number(document.getElementById("id_municipio_fk").value)
  };

  try {
    const response = await fetch(`${API_URL}/vacantes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.errores && Array.isArray(data.errores)) {
        showAlert(data.errores.map(e => e.msg).join("<br>"));
      } else {
        showAlert(data.mensaje || "No se pudo publicar la vacante");
      }
      return;
    }

    showAlert("Vacante publicada correctamente", "success");
    limpiarFormulario();
  } catch (error) {
    console.error(error);
    showAlert("Error de conexión con el servidor");
  }
});

const init = async () => {
  try {
    await cargarCategorias();
    await cargarMunicipios();
  } catch (error) {
    console.error(error);
    showAlert("No se pudieron cargar los catálogos");
  }
};

init();