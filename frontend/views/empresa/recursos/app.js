import { requireAuth, logout } from "../../../assets/js/shared/auth.js";

requireAuth(["empresa"]);

const btnLogout = document.getElementById("btnLogout");
btnLogout.addEventListener("click", logout);