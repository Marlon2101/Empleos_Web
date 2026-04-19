const STORAGE_KEY = "workly_empresa_forum_posts";

const DEFAULT_POSTS = [
  {
    id: "seed-1",
    companyName: "TechSolutions",
    authorInitials: "TS",
    title: "Que preguntas recomiendan para una entrevista tecnica?",
    content: "Estamos contratando desarrolladores backend y queremos mejorar nuestro proceso de seleccion. Que preguntas tecnicas o situacionales consideran utiles para evaluar experiencia real en APIs, bases de datos y resolucion de problemas?",
    category: "Reclutamiento",
    createdAt: "2026-04-18T10:00:00.000Z",
    likes: 18,
    views: 42,
    shares: 6,
    saved: false,
    comments: [
      {
        id: "seed-1-comment-1",
        author: "Innovate El Salvador",
        content: "Nos funciona mezclar un caso practico pequeno con preguntas sobre decisiones tecnicas.",
        createdAt: "2026-04-18T13:30:00.000Z"
      }
    ]
  },
  {
    id: "seed-2",
    companyName: "Innovate El Salvador",
    authorInitials: "IE",
    title: "Beneficios que realmente valoran los desarrolladores",
    content: "Mas alla del salario competitivo, hemos notado que ofrecer modalidad hibrida y seguro medico ha incrementado nuestra retencion de talento. Que otros beneficios no tradicionales les han funcionado?",
    category: "Cultura",
    createdAt: "2026-04-17T15:00:00.000Z",
    likes: 24,
    views: 156,
    shares: 9,
    saved: true,
    comments: [
      {
        id: "seed-2-comment-1",
        author: "TechSolutions",
        content: "El horario flexible y un presupuesto anual de capacitacion nos ha dado muy buen resultado.",
        createdAt: "2026-04-17T18:15:00.000Z"
      }
    ]
  }
];

const normalizePosts = (posts) =>
  posts.map((post) => ({
    ...post,
    likes: Number(post.likes || 0),
    views: Number(post.views || 0),
    shares: Number(post.shares || 0),
    saved: Boolean(post.saved),
    comments: Array.isArray(post.comments) ? post.comments : []
  }));

const persistPosts = (posts) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

export const getCompanyForumPosts = () => {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    persistPosts(DEFAULT_POSTS);
    return normalizePosts(DEFAULT_POSTS);
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      persistPosts(DEFAULT_POSTS);
      return normalizePosts(DEFAULT_POSTS);
    }

    return normalizePosts(parsed);
  } catch {
    persistPosts(DEFAULT_POSTS);
    return normalizePosts(DEFAULT_POSTS);
  }
};

export const saveCompanyForumPosts = (posts) => {
  persistPosts(normalizePosts(posts));
};

const getInitials = (value = "") =>
  value
    .split(" ")
    .map((part) => part.trim().charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "WK";

const buildTitle = (content) => {
  const clean = String(content || "").trim().replace(/\s+/g, " ");
  if (!clean) return "Nueva publicacion";

  const firstSentence = clean.split(/[.!?]/)[0]?.trim() || clean;
  return firstSentence.length > 70 ? `${firstSentence.slice(0, 67)}...` : firstSentence;
};

export const createCompanyForumPost = ({
  companyName,
  authorInitials,
  content,
  category
}) => {
  const posts = getCompanyForumPosts();
  const newPost = {
    id: `post-${Date.now()}`,
    companyName: companyName || "Empresa",
    authorInitials: authorInitials || getInitials(companyName),
    title: buildTitle(content),
    content: String(content || "").trim(),
    category: category || "Vacantes",
    createdAt: new Date().toISOString(),
    likes: 0,
    views: 1,
    shares: 0,
    saved: false,
    comments: []
  };

  const nextPosts = [newPost, ...posts];
  saveCompanyForumPosts(nextPosts);
  return newPost;
};

export const toggleCompanyForumSave = (postId) => {
  const posts = getCompanyForumPosts();
  const nextPosts = posts.map((post) =>
    post.id === postId ? { ...post, saved: !post.saved } : post
  );
  saveCompanyForumPosts(nextPosts);
  return nextPosts.find((post) => post.id === postId) || null;
};

export const incrementCompanyForumMetric = (postId, metric) => {
  const posts = getCompanyForumPosts();
  const nextPosts = posts.map((post) =>
    post.id === postId
      ? { ...post, [metric]: Number(post[metric] || 0) + 1 }
      : post
  );
  saveCompanyForumPosts(nextPosts);
  return nextPosts.find((post) => post.id === postId) || null;
};

export const addCompanyForumComment = (postId, author, content) => {
  const posts = getCompanyForumPosts();
  const nextPosts = posts.map((post) => {
    if (post.id !== postId) return post;

    return {
      ...post,
      comments: [
        ...post.comments,
        {
          id: `comment-${Date.now()}`,
          author: author || "Empresa",
          content: String(content || "").trim(),
          createdAt: new Date().toISOString()
        }
      ]
    };
  });

  saveCompanyForumPosts(nextPosts);
  return nextPosts.find((post) => post.id === postId) || null;
};
