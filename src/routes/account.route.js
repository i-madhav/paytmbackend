import { Router } from "express";
import { authentication } from "../middleware/auth.middleware.js";
import { getUserBalance } from "../controller/account.contoller.js";
const accRoute = Router();

accRoute.route("/balance").get(authentication , getUserBalance)
export default accRoute;