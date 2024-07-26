import { Router } from "express";
import userRouter from "./user.route.js";
import accRoute from "./account.route.js";
const routerInd = Router();

routerInd.use("/user" , userRouter);
routerInd.use("/account" , accRoute)

export default routerInd;