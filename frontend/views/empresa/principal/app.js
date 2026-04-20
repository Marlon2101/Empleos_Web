import { API_URL, getToken, getUsuario } from "../../../assets/js/shared/config.js";
import { requireAuth } from "../../../assets/js/shared/auth.js";
import {
  addCompanyForumComment,
  createCompanyForumPost,
  getCompanyForumPosts,
  incrementCompanyForumMetric,
  toggleCompanyForumSave
} from "../../../assets/js/shared/empresaForum.js";

requireAuth(["empresa"]);

const alertContainer = document.getElementById("alertContainer");
const totalVacantes = document.getElementById("totalVacantes");
const totalPostulaciones = document.getElementById("totalPostulaciones");
const textoVacantesResumen = document.getElementById("textoVacantesResumen");
const textoPostulacionesResumen = document.getElementById("textoPostulacionesResumen");
const inputBusquedaDashboard = document.getElementById("inputBusquedaDashboard");
const btnBuscarDashboard = document.getElementById("btnBuscarDashboard");
const btnIrPublicarVacante = document.getElementById("btnIrPublicarVacante");
let btnGuardarPub = document.getElementById("btnGuardarPub");
let btnPublicarPub = document.getElementById("btnPublicarPub");
const textareaPublicacion = document.getElementById("textareaPublicacion");

let dashboardData = {
  ultimasVacantes: [],
  ultimasPostulaciones: []
};

const getSidebarCardByTitle = (title) =>
  [...document.querySelectorAll(".sidebar-card")].find((card) =>
    card.querySelector("h6")?.textContent?.toLowerCase().includes(title.toLowerCase())
  );

const getPublicationFeedRoot = () => {
  let root = document.getElementById("feedPrincipalEmpresa");
  if (root) return root;

  const publicationCard = btnPublicarPub?.closest(".main-card");
  if (!publicationCard) return null;

  [...document.querySelectorAll("section.col-12.col-lg-8 > .post-card")].forEach((card) => card.remove());

  publicationCard.insertAdjacentHTML(
    "afterend",
    `
      <div class="d-flex align-items-center justify-content-between mb-3 mt-4">
        <h5 class="fw-bold mb-0" style="color: #121826;">Publicaciones recientes del foro</h5>
        <a href="../foro/index.html" class="text-decoration-none fw-semibold" style="color: var(--primary-deep);">
          Ver foro completo <i class="bi bi-arrow-right"></i>
        </a>
      </div>
      <div id="feedPrincipalEmpresa"></div>
    `
  );

  return document.getElementById("feedPrincipalEmpresa");
};

const showAlert = (message, type = "danger") => {
  if (!alertContainer) return;
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show rounded-4 shadow-sm mb-4" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
    </div>
  `;
};

const showToast = (id, fallbackMessage) => {
  const element = document.getElementById(id);
  if (element && window.bootstrap?.Toast) {
    new window.bootstrap.Toast(element).show();
    return;
  }

  showAlert(fallbackMessage, "success");
};

const replaceNode = (node) => {
  if (!node) return null;
  const clone = node.cloneNode(true);
  node.replaceWith(clone);
  return clone;
};

const getCompanyDisplayName = () => {
  const usuario = getUsuario();
  return usuario?.nombre_comercial || usuario?.empresa || usuario?.correo_electronico || "Empresa";
};

const getCompanyInitials = () =>
  getCompanyDisplayName()
    .split(" ")
    .map((part) => part.trim().charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "EM";

const formatDateTime = (value) => {
  if (!value) return "Reciente";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Reciente";
  return date.toLocaleString("es-SV", { dateStyle: "medium", timeStyle: "short" });
};

const renderForumFeed = () => {
  const root = getPublicationFeedRoot();
  if (!root) return;

  const posts = getCompanyForumPosts().slice(0, 3);

  if (!posts.length) {
    root.innerHTML = `
      <div class="post-card text-center">
        <p class="text-muted mb-0">Todavia no hay publicaciones en el foro.</p>
      </div>
    `;
    return;
  }

  root.innerHTML = posts.map((post) => `
    <article class="post-card">
      <div class="d-flex gap-3 mb-3">
        <div class="bg-light rounded-4 shadow-sm d-flex align-items-center justify-content-center fw-bold" style="width: 64px; height: 64px; color: var(--primary-deep);">
          ${post.authorInitials}
        </div>
        <div class="flex-grow-1">
          <div class="d-flex justify-content-between align-items-start gap-3">
            <div>
              <h6 class="fw-bold mb-1" style="color: #121826;">${post.companyName}</h6>
              <div class="d-flex flex-wrap gap-2 align-items-center">
                <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2">${post.category}</span>
                <span class="text-secondary small"><i class="bi bi-clock me-1"></i>${formatDateTime(post.createdAt)}</span>
              </div>
            </div>
            <a href="../foro/index.html" class="btn btn-sm btn-outline-primary-deep rounded-pill">Abrir foro</a>
          </div>
        </div>
      </div>
      <h5 class="fw-bold mb-2">${post.title}</h5>
      <p class="text-secondary mb-4">${post.content}</p>
      <div class="d-flex flex-wrap gap-2 mb-3">
        <button type="button" class="btn btn-sm btn-light rounded-pill px-4" data-action="like" data-id="${post.id}">
          <i class="bi bi-hand-thumbs-up"></i> ${post.likes}
        </button>
        <button type="button" class="btn btn-sm btn-light rounded-pill px-4" data-action="comment" data-id="${post.id}" data-title="${post.title}">
          <i class="bi bi-chat"></i> ${post.comments.length}
        </button>
        <button type="button" class="btn btn-sm btn-light rounded-pill px-4" data-action="share" data-id="${post.id}">
          <i class="bi bi-share"></i> ${post.shares}
        </button>
        <button type="button" class="btn btn-sm btn-light rounded-pill px-4" data-action="save" data-id="${post.id}">
          <i class="bi ${post.saved ? "bi-bookmark-check-fill" : "bi-bookmark"}"></i> ${post.saved ? "Guardado" : "Guardar"}
        </button>
      </div>
      <div class="bg-light rounded-4 p-3">
        <div class="small fw-semibold mb-2">Comentarios recientes</div>
        ${
          post.comments.length
            ? post.comments.slice(-2).reverse().map((comment) => `
                <div class="border rounded-4 bg-white p-3 mb-2">
                  <div class="fw-semibold small">${comment.author}</div>
                  <div class="text-muted small mb-1">${formatDateTime(comment.createdAt)}</div>
                  <div>${comment.content}</div>
                </div>
              `).join("")
            : '<div class="text-muted small">Todavia no hay comentarios en esta publicacion.</div>'
        }
      </div>
    </article>
  `).join("");

  root.querySelectorAll("[data-action='like']").forEach((button) => {
    button.addEventListener("click", () => {
      incrementCompanyForumMetric(button.dataset.id, "likes");
      renderForumFeed();
      showAlert("Like registrado.", "success");
    });
  });

  root.querySelectorAll("[data-action='share']").forEach((button) => {
    button.addEventListener("click", async () => {
      incrementCompanyForumMetric(button.dataset.id, "shares");
      renderForumFeed();
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch (error) {
        console.error(error);
      }
      showAlert("Enlace copiado y publicacion marcada como compartida.", "success");
    });
  });

  root.querySelectorAll("[data-action='save']").forEach((button) => {
    button.addEventListener("click", () => {
      toggleCompanyForumSave(button.dataset.id);
      renderForumFeed();
      showAlert("Guardado actualizado.", "success");
    });
  });

  root.querySelectorAll("[data-action='comment']").forEach((button) => {
    button.addEventListener("click", () => {
      const respuesta = window.prompt(`Escribe un comentario para "${button.dataset.title}"`);
      if (!respuesta || !respuesta.trim()) return;
      addCompanyForumComment(button.dataset.id, getCompanyDisplayName(), respuesta.trim());
      renderForumFeed();
      showAlert("Comentario agregado.", "success");
    });
  });
};

const renderSidebarVacantes = () => {
  const card = getSidebarCardByTitle("Vacantes activas");
  if (!card) return;

  const countNode = card.querySelector(".fw-bold.fs-4");
  const badgeNode = card.querySelector(".badge");
  const detailNode = card.querySelector("p.small");
  const progressNode = card.querySelector(".activity-fill");
  const actionButton = card.querySelector("button");
  const total = Number(dashboardData.metricas?.total_vacantes || 0);

  if (countNode) countNode.textContent = String(total);
  if (badgeNode) badgeNode.textContent = total > 0 ? `${total} activas` : "Sin vacantes";
  if (detailNode) detailNode.textContent = total > 0 ? `${total} vacantes publicadas en este momento.` : "Todavia no has publicado vacantes.";
  if (progressNode) progressNode.style.width = `${Math.min(100, total * 10)}%`;
  actionButton?.addEventListener("click", () => {
    window.location.href = "../misvacantes/index.html";
  });
};

const renderSidebarPostulaciones = () => {
  const card = getSidebarCardByTitle("Postulantes recientes");
  if (!card) return;

  const list = card.querySelector("ul");
  const button = card.querySelector("button");
  const items = Array.isArray(dashboardData.ultimasPostulaciones) ? dashboardData.ultimasPostulaciones : [];

  if (button) {
    button.innerHTML = `Ver todos (${dashboardData.metricas?.total_postulaciones ?? 0}) <i class="bi bi-arrow-right ms-1"></i>`;
    button.addEventListener("click", () => {
      window.location.href = "../postulaciones/index.html";
    });
  }

  if (!list) return;
  if (!items.length) {
    list.innerHTML = `<li class="text-muted">No hay postulantes recientes todavia.</li>`;
    return;
  }

  list.innerHTML = items.map((item, index) => `
    <li class="d-flex align-items-center gap-3 mb-3">
      <div class="position-relative">
        <i class="bi bi-person-circle fs-2" style="color: ${index === 0 ? "var(--primary-deep)" : "#5a6ab0"};"></i>
        ${index === 0 ? '<span class="position-absolute bottom-0 end-0 bg-success rounded-circle p-1 border border-white" style="width: 10px; height: 10px;"></span>' : ""}
      </div>
      <div class="flex-grow-1">
        <span class="fw-semibold">${item.nombre_usuario}</span>
        <p class="small text-secondary mb-0">${item.titulo_puesto} · ${formatDateTime(item.fecha_postulacion)}</p>
      </div>
      <span class="badge bg-light text-dark">${item.nombre_estado}</span>
    </li>
  `).join("");
};

const updateMetrics = () => {
  const totalVacantesValue = dashboardData.metricas?.total_vacantes ?? 0;
  const totalPostulacionesValue = dashboardData.metricas?.total_postulaciones ?? 0;

  if (totalVacantes) totalVacantes.textContent = String(totalVacantesValue);
  if (totalPostulaciones) totalPostulaciones.textContent = String(totalPostulacionesValue);
  if (textoVacantesResumen) {
    textoVacantesResumen.innerHTML = `<i class="bi bi-clock"></i> ${totalVacantesValue > 0 ? "Actualizado desde la API" : "Sin vacantes activas"}`;
  }
  if (textoPostulacionesResumen) {
    textoPostulacionesResumen.innerHTML = `<i class="bi bi-arrow-up-short"></i> ${totalPostulacionesValue > 0 ? "Actualizado desde la API" : "Sin postulaciones"}`;
  }
};

const searchDashboard = () => {
  const term = inputBusquedaDashboard?.value.trim().toLowerCase();
  if (!term) {
    showAlert("Escribe un termino para buscar vacantes, postulantes o publicaciones.", "warning");
    inputBusquedaDashboard?.focus();
    return;
  }

  const vacantes = dashboardData.ultimasVacantes.filter((item) =>
    [item.titulo_puesto, item.modalidad].some((value) => String(value || "").toLowerCase().includes(term))
  );

  const postulaciones = dashboardData.ultimasPostulaciones.filter((item) =>
    [item.nombre_usuario, item.titulo_puesto, item.nombre_estado].some((value) => String(value || "").toLowerCase().includes(term))
  );

  const posts = getCompanyForumPosts().filter((post) =>
    [post.title, post.content, post.category].some((value) => String(value || "").toLowerCase().includes(term))
  );

  const totalMatches = vacantes.length + postulaciones.length + posts.length;
  if (!totalMatches) {
    showAlert(`No encontramos resultados para "${term}".`, "warning");
    return;
  }

  showAlert(`Se encontraron <strong>${totalMatches}</strong> coincidencias para <strong>${term}</strong>. Vacantes: ${vacantes.length}, postulantes: ${postulaciones.length}, publicaciones: ${posts.length}.`, "success");
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const handlePublish = () => {
  const content = textareaPublicacion?.value.trim();
  if (!content) {
    showAlert("Escribe una publicacion antes de enviarla al foro.", "warning");
    textareaPublicacion?.focus();
    return;
  }

  const activeCategory = document.querySelector(".badge-category.active")?.textContent?.trim() || "Vacante";
  createCompanyForumPost({
    companyName: getCompanyDisplayName(),
    authorInitials: getCompanyInitials(),
    content,
    category: activeCategory
  });

  textareaPublicacion.value = "";
  renderForumFeed();
  showToast("toastPublicado", "Publicacion realizada con exito.");
  showAlert("La publicacion ya aparece en el foro de empresas.", "success");
};

const bindCategoryBadges = () => {
  document.querySelectorAll(".badge-category").forEach((badge) => {
    badge.addEventListener("click", () => {
      document.querySelectorAll(".badge-category").forEach((item) => {
        item.classList.remove("active");
        item.style.background = "#f0f4ff";
        item.style.color = "var(--primary-deep)";
      });
      badge.classList.add("active");
      badge.style.background = "var(--primary-deep)";
      badge.style.color = "white";
    });
  });
};

const bindEvents = () => {
  btnGuardarPub = replaceNode(btnGuardarPub);
  btnPublicarPub = replaceNode(btnPublicarPub);

  btnBuscarDashboard?.addEventListener("click", searchDashboard);
  inputBusquedaDashboard?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      searchDashboard();
    }
  });

  btnIrPublicarVacante?.addEventListener("click", () => {
    window.location.href = "../publicarvacante/index.html";
  });

  btnGuardarPub?.addEventListener("click", () => {
    showToast("toastGuardado", "Borrador guardado correctamente.");
  });

  btnPublicarPub?.addEventListener("click", handlePublish);
  bindCategoryBadges();
};

const fetchDashboard = async () => {
  const response = await fetch(`${API_URL}/dashboard/empresa`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.mensaje || "No se pudo cargar el dashboard");
  }

  dashboardData = {
    ...data,
    ultimasVacantes: Array.isArray(data.ultimasVacantes) ? data.ultimasVacantes : [],
    ultimasPostulaciones: Array.isArray(data.ultimasPostulaciones) ? data.ultimasPostulaciones : []
  };
};

const init = async () => {
  bindEvents();
  renderForumFeed();
  await fetchDashboard();
  updateMetrics();
  renderSidebarVacantes();
  renderSidebarPostulaciones();
};

init().catch((error) => {
  console.error(error);
  showAlert(error.message || "No se pudo cargar la vista principal de empresa");
});
