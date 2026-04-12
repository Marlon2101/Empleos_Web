import { requireAuth, logout } from "../../../assets/js/shared/auth.js";

requireAuth(["usuario"]);

const btnLogout = document.getElementById("btnLogout");
btnLogout.addEventListener("click", logout);