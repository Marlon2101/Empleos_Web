export const goTo = (path) => {
  window.location.href = path;
};

export const getQueryParam = (key) => {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
};

export const formatDate = (value) => {
  if (!value) return "N/D";
  return new Date(value).toLocaleDateString("es-SV");
};

export const formatDateTime = (value) => {
  if (!value) return "N/D";
  return new Date(value).toLocaleString("es-SV");
};

export const formatCurrency = (value) => {
  return `$${Number(value ?? 0).toFixed(2)}`;
};

export const showInlineAlert = (container, message, type = "danger") => {
  container.innerHTML = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
};