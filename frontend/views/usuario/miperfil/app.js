import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth } from "../../../assets/js/shared/auth.js";

requireAuth(["usuario"]);

const formPerfil = document.getElementById("formPerfil");
const btnGuardarPerfil = document.getElementById("btnGuardarPerfil");
const alertContainer = document.getElementById("alertContainer");
const selectMunicipio = document.getElementById("id_municipio_fk");
const inputFoto = document.getElementById("foto_perfil_input");
const previewFoto = document.getElementById("previewFoto");

let fotoPerfilBase64 = "";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`
});

const showAlert = (message, type = "danger") => {
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show rounded-4" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
};

const splitLines = (value) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const parseExperiencias = (value) =>
  splitLines(value).map((linea) => {
    const [cargo, empresa, periodo, descripcion] = linea.split("|").map((item) => item?.trim() || "");
    return { cargo, empresa, periodo, descripcion };
  });

const parseEducacion = (value) =>
  splitLines(value).map((linea) => {
    const [titulo, institucion, periodo] = linea.split("|").map((item) => item?.trim() || "");
    return { titulo, institucion, periodo };
  });

const serializeExperiencias = (items = []) =>
  items.map((item) => [item.cargo, item.empresa, item.periodo, item.descripcion].filter(Boolean).join(" | ")).join("\n");

const serializeEducacion = (items = []) =>
  items.map((item) => [item.titulo, item.institucion, item.periodo].filter(Boolean).join(" | ")).join("\n");

const setCardData = (perfil) => {
  document.getElementById("cardNombre").textContent = perfil.nombre_completo || "Mi perfil";
  document.getElementById("cardTitulo").textContent = perfil.titulo_profesional || "Completa tu perfil profesional";
  document.getElementById("cardCorreo").textContent = perfil.correo_electronico || "--";
  document.getElementById("cardTelefono").textContent = perfil.telefono || "--";
  document.getElementById("cardUbicacion").textContent = [perfil.nombre_municipio, perfil.nombre_departamento].filter(Boolean).join(", ") || perfil.direccion || "--";
  previewFoto.src = perfil.foto_perfil || "https://placehold.co/240x240/eef2ff/3f51b5?text=Perfil";
};

const cargarMunicipios = async () => {
  const response = await fetch(`${API_URL}/catalogos/municipios`);
  const data = await response.json();

  selectMunicipio.innerHTML = `<option value="">Selecciona un municipio</option>`;
  data.forEach((item) => {
    selectMunicipio.innerHTML += `<option value="${item.id_municipio}">${item.nombre_municipio}</option>`;
  });
};

const cargarPerfil = async () => {
  const response = await fetch(`${API_URL}/api/usuarios/perfil`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo cargar el perfil");
  }

  document.getElementById("nombres").value = data.nombres || "";
  document.getElementById("apellidos").value = data.apellidos || "";
  document.getElementById("correo_electronico").value = data.correo_electronico || "";
  document.getElementById("telefono").value = data.telefono || "";
  document.getElementById("titulo_profesional").value = data.titulo_profesional || "";
  document.getElementById("direccion").value = data.direccion || "";
  document.getElementById("sitio_web").value = data.sitio_web || "";
  document.getElementById("resumen_profesional").value = data.resumen_profesional || "";
  document.getElementById("habilidades_input").value = (data.habilidades || []).join(", ");
  document.getElementById("experiencia_input").value = serializeExperiencias(data.experiencia || []);
  document.getElementById("educacion_input").value = serializeEducacion(data.educacion || []);
  document.getElementById("id_municipio_fk").value = data.id_municipio_fk || "";

  fotoPerfilBase64 = data.foto_perfil || "";
  setCardData(data);
};

const validarFormulario = () => {
  const nombres = document.getElementById("nombres").value.trim();
  const apellidos = document.getElementById("apellidos").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const municipio = document.getElementById("id_municipio_fk").value;

  if (!nombres || !apellidos) {
    throw new Error("Los nombres y apellidos son obligatorios.");
  }

  if (!/^[0-9+\-\s]{8,20}$/.test(telefono)) {
    throw new Error("Ingresa un número de teléfono válido.");
  }

  if (!municipio) {
    throw new Error("Selecciona un municipio.");
  }
};

const guardarPerfil = async () => {
  validarFormulario();

  const body = {
    nombres: document.getElementById("nombres").value.trim(),
    apellidos: document.getElementById("apellidos").value.trim(),
    telefono: document.getElementById("telefono").value.trim(),
    id_municipio_fk: Number(document.getElementById("id_municipio_fk").value),
    direccion: document.getElementById("direccion").value.trim(),
    titulo_profesional: document.getElementById("titulo_profesional").value.trim(),
    sitio_web: document.getElementById("sitio_web").value.trim(),
    resumen_profesional: document.getElementById("resumen_profesional").value.trim(),
    foto_perfil: fotoPerfilBase64 || null,
    habilidades: document.getElementById("habilidades_input").value.split(",").map((item) => item.trim()).filter(Boolean),
    experiencia: parseExperiencias(document.getElementById("experiencia_input").value),
    educacion: parseEducacion(document.getElementById("educacion_input").value)
  };

  const response = await fetch(`${API_URL}/api/usuarios/perfil`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo guardar el perfil");
  }

  setCardData(data.data);
  showAlert(data.mensaje, "success");
};

inputFoto.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    showAlert("Selecciona una imagen válida.");
    inputFoto.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showAlert("La imagen debe pesar menos de 2MB.");
    inputFoto.value = "";
    return;
  }

  fotoPerfilBase64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });

  previewFoto.src = fotoPerfilBase64;
});

btnGuardarPerfil.addEventListener("click", async () => {
  try {
    await guardarPerfil();
  } catch (error) {
    console.error(error);
    showAlert(error.message || "No se pudo guardar el perfil");
  }
});

const init = async () => {
  await cargarMunicipios();
  await cargarPerfil();
};

init().catch((error) => {
  console.error(error);
  showAlert(error.message || "No se pudo cargar el perfil");
});

