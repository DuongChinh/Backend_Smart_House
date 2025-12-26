// routes/deviceRoute.js
import express from "express";
import { registerDevice } from "../controllers/deviceController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.post("/", auth, registerDevice);

export default router;
