import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import AsyncHandler from "../utils/AsyncHandler.js";

export const verifyJwt = AsyncHandler(async (req, res, next) => {

    const token = req.cookies?.accessToken || req.headers("Authorization").replace("Bearer", "");
    console.log(token);
    if (!token) {
        throw new ApiError(401, "Unauthorized access")
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.userId = decodedToken._id;
    next();

})