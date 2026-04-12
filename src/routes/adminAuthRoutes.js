import { Router } from "express";
import { loginAdminTemporal } from "../controllers/adminAuthController.js";

const router = Router();

router.post("/login", loginAdminTemporal);

export default router;