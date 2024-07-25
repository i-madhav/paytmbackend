import { Router } from "express";
import { userSignUp } from "../controller/user.controller.js";

const router = Router();
router.route("/signup").post(userSignUp);
export default router;