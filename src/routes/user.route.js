import { Router } from "express";
import { updateUserInformation, userSignIn, userSignUp } from "../controller/user.controller.js";
import { authentication } from "../middleware/auth.middleware.js";

const router = Router();
router.route("/signup").post(userSignUp);
router.route("/signin").post(userSignIn);

// secured routes
router.route("updateuser").post(authentication , updateUserInformation)
export default router;