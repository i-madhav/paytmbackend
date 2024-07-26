import { Account } from "../models/accounts.modal.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";

const getUserBalance = AsyncHandler(async(req , res) => {
    const account = await Account.findById(req?.user?._id).select("-_id");
    if(!account) throw new ApiError(401 , "Unable to fetch your balance");

    return res.status(200)
                .json(new ApiResponse(200 , account , "Fetched user bank balance successfully"));
})

export {getUserBalance};