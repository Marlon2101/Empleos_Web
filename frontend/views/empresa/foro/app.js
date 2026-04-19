import { getUsuario } from "../../../assets/js/shared/config.js";
import { requireAuth } from "../../../assets/js/shared/auth.js";
import {
  addCompanyForumComment,
  createCompanyForumPost,
  getCompanyForumPosts,
  incrementCompanyForumMetric,
  saveCompanyForumPosts,
  toggleCompanyForumSave
} from "../../../assets/js/shared/empresaForum.js";

requireAuth(["empresa"]);

const sectionRoot = document.querySelector("section.col-12.col-lg-8");
const sidebarRoot = document.querySelector("aside.col-12.col-lg-4");
const filterBar = document.querySelector(".filter-bar");
const inputBuscarForo = document.getElementById("inputBuscarForo");
let selectCategoria = filterBar?.querySelector("select");
let btnNuevoTema = document.getElementById("btnNuevoTema");
const modalResponder = document.getElementById("modalResponder");
const tituloTemaResponder = document.getElementById("tituloTemaResponder");
const btnEnviarRespuesta = document.getElementById("btnEnviarRespuesta");
const toastTexto = document.getElementById("toastTexto");
const toastExitoTexto = document.getElementById("toastExitoTexto");

let composerTextarea = document.getElementById("textoPublicacion");
let btnGuardarTema = document.getElementById("btnGuardarTema");
let btnPublicarTema = document.getElementById("btnPublicarTema");
let searchButton = filterBar?.querySelector("button.btn-outline-primary-deep");
let currentReplyPostId = null;
let selectedCategory = "Todas las categorias";

const showToast = (kind, message) => {
  const id = kind === "success" ? "toastExito" : "toastAccion";
  const targetText = kind === "success" ? toastExitoTexto : toastTexto;
  const target = document.getElementById(id);
  if (targetText) targetText.textContent = message;
  if (target && window.bootstrap?.Toast) {
    new window.bootstrap.Toast(target).show();
  }
};

const getCompanyName = () => {
  const usuario = getUsuario();
  return usuario?.nombre_comercial || usuario?.empresa || "Empresa";
};

const getCompanyInitials = () =>
  getCompanyName()
    .split(" ")
    .map((item) => item.trim().charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "EM";

const formatRelativeDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Reciente";

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "Hace unos minutos";
  if (diffHours < 24) return `Hace ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  return diffDays === 1 ? "Ayer" : `Hace ${diffDays} dias`;
};

const getSelectedComposerCategory = () =>
  document.querySelector(".category-badge.active")?.textContent?.trim() || "Vacantes";

const createPostsContainer = () => {
  if (!sectionRoot) return null;

  const cards = [...sectionRoot.querySelectorAll(".forum-card")];
  cards.slice(1).forEach((card) => card.remove());

  let container = document.getElementById("foroPostsContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "foroPostsContainer";
    sectionRoot.appendChild(container);
  }

  return container;
};

const createSidebarContainers = () => {
  if (!sidebarRoot) return {};

  const cards = [...sidebarRoot.querySelectorAll(".sidebar-card")];
  const [categoriesCard, recentsCard, activityCard] = cards;

  if (categoriesCard) {
    categoriesCard.innerHTML = `
      <h6 class="fw-bold mb-3 d-flex align-items-center"><i class="bi bi-tags me-2" style="color: var(--primary-deep);"></i>Categorias populares</h6>
      <div class="d-flex flex-column gap-2" id="foroCategoriasPopulares"></div>
    `;
  }

  if (recentsCard) {
    recentsCard.innerHTML = `
      <h6 class="fw-bold mb-3 d-flex align-items-center"><i class="bi bi-clock-history me-2" style="color: var(--primary-deep);"></i>Temas recientes</h6>
      <div class="d-flex flex-column gap-3" id="foroTemasRecientes"></div>
    `;
  }

  if (activityCard) {
    activityCard.innerHTML = `
      <i class="bi bi-chat-quote-fill display-4 mb-2 opacity-50"></i>
      <h6 class="fw-bold mb-3">Actividad del foro</h6>
      <div class="d-flex justify-content-between small fw-semibold border-bottom border-light border-opacity-25 pb-2 mb-2">
        <span>Publicaciones totales</span><span class="badge bg-white text-dark rounded-pill" id="actividadPublicaciones">0</span>
      </div>
      <div class="d-flex justify-content-between small fw-semibold border-bottom border-light border-opacity-25 pb-2 mb-2">
        <span>Comentarios</span><span class="badge bg-white text-dark rounded-pill" id="actividadComentarios">0</span>
      </div>
      <div class="d-flex justify-content-between small fw-semibold">
        <span>Temas guardados</span><span class="badge bg-white text-dark rounded-pill" id="actividadGuardados">0</span>
      </div>
    `;
  }

  return {
    categoriesRoot: document.getElementById("foroCategoriasPopulares"),
    recentsRoot: document.getElementById("foroTemasRecientes")
  };
};

const normalizeCategory = (value = "") =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const getFilteredPosts = () => {
  const term = inputBuscarForo?.value.trim().toLowerCase() || "";
  const selectValue = selectCategoria?.value || "Todas las categorias";
  const activeCategory =
    selectedCategory !== "Todas las categorias" ? selectedCategory : selectValue;

  return getCompanyForumPosts().filter((post) => {
    const matchesSearch =
      !term ||
      [post.title, post.content, post.companyName, post.category].some((value) =>
        String(value || "").toLowerCase().includes(term)
      );

    const matchesCategory =
      normalizeCategory(activeCategory).includes("todas") ||
      normalizeCategory(post.category) === normalizeCategory(activeCategory);

    return matchesSearch && matchesCategory;
  });
};

const renderPosts = () => {
  const container = createPostsContainer();
  if (!container) return;

  const posts = getFilteredPosts();
  if (!posts.length) {
    container.innerHTML = `
      <div class="forum-card text-center">
        <i class="bi bi-search fs-1 text-muted opacity-50"></i>
        <h5 class="fw-bold mt-3">No hay temas para esos filtros</h5>
        <p class="text-muted mb-0">Prueba otra busqueda o publica un nuevo tema.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = posts
    .map(
      (post) => `
        <article class="forum-card" data-post-id="${post.id}">
          <div class="d-flex gap-3 mb-3">
            <div class="avatar-circle">${post.authorInitials}</div>
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h6 class="fw-bold mb-1">${post.companyName}</h6>
                  <div class="d-flex align-items-center gap-2 flex-wrap">
                    <span class="text-secondary small"><i class="bi bi-clock me-1"></i>${formatRelativeDate(post.createdAt)}</span>
                    <span class="category-badge">${post.category}</span>
                  </div>
                </div>
                <i class="bi bi-three-dots-vertical text-secondary"></i>
              </div>
            </div>
          </div>
          <h5 class="fw-bold mb-3">${post.title}</h5>
          <p class="text-secondary mb-4">${post.content}</p>
          <div class="d-flex flex-wrap gap-2 mb-3">
            <button class="btn btn-outline-primary-deep rounded-pill" data-action="like" data-id="${post.id}">
              <i class="bi bi-hand-thumbs-up me-1"></i>${post.likes}
            </button>
            <button class="btn btn-outline-primary-deep rounded-pill" data-action="comment" data-id="${post.id}" data-title="${post.title}">
              <i class="bi bi-chat-left-text me-1"></i>${post.comments.length}
            </button>
            <button class="btn btn-outline-primary-deep rounded-pill" data-action="share" data-id="${post.id}">
              <i class="bi bi-share me-1"></i>${post.shares}
            </button>
            <button class="btn btn-outline-primary-deep rounded-pill" data-action="save" data-id="${post.id}">
              <i class="bi ${post.saved ? "bi-bookmark-check-fill" : "bi-bookmark"} me-1"></i>${post.saved ? "Guardado" : "Guardar"}
            </button>
          </div>
          <div class="bg-light rounded-4 p-3">
            <div class="small fw-semibold mb-2">Comentarios recientes</div>
            ${
              post.comments.length
                ? post.comments
                    .slice(-2)
                    .reverse()
                    .map(
                      (comment) => `
                        <div class="border rounded-4 bg-white p-3 mb-2">
                          <div class="fw-semibold small">${comment.author}</div>
                          <div class="text-muted small mb-1">${formatRelativeDate(comment.createdAt)}</div>
                          <div>${comment.content}</div>
                        </div>
                      `
                    )
                    .join("")
                : '<div class="text-muted small">Todavia no hay comentarios en este tema.</div>'
            }
          </div>
        </article>
      `
    )
    .join("");

  container.querySelectorAll("[data-action='like']").forEach((button) => {
    button.addEventListener("click", () => {
      incrementCompanyForumMetric(button.dataset.id, "likes");
      renderAll();
      showToast("success", "Like registrado.");
    });
  });

  container.querySelectorAll("[data-action='share']").forEach((button) => {
    button.addEventListener("click", async () => {
      incrementCompanyForumMetric(button.dataset.id, "shares");
      renderAll();
      const url = window.location.href.split("?")[0];
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
        }
      } catch {
        // Ignore clipboard errors inside the sandbox/browser environment.
      }
      showToast("success", "Enlace copiado y tema marcado como compartido.");
    });
  });

  container.querySelectorAll("[data-action='save']").forEach((button) => {
    button.addEventListener("click", () => {
      toggleCompanyForumSave(button.dataset.id);
      renderAll();
      showToast("success", "Tema actualizado en tus guardados.");
    });
  });

  container.querySelectorAll("[data-action='comment']").forEach((button) => {
    button.addEventListener("click", () => {
      currentReplyPostId = button.dataset.id;
      if (tituloTemaResponder) {
        tituloTemaResponder.textContent = `"${button.dataset.title}"`;
      }
      const modal = modalResponder && window.bootstrap?.Modal
        ? window.bootstrap.Modal.getOrCreateInstance(modalResponder)
        : null;
      modal?.show();
    });
  });
};

const renderSidebar = () => {
  const { categoriesRoot, recentsRoot } = createSidebarContainers();
  const posts = getCompanyForumPosts();

  const counts = posts.reduce((acc, post) => {
    const key = post.category || "General";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  if (categoriesRoot) {
    categoriesRoot.innerHTML = [
      { label: "Todas las categorias", total: posts.length },
      ...Object.entries(counts).map(([label, total]) => ({ label, total }))
    ]
      .map(
        (item) => `
          <button type="button" class="d-flex justify-content-between text-start text-decoration-none text-dark fw-medium p-2 rounded-3 border-0 bg-transparent foro-category-filter ${normalizeCategory(selectedCategory) === normalizeCategory(item.label) ? "bg-light" : ""}" data-category="${item.label}">
            <span>${item.label}</span><span class="badge bg-light px-3 py-1">${item.total}</span>
          </button>
        `
      )
      .join("");

    categoriesRoot.querySelectorAll("[data-category]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedCategory = button.dataset.category;
        if (selectCategoria) {
          selectCategoria.value = button.dataset.category;
        }
        renderAll();
      });
    });
  }

  if (recentsRoot) {
    recentsRoot.innerHTML = posts
      .slice(0, 4)
      .map(
        (post) => `
          <button type="button" class="text-decoration-none text-start text-dark fw-medium d-block border-0 bg-transparent p-0 foro-recent-topic" data-title="${post.title}">
            ${post.title}
          </button>
        `
      )
      .join("");

    recentsRoot.querySelectorAll(".foro-recent-topic").forEach((button) => {
      button.addEventListener("click", () => {
        if (inputBuscarForo) {
          inputBuscarForo.value = button.dataset.title;
        }
        renderAll();
      });
    });
  }

  const totalComments = posts.reduce((acc, post) => acc + post.comments.length, 0);
  const totalSaved = posts.filter((post) => post.saved).length;
  const publicacionesNode = document.getElementById("actividadPublicaciones");
  const comentariosNode = document.getElementById("actividadComentarios");
  const guardadosNode = document.getElementById("actividadGuardados");

  if (publicacionesNode) publicacionesNode.textContent = String(posts.length);
  if (comentariosNode) comentariosNode.textContent = String(totalComments);
  if (guardadosNode) guardadosNode.textContent = String(totalSaved);
};

const publishTopic = () => {
  const content = composerTextarea?.value.trim();
  if (!content) {
    showToast("info", "Escribe algo antes de publicar.");
    composerTextarea?.focus();
    return;
  }

  createCompanyForumPost({
    companyName: getCompanyName(),
    authorInitials: getCompanyInitials(),
    content,
    category: getSelectedComposerCategory()
  });

  composerTextarea.value = "";
  selectedCategory = "Todas las categorias";
  if (selectCategoria) {
    selectCategoria.value = "Todas las categorias";
  }
  renderAll();
  showToast("success", "Tema publicado con exito en el foro.");
};

const bindComposerBadges = () => {
  document.querySelectorAll(".category-badge").forEach((badge) => {
    badge.addEventListener("click", () => {
      const allBadges = [...document.querySelectorAll(".category-badge")].filter(
        (item) => item.closest(".forum-card") === badge.closest(".forum-card")
      );
      allBadges.forEach((item) => {
        item.classList.remove("active");
        item.style.background = "#e9ecf9";
        item.style.color = "var(--primary-deep)";
      });
      badge.classList.add("active");
      badge.style.background = "var(--primary-deep)";
      badge.style.color = "white";
    });
  });
};

const replaceNode = (node) => {
  if (!node) return null;
  const clone = node.cloneNode(true);
  node.replaceWith(clone);
  return clone;
};

const bindTopBar = () => {
  searchButton = replaceNode(searchButton);
  selectCategoria = replaceNode(selectCategoria);
  btnGuardarTema = replaceNode(btnGuardarTema);
  btnPublicarTema = replaceNode(btnPublicarTema);
  btnNuevoTema = replaceNode(btnNuevoTema);

  searchButton?.addEventListener("click", (event) => {
    event.preventDefault();
    renderAll();
  });

  selectCategoria?.addEventListener("change", () => {
    selectedCategory = selectCategoria.value;
    renderAll();
  });

  inputBuscarForo?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      renderAll();
    }
  });

  btnNuevoTema?.addEventListener("click", () => {
    composerTextarea?.scrollIntoView({ behavior: "smooth", block: "center" });
    composerTextarea?.focus();
  });

  btnGuardarTema?.addEventListener("click", () => {
    showToast("success", "Borrador guardado correctamente.");
  });

  btnPublicarTema?.addEventListener("click", publishTopic);
  bindComposerBadges();
};

const bindReplySubmit = () => {
  btnEnviarRespuesta?.addEventListener("click", () => {
    const textarea = modalResponder?.querySelector("textarea");
    const content = textarea?.value.trim();

    if (!currentReplyPostId || !content) {
      showToast("info", "Escribe una respuesta antes de publicarla.");
      return;
    }

    addCompanyForumComment(currentReplyPostId, getCompanyName(), content);
    textarea.value = "";
    currentReplyPostId = null;
    renderAll();
    showToast("success", "Respuesta publicada con exito.");
  });
};

const ensureCategoryOptions = () => {
  if (!selectCategoria) return;

  const baseOptions = ["Todas las categorias", "Reclutamiento", "Vacantes", "Consejos", "Cultura"];
  selectCategoria.innerHTML = baseOptions
    .map(
      (option) => `
        <option ${normalizeCategory(option) === normalizeCategory(selectedCategory) ? "selected" : ""}>${option}</option>
      `
    )
    .join("");
};

const renderAll = () => {
  ensureCategoryOptions();
  renderPosts();
  renderSidebar();
};

const init = () => {
  composerTextarea = document.getElementById("textoPublicacion");
  btnGuardarTema = document.getElementById("btnGuardarTema");
  btnPublicarTema = document.getElementById("btnPublicarTema");
  searchButton = filterBar?.querySelector("button.btn-outline-primary-deep");

  bindTopBar();
  bindReplySubmit();
  renderAll();

  const posts = getCompanyForumPosts();
  saveCompanyForumPosts(posts);
};

init();
