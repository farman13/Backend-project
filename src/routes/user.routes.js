import { Router } from "express";
import { loginUser, logoutUser, RegenerateAccessToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);   //new syntax

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJwt, logoutUser)
router.route("/refreshAccessToken").post(RegenerateAccessToken);

export default router;