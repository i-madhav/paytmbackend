import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js";

export const authentication = AsyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "").trim();
        if (!token) throw new ApiError(400, "Unauthorized access");
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);
        if (!user) throw new ApiError(400, "Invalid access");

        req.user = user
        next();

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Token")
    }
})