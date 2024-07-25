import { Router } from "express";
import userRouter from "./user.route.js";
const routerInd = Router();

routerInd.use("/user" , userRouter);
export default routerInd;