import {
  API_URL,
  getToken,
  clearSession,
  resolveViewPath,
  buildPendingVerificationPath,
  normalizeAppRedirect
} from "../../../assets/js/shared/config.js";
import { requireAuth } from "../../../assets/js/shared/auth.js";

requireAuth(["usuario"]);

const btnGuardarPerfil = document.getElementById("btnGuardarPerfil");
const alertContainer = document.getElementById("alertContainer");
const selectMunicipio = document.getElementById("id_municipio_fk");
const inputFoto = document.getElementById("foto_perfil_input");
const previewFoto = document.getElementById("previewFoto");
const cardRoot = document.querySelector(".surface-card.p-4.h-100");
const panelRoot = document.querySelector(".surface-card.p-4.p-lg-5");

let fotoPerfilBase64 = "";
let municipiosCache = [];

const LOGIN_PATH = resolveViewPath("public/login/index.html");
const DEFAULT_PROFILE_IMAGE = "https://placehold.co/240x240/eef2ff/3f51b5?text=Perfil";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`
});

const syncUsuarioStorage = (perfil) => {
  const usuarioActual = JSON.parse(localStorage.getItem("usuario") || "{}");
  localStorage.setItem("usuario", JSON.stringify({
    ...usuarioActual,
    ...perfil,
    nombre: perfil.nombre_completo || usuarioActual.nombre,
    nombres: perfil.nombres,
    apellidos: perfil.apellidos,
    correo_electronico: perfil.correo_electronico || usuarioActual.correo_electronico
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
  String(value || "")
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

const formatearSalario = (salario) => {
  if (salario === null || salario === undefined || salario === "") {
    return "A convenir";
  }

  return `$${Number(salario).toFixed(2)}`;
};

const normalizarImagen = (value) =>
  typeof value === "string" && /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(value)
    ? value
    : "";

const redirigirPorAuth = (data = {}, status = 401) => {
  if (status === 403 && data?.code === "EMAIL_NO_VERIFICADO") {
    const fallback = buildPendingVerificationPath({
      email: data?.correo_electronico,
      tipo: data?.tipo
    });
    window.location.href = normalizeAppRedirect(data?.redirect, fallback);
    return;
  }

  clearSession();
  window.location.href = LOGIN_PATH;
};

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (response.status === 401 || response.status === 403) {
    redirigirPorAuth(data, response.status);
    throw new Error(data?.mensaje || "Tu sesion ya no es valida.");
  }

  if (!response.ok) {
    throw new Error(data?.mensaje || "No se pudo completar la solicitud.");
  }

  return data;
};

const setCardData = (perfil) => {
  document.getElementById("cardNombre").textContent = perfil.nombre_completo || "Mi perfil";
  document.getElementById("cardTitulo").textContent = perfil.titulo_profesional || "Completa tu perfil profesional";
  document.getElementById("cardCorreo").textContent = perfil.correo_electronico || "--";
  document.getElementById("cardTelefono").textContent = perfil.telefono || "--";
  document.getElementById("cardUbicacion").textContent =
    [perfil.nombre_municipio, perfil.nombre_departamento].filter(Boolean).join(", ") || perfil.direccion || "--";
  previewFoto.src = normalizarImagen(perfil.foto_perfil) || DEFAULT_PROFILE_IMAGE;
};

const ensureExtrasLayout = () => {
  if (cardRoot && !document.getElementById("quickActionsPerfil")) {
    const hr = cardRoot.querySelector("hr");
    hr?.insertAdjacentHTML("afterend", `
      <div class="d-grid gap-3 mb-4" id="quickActionsPerfil">
        <a class="text-decoration-none text-dark border rounded-4 p-3" href="../notificaciones/index.html">
          <div class="d-flex align-items-center justify-content-between gap-3">
            <div>
              <div class="text-uppercase small fw-bold text-secondary">Acceso rapido</div>
              <div class="fw-semibold">Ver notificaciones</div>
            </div>
            <i class="bi bi-bell fs-4 text-primary"></i>
          </div>
        </a>
        <a class="text-decoration-none text-dark border rounded-4 p-3" href="../buscarempleo/index.html">
          <div class="d-flex align-items-center justify-content-between gap-3">
            <div>
              <div class="text-uppercase small fw-bold text-secondary">Acceso rapido</div>
              <div class="fw-semibold">Buscar nuevas vacantes</div>
            </div>
            <i class="bi bi-search fs-4 text-primary"></i>
          </div>
        </a>
      </div>
    `);
  }

  if (panelRoot && !document.getElementById("listaGuardadosPerfil")) {
    const form = document.getElementById("formPerfil");
    form?.insertAdjacentHTML("afterend", `
      <hr class="my-5">
      <div class="row g-4">
        <div class="col-12 col-lg-6">
          <div class="border rounded-4 p-4 h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 class="h5 fw-bold mb-1">Empleos guardados</h3>
                <p class="text-muted small mb-0">Vacantes que apartaste para revisar despues.</p>
              </div>
              <span class="badge text-bg-light rounded-pill" id="contadorGuardados">0</span>
            </div>
            <div class="d-grid gap-3" id="listaGuardadosPerfil"></div>
          </div>
        </div>
        <div class="col-12 col-lg-6">
          <div class="border rounded-4 p-4 h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 class="h5 fw-bold mb-1">Mis postulaciones</h3>
                <p class="text-muted small mb-0">Seguimiento rapido de tu actividad reciente.</p>
              </div>
              <span class="badge text-bg-light rounded-pill" id="contadorPostulaciones">0</span>
            </div>
            <div class="d-grid gap-3" id="listaPostulacionesPerfil"></div>
          </div>
        </div>
      </div>
    `);
  }
};

const renderGuardados = (items = []) => {
  const root = document.getElementById("listaGuardadosPerfil");
  const contador = document.getElementById("contadorGuardados");
  if (!root || !contador) return;

  contador.textContent = String(items.length);

  if (!items.length) {
    root.innerHTML = `<p class="text-muted mb-0">Todavia no has guardado vacantes.</p>`;
    return;
  }

  root.innerHTML = items.slice(0, 4).map((item) => `
    <a class="text-decoration-none text-dark border rounded-4 p-3" href="../detalleempleo/index.html?id=${item.id_vacante}">
      <div class="fw-semibold">${item.titulo_puesto}</div>
      <div class="small text-muted">${item.nombre_comercial || "Empresa"} · ${item.nombre_municipio || "El Salvador"}</div>
      <div class="small text-primary mt-1">${formatearSalario(item.salario_offrecido)}</div>
    </a>
  `).join("");
};

const renderPostulaciones = (items = []) => {
  const root = document.getElementById("listaPostulacionesPerfil");
  const contador = document.getElementById("contadorPostulaciones");
  if (!root || !contador) return;

  contador.textContent = String(items.length);

  if (!items.length) {
    root.innerHTML = `<p class="text-muted mb-0">Aun no tienes postulaciones registradas.</p>`;
    return;
  }

  root.innerHTML = items.slice(0, 4).map((item) => `
    <a class="text-decoration-none text-dark border rounded-4 p-3" href="../detalleempleo/index.html?id=${item.id_vacante}">
      <div class="fw-semibold">${item.titulo_puesto}</div>
      <div class="small text-muted">${item.nombre_comercial || "Empresa"}</div>
      <div class="small mt-1"><span class="badge text-bg-light">${item.nombre_estado || "En proceso"}</span></div>
    </a>
  `).join("");
};

const renderMunicipios = (municipios = [], selectedId = "") => {
  const selected = String(selectedId || "");
  const options = municipios.map((item) => `
    <option value="${item.id_municipio}">${item.nombre_municipio}${item.nombre_departamento ? ` - ${item.nombre_departamento}` : ""}</option>
  `).join("");

  selectMunicipio.innerHTML = `<option value="">Selecciona un municipio</option>${options}`;

  if (selected && municipios.some((item) => String(item.id_municipio) === selected)) {
    selectMunicipio.value = selected;
    return;
  }

  if (selected) {
    selectMunicipio.insertAdjacentHTML(
      "beforeend",
      `<option value="${selected}">Municipio actual no disponible en catalogo</option>`
    );
    selectMunicipio.value = selected;
  }
};

const cargarMunicipios = async () => {
  const data = await fetchJson(`${API_URL}/catalogos/municipios-agrupados`);
  municipiosCache = Array.isArray(data) ? data : [];
  renderMunicipios(municipiosCache);
};

const aplicarPerfilAlFormulario = (data) => {
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

  fotoPerfilBase64 = normalizarImagen(data.foto_perfil);
  renderMunicipios(municipiosCache, data.id_municipio_fk || "");
  setCardData(data);
};

const cargarPerfil = async () => {
  const data = await fetchJson(`${API_URL}/api/usuarios/perfil`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });

  aplicarPerfilAlFormulario(data);
};

const cargarActividadPerfil = async () => {
  const headers = { Authorization: `Bearer ${getToken()}` };
  const [guardadosData, postulacionesData] = await Promise.allSettled([
    fetchJson(`${API_URL}/guardados`, { headers }),
    fetchJson(`${API_URL}/usuario/postulaciones`, { headers })
  ]);

  renderGuardados(guardadosData.status === "fulfilled" && Array.isArray(guardadosData.value) ? guardadosData.value : []);
  renderPostulaciones(postulacionesData.status === "fulfilled" && Array.isArray(postulacionesData.value) ? postulacionesData.value : []);
};

const validarUrl = (value) => {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
};

const validarFormulario = () => {
  const nombres = document.getElementById("nombres").value.trim();
  const apellidos = document.getElementById("apellidos").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const municipio = document.getElementById("id_municipio_fk").value;
  const sitioWeb = document.getElementById("sitio_web").value.trim();

  if (!nombres || !apellidos) {
    throw new Error("Los nombres y apellidos son obligatorios.");
  }

  if (!/^[0-9+\-\s]{8,20}$/.test(telefono)) {
    throw new Error("Ingresa un numero de telefono valido.");
  }

  if (!municipio || Number.isNaN(Number(municipio))) {
    throw new Error("Selecciona un municipio valido.");
  }

  if (!validarUrl(sitioWeb)) {
    throw new Error("Ingresa un sitio web valido que comience con http:// o https://.");
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

  btnGuardarPerfil.disabled = true;
  btnGuardarPerfil.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Guardando...`;

  try {
    const data = await fetchJson(`${API_URL}/api/usuarios/perfil`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(body)
    });

    aplicarPerfilAlFormulario(data.data);
    syncUsuarioStorage(data.data);
    showAlert(data.mensaje, "success");
  } finally {
    btnGuardarPerfil.disabled = false;
    btnGuardarPerfil.innerHTML = `<i class="bi bi-floppy me-2"></i>Guardar cambios`;
  }
};

inputFoto?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showAlert("Selecciona una imagen valida.");
    inputFoto.value = "";
    return;
  }

  if (file.size > 3 * 1024 * 1024) {
    showAlert("La imagen debe pesar menos de 3MB.");
    inputFoto.value = "";
    return;
  }

  try {
    fotoPerfilBase64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
      reader.readAsDataURL(file);
    });

    previewFoto.src = fotoPerfilBase64;
  } catch (error) {
    showAlert(error.message || "No se pudo procesar la imagen.");
    inputFoto.value = "";
  }
});

btnGuardarPerfil?.addEventListener("click", async () => {
  try {
    await guardarPerfil();
  } catch (error) {
    console.error(error);
    showAlert(error.message || "No se pudo guardar el perfil");
  }
});

const init = async () => {
  ensureExtrasLayout();
  await cargarMunicipios();
  await cargarPerfil();
  await cargarActividadPerfil();
};

init().catch((error) => {
  console.error(error);
  showAlert(error.message || "No se pudo cargar el perfil");
});
