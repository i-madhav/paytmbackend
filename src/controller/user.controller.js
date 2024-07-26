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
    password: z.string().min(8, "Password must be at least 8 characters long")
})

const updateUserInfAuthentication = z.object({
    firstName: z.string().min(3).max(30).trim().toLowerCase(),
    lastName: z.string().min(3).max(30).trim().toLowerCase(),
    oldpassword: z.string().min(8, "Password must be at least 8 character long"),
    newpassword: z.string().min(8, "Password must be at least 8 character long")
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

const userSignIn = AsyncHandler(async (req, res) => {
    const { userName, password } = req.body;
    if (!userName || !password) throw new ApiError(400, "Either of the fields are wrong ! please try again");

    const user = await User.findOne({
        $or: [{ userName }]
    })

    console.log(user);

    if (!user) throw new ApiError(400, "Invalid user credentials");
    const isPasswordValid = await user.passwordValid(password);

    if (!isPasswordValid) throw new ApiError(400, "Incorrect password");

    const accessToken = await user.generateAccessToken();
    if (!accessToken) throw new ApiError(404, "accessToken not found");

    const SignInUser = await User.findById(user._id).select("-password");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(200, {
            SignInUser, accessToken
        }, "user signIn successfully"))

});

const updateUserInformation = AsyncHandler(async (req, res) => {
    const result = updateUserInfAuthentication.safeParse(req.body);

    if (!result.success) {
        const errMssg = result.error.errors.map(err => err.message).join(", ");
        throw new ApiError(401, `${errMssg}`);
    }

    const { firstName, lastName, oldpassword, newpassword } = result.data;

    const user = await User.findById(req?.user?._id)
    const oldPass = await user.passwordValid(oldpassword);

    if (!oldPass) throw new ApiError(401, "Enter your previous password correctly");

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (newpassword) user.password = newpassword

    await user.save({ validation: false });

    const updatedUser = await User.findById(user._id).select("-password");

    return res.status(200)
        .json(new ApiResponse(200, { updatedUser }, "user Updated Successfully"));
});

const getSearchedUser = AsyncHandler(async (req, res) => {
    const { searchText } = req.body;
    if(!searchText || searchText.trim().length === 0) return

    if (!searchText) return;
    const users = await User.find({
        $or: [
            {
                firstName: {
                    // used to find substring in the database
                    "$regex": searchText
                }
            },
            {
                lastName: {
                    "$regex": searchText
                }
            }
        ]
    }).select("-password");



    return res.status(200)
        .json(new ApiResponse(200, users.map(user => ({ firstName: user.firstName, lastName: user.lastName, _id: user._id })), "All the users matching with the string"));
})

export { userSignUp, userSignIn, updateUserInformation, getSearchedUser};