import AsyncHandler from "../utils/AsyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

export const registerUser = AsyncHandler(async (req, res) => {

    const { username, fullName, email, password } = req.body;

    if ([username, fullName, email, password].some((field) =>
        field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(500, "User already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;      // path is public/temp/finename
    console.log(avatarLocalPath);

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar path is required")
    }

    console.log("PATHHHH ", avatarLocalPath)
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("AAAAAAAA", avatar)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering user")
    }

    return res.status(200).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

export const loginUser = AsyncHandler(async (req, res) => {

    const { username, email, password } = req.body;

    if (!username && !email) {
        throw new ApiError(403, "Missing username or email")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (await user.isPasswordCorrect(password)) {
        return res.status(401).json(
            new ApiResponse(401, "Incorrect Password")
        )
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new ApiResponse(200, { user: loggedInUser, accessToken: accessToken, refreshToken: refreshToken }, "User logged In successfully")
        )
})

export const logoutUser = AsyncHandler(async (req, res) => {

    const userId = req.userId;

    const user = await User.findById(userId);

    user.refreshToken = undefined;
    await user.save();

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, "User logged out successfully")
        )

})

export const RegenerateAccessToken = AsyncHandler(async (req, res) => {

    const IncomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!IncomingRefreshToken) {
        throw new ApiError(401, "UnAuthorized access")
    }

    const decodedToken = jwt.verify(IncomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken._id);

    if (!user) {
        throw new ApiError(401, "unAuthorized access")
    }

    if (IncomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh Token is used or expired")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { user: loggedInUser, accessToken: accessToken, refreshToken: refreshToken }, "Access token refreshed successfully")
        )

})

const generateAccessAndRefreshToken = async (userId) => {

    try {
        console.log(userId);
        const user = await User.findById(userId);
        console.log(user);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (err) {
        throw new ApiError(500, "Something happen while generating tokens")
    }
} 