import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth } from "../../../assets/js/shared/auth.js";

requireAuth(["empresa"]);

const btnGuardarPerfil = document.getElementById("btnGuardarPerfil");
const alertContainer = document.getElementById("alertContainer");
const selectMunicipio = document.getElementById("id_municipio_fk");
const inputLogo = document.getElementById("logo_empresa_input");
const previewLogo = document.getElementById("previewLogo");

let logoEmpresaBase64 = "";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`
});

const syncEmpresaStorage = (perfil) => {
  const usuarioActual = JSON.parse(localStorage.getItem("usuario") || "{}");
  localStorage.setItem("usuario", JSON.stringify({
    ...usuarioActual,
    ...perfil,
    empresa: perfil.nombre_comercial,
    nombre_comercial: perfil.nombre_comercial
  }));
};

const showAlert = (message, type = "danger") => {
  if (!alertContainer) return;
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

const setCardData = (perfil) => {
  document.getElementById("cardNombre").textContent = perfil.nombre_comercial || "Empresa";
  document.getElementById("cardTitulo").textContent = perfil.razon_social || "Perfil de empresa";
  document.getElementById("cardCorreo").textContent = perfil.correo_electronico || "--";
  document.getElementById("cardTelefono").textContent = perfil.telefono || "--";
  document.getElementById("cardUbicacion").textContent = [perfil.nombre_municipio, perfil.nombre_departamento].filter(Boolean).join(", ") || perfil.direccion || "--";
  previewLogo.src = perfil.logo_empresa || "https://placehold.co/240x240/eef2ff/3f51b5?text=Empresa";
};

const renderExtras = (perfil) => {
  const rootEspecialidades = document.getElementById("listaEspecialidades");
  const rootCultura = document.getElementById("listaCultura");
  const rootBeneficios = document.getElementById("listaBeneficios");

  if (rootEspecialidades) {
    rootEspecialidades.innerHTML = (perfil.especialidades || []).length
      ? perfil.especialidades.map((item) => `<span class="badge text-bg-light rounded-pill px-3 py-2">${item}</span>`).join("")
      : `<span class="text-muted">Aun no has definido especialidades.</span>`;
  }

  if (rootCultura) {
    rootCultura.innerHTML = (perfil.cultura || []).length
      ? perfil.cultura.map((item) => `<div class="border rounded-4 p-3">${item}</div>`).join("")
      : `<p class="text-muted mb-0">Aun no has definido cultura de empresa.</p>`;
  }

  if (rootBeneficios) {
    rootBeneficios.innerHTML = (perfil.beneficios || []).length
      ? perfil.beneficios.map((item) => `<div class="border rounded-4 p-3">${item}</div>`).join("")
      : `<p class="text-muted mb-0">Aun no has definido beneficios.</p>`;
  }
};

const cargarMunicipios = async () => {
  const response = await fetch(`${API_URL}/catalogos/municipios-agrupados`);
  const data = await response.json();
  selectMunicipio.innerHTML = `<option value="">Selecciona un municipio</option>`;
  data.forEach((item) => {
    selectMunicipio.innerHTML += `<option value="${item.id_municipio}">${item.nombre_municipio} - ${item.nombre_departamento}</option>`;
  });
};

const cargarPerfilEmpresa = async () => {
  const response = await fetch(`${API_URL}/perfil/empresa`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo cargar el perfil de empresa");
  }

  document.getElementById("nombre_comercial").value = data.nombre_comercial || "";
  document.getElementById("razon_social").value = data.razon_social || "";
  document.getElementById("correo_electronico").value = data.correo_electronico || "";
  document.getElementById("telefono").value = data.telefono || "";
  document.getElementById("id_municipio_fk").value = data.id_municipio_fk || "";
  document.getElementById("direccion").value = data.direccion || "";
  document.getElementById("sitio_web").value = data.sitio_web || "";
  document.getElementById("descripcion_empresa").value = data.descripcion_empresa || "";
  document.getElementById("especialidades_input").value = (data.especialidades || []).join(", ");
  document.getElementById("cultura_input").value = (data.cultura || []).join("\n");
  document.getElementById("beneficios_input").value = (data.beneficios || []).join("\n");

  logoEmpresaBase64 = data.logo_empresa || "";
  setCardData(data);
  renderExtras(data);
};

const validarFormulario = () => {
  if (!document.getElementById("nombre_comercial").value.trim()) {
    throw new Error("El nombre comercial es obligatorio.");
  }
  if (!document.getElementById("razon_social").value.trim()) {
    throw new Error("La razon social es obligatoria.");
  }
  if (!document.getElementById("telefono").value.trim()) {
    throw new Error("El telefono es obligatorio.");
  }
  if (!document.getElementById("id_municipio_fk").value) {
    throw new Error("Selecciona un municipio.");
  }
};

const guardarPerfil = async () => {
  validarFormulario();

  const body = {
    nombre_comercial: document.getElementById("nombre_comercial").value.trim(),
    razon_social: document.getElementById("razon_social").value.trim(),
    sitio_web: document.getElementById("sitio_web").value.trim(),
    descripcion_empresa: document.getElementById("descripcion_empresa").value.trim(),
    id_municipio_fk: Number(document.getElementById("id_municipio_fk").value),
    telefono: document.getElementById("telefono").value.trim(),
    direccion: document.getElementById("direccion").value.trim(),
    logo_empresa: logoEmpresaBase64 || null,
    especialidades: document.getElementById("especialidades_input").value.split(",").map((item) => item.trim()).filter(Boolean),
    cultura: splitLines(document.getElementById("cultura_input").value),
    beneficios: splitLines(document.getElementById("beneficios_input").value)
  };

  const response = await fetch(`${API_URL}/perfil/empresa`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body)
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo guardar el perfil.");
  }

  setCardData(data.data);
  renderExtras(data.data);
  syncEmpresaStorage(data.data);
  showAlert("Perfil de empresa actualizado correctamente.", "success");
};

inputLogo?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showAlert("Selecciona una imagen valida.");
    inputLogo.value = "";
    return;
  }

  if (file.size > 3 * 1024 * 1024) {
    showAlert("La imagen debe pesar menos de 3MB.");
    inputLogo.value = "";
    return;
  }

  logoEmpresaBase64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });

  previewLogo.src = logoEmpresaBase64;
});

btnGuardarPerfil?.addEventListener("click", async () => {
  try {
    await guardarPerfil();
  } catch (error) {
    console.error(error);
    showAlert(error.message || "No se pudo guardar el perfil.");
  }
});

const init = async () => {
  await cargarMunicipios();
  await cargarPerfilEmpresa();
};

init().catch((error) => {
  console.error(error);
  showAlert(error.message || "No se pudo cargar el perfil de empresa.");
});
