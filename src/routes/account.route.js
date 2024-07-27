import { Router } from "express";
import { authentication } from "../middleware/auth.middleware.js";
import { getUserBalance, transferMoney } from "../controller/account.contoller.js";
const accRoute = Router();

accRoute.route("/balance").get(authentication , getUserBalance);
accRoute.route("/transfer").post(authentication , transferMoney);

export default accRoute;