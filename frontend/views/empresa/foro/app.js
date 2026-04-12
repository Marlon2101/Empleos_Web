import { requireAuth, logout } from "../../../assets/js/shared/auth.js";

requireAuth(["empresa"]);

const btnLogout = document.getElementById("btnLogout");
const formForo = document.getElementById("formForo");

btnLogout.addEventListener("click", logout);

formForo.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("Esta vista es visual por ahora. Cuando quieras, después conectamos el backend del foro.");
});