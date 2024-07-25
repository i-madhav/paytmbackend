import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import AsyncHandler from "../utils/AsyncHandler.js"
import { User } from "../models/user.model.js";
import { z } from "zod";
import { response } from "express";

const signUpAuthentication = z.object({
    userName: z.string().min(3).max(30).trim().toLowerCase(),
    firstName: z.string().min(3).max(30).trim().toLowerCase(),
    lastName: z.string().min(3).max(30).trim().toLowerCase(),
    // giving regex to my password that it should follow a certain way !!
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
})

const userSignUp = AsyncHandler(async (req, res) => {
    // const {userName , firstName , lastName , password} = req.body;
    // const{success} = signUpAuthentication.safeParse(req.body);
    // if(!success) throw new ApiError(404 , "Fields are empty or not filled properly !")

    const result = signUpAuthentication.safeParse(req.body);
    if (!result.success) {
        const errorMssg = result.error.errors.map(err => err.message).join(", ");
        throw new ApiError(400, `Validation Failed ${errorMssg}`)
    }

    const { userName, firstName, lastName, password } = result.data;

    const existedUser = await User.findOne({
        $or: [{ userName }]
    })

    if (existedUser) throw new ApiError(500, "user already exist with this userName")

    const user = await User.create({
        userName: userName,
        firstName: firstName,
        lastName: lastName,
        password: password
    })

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) throw new ApiError(404, "unable to create a user");

    return res.status(200).json(new ApiResponse(200, createdUser, "successfully created the user"));
})
export { userSignUp };