import { API_URL, getToken } from "../../../assets/js/shared/config.js";
import { requireAuth } from "../../../assets/js/shared/auth.js";

requireAuth(["empresa"]);

const formVacante = document.getElementById("formVacante");
const btnConfirmarFinal = document.getElementById("btnConfirmarFinal");
const modalPaso2 = document.getElementById("modalPaso2");

const fieldIds = [
  "id_categoria_fk",
  "id_municipio_fk",
  "titulo_puesto",
  "descripcion_puesto",
  "salario_offrecido",
  "modalidad",
  "responsabilidades",
  "requisitos",
  "tipo_contrato",
  "educacion",
  "idiomas"
];

const getField = (id) => document.getElementById(id);

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`
});

const cargarOpciones = async (endpoint, selectId, placeholder, valueKey, labelBuilder) => {
  const select = getField(selectId);
  if (!select) return;

  const response = await fetch(`${API_URL}${endpoint}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudieron cargar las opciones del formulario");
  }

  select.innerHTML = [
    `<option value="" disabled selected>${placeholder}</option>`,
    ...data.map((item) => `<option value="${item[valueKey]}">${labelBuilder(item)}</option>`)
  ].join("");
};

const cargarCatalogos = async () => {
  await Promise.all([
    cargarOpciones(
      "/catalogos/categorias",
      "id_categoria_fk",
      "Selecciona una categoria",
      "id_categoria",
      (item) => item.nombre_categoria
    ),
    cargarOpciones(
      "/catalogos/municipios-agrupados",
      "id_municipio_fk",
      "Selecciona municipio",
      "id_municipio",
      (item) => `${item.nombre_municipio} - ${item.nombre_departamento}`
    )
  ]);
};

const obtenerPayload = () => {
  const missing = fieldIds.filter((id) => !getField(id));
  if (missing.length) {
    throw new Error(`Faltan campos en la vista: ${missing.join(", ")}`);
  }

  
  const valCategoria = getField("id_categoria_fk").value;
  const valMunicipio = getField("id_municipio_fk").value;
  const valSalario = getField("salario_offrecido").value;

  
  if (!valCategoria) throw new Error("Por favor, selecciona una categoría válida de la lista.");
  if (!valMunicipio) throw new Error("Por favor, selecciona un municipio válido de la lista.");
  if (!valSalario) throw new Error("Por favor, ingresa un salario ofrecido.");

 
  const payload = {
    id_categoria_fk: Number(valCategoria),
    id_municipio_fk: Number(valMunicipio),
    titulo_puesto: getField("titulo_puesto").value.trim(),
    descripcion_puesto: getField("descripcion_puesto").value.trim(),
    responsabilidades: getField("responsabilidades").value.trim(),
    requisitos: getField("requisitos").value.trim(),
    salario_offrecido: Number(valSalario),
    modalidad: getField("modalidad").value.trim(),
    tipo_contrato: getField("tipo_contrato").value.trim(),
    educacion: getField("educacion").value.trim(),
    idiomas: getField("idiomas").value.trim()
  };

 
  const vacios = Object.entries(payload)
    .filter(([_, value]) => value === "")
    .map(([key]) => key);

  if (vacios.length) {
    throw new Error(`Completa todos los campos obligatorios: ${vacios.join(", ")}`);
  }

  return payload;
};

const enviarVacante = async () => {
  try {
    const response = await fetch(`${API_URL}/vacantes`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(obtenerPayload())
    });

    const data = await response.json();
    if (!response.ok) {
      const errores = Array.isArray(data.errores)
        ? data.errores.map((item) => item.msg).join(", ")
        : null;
      throw new Error(errores || data.mensaje || data.error || "Error al publicar la vacante");
    }

    const modal = modalPaso2 && window.bootstrap?.Modal
      ? window.bootstrap.Modal.getInstance(modalPaso2)
      : null;
    modal?.hide();

    alert("Vacante publicada con exito en Workly.");
    window.location.href = "../misvacantes/index.html";
  } catch (error) {
    console.error(error);
    alert(`Ocurrio un error: ${error.message}`);
  }
};

if (formVacante) {
  formVacante.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}

if (btnConfirmarFinal) {
  btnConfirmarFinal.addEventListener("click", (event) => {
    event.preventDefault();
    enviarVacante();
  });
}

cargarCatalogos().catch((error) => {
  console.error(error);
  alert(error.message || "No se pudieron cargar las categorias y municipios.");
});
