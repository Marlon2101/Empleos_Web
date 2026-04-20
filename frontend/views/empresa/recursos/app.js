import { requireAuth } from "../../../assets/js/shared/auth.js";

requireAuth(["empresa"]);

const inputBuscar = document.getElementById("inputBuscarRecursos");
const filtroCategoria = document.getElementById("filtroCategoria");
const btnBuscar = document.getElementById("btnBuscarRecursos");
const gridRecursos = document.getElementById("gridRecursos");
const emptyRecursos = document.getElementById("emptyRecursos");
const contadorResultados = document.getElementById("contadorResultados");
const estadoResultados = document.getElementById("estadoResultados");
const contadorRecursos = document.getElementById("contadorRecursos");
const toastElement = document.getElementById("toastAccion");
const toastTexto = document.getElementById("toastTexto");

const toast = toastElement ? new bootstrap.Toast(toastElement) : null;

const normalizar = (valor = "") =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const obtenerRecursos = () => [...document.querySelectorAll(".recurso-item")];

const actualizarEstado = (visibles) => {
  contadorResultados.textContent = `${visibles} resultado${visibles === 1 ? "" : "s"}`;
  contadorRecursos.textContent = String(obtenerRecursos().length);

  if (visibles === obtenerRecursos().length) {
    estadoResultados.textContent = "Mostrando todos los recursos disponibles.";
    return;
  }

  estadoResultados.textContent = visibles
    ? "Mostrando solo los recursos que coinciden con tu búsqueda."
    : "No hubo coincidencias con los filtros actuales.";
};

const aplicarFiltros = () => {
  const termino = normalizar(inputBuscar?.value || "");
  const categoria = normalizar(filtroCategoria?.value || "");

  let visibles = 0;

  obtenerRecursos().forEach((item) => {
    const titulo = normalizar(item.dataset.titulo || "");
    const itemCategoria = normalizar(item.dataset.categoria || "");
    const coincideTexto = !termino || titulo.includes(termino);
    const coincideCategoria = !categoria || itemCategoria === categoria;
    const visible = coincideTexto && coincideCategoria;

    item.classList.toggle("d-none", !visible);
    if (visible) visibles += 1;
  });

  emptyRecursos.classList.toggle("d-none", visibles > 0);
  gridRecursos.classList.toggle("d-none", visibles === 0);
  actualizarEstado(visibles);
};

const mostrarToast = (mensaje) => {
  if (!toast || !toastTexto) return;
  toastTexto.innerHTML = `<i class="bi bi-info-circle-fill me-2"></i>${mensaje}`;
  toast.show();
};

btnBuscar?.addEventListener("click", aplicarFiltros);
inputBuscar?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    aplicarFiltros();
  }
});

filtroCategoria?.addEventListener("change", aplicarFiltros);

document.querySelectorAll(".category-row").forEach((button) => {
  button.addEventListener("click", () => {
    filtroCategoria.value = button.dataset.categoria || "";
    aplicarFiltros();
  });
});

document.querySelectorAll(".btn-recurso").forEach((button) => {
  button.addEventListener("click", () => {
    mostrarToast(button.dataset.accion || "Accion ejecutada.");
  });
});

aplicarFiltros();
