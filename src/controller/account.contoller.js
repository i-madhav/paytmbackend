import { z } from "zod";
import { Account } from "../models/accounts.modal.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const transferMoneyInforAuthentication = z.object({
    to: z.string(),
    amount: z.number().min(1)
})

const getUserBalance = AsyncHandler(async (req, res) => {
    const account = await Account.findOne({
        $or: [{ user: req?.user?._id }]
    });

    if (!account) throw new ApiError(401, "Enable to fetch account");

    return res.status(200)
        .json(new ApiResponse(200, { balance: account.balance }, "Fetched user bank balance successfully"));
});

const transferMoney = AsyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const result = transferMoneyInforAuthentication.safeParse(req.body);
    if (!result.success) {
        const errMssg = result.error.errors.map(err => err.message).join(", ");
        throw new ApiError(400, `Enter Strong credentials ${errMssg}`)
    }
    const { to, amount } = result.data;

    const myAccount = await Account.findOne({ user: req?.user?._id }).session(session);
    if (!myAccount || myAccount.balance < amount) {
        throw new ApiError(400, "Insufficient balance")
    }

    const toAccount = await Account.findOne({ user: to }).session(session);
    if (!toAccount) throw new ApiError(400, "Invalid account , this account doesn't exist");

    // performing the transaction
    await Account.updateOne({ user: myAccount.user }, { $inc: { balance: -amount } });
    await Account.updateOne({ user: to }, { $inc: { balance: amount } });

    await session.commitTransaction();

    return res.status(200)
        .json(new ApiResponse(200, {}, "money transferred successfully"));
});

export { getUserBalance, transferMoney };