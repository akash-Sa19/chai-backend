import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/user.controller.js";
// middleware
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// secured routes
// because of using next() inside verifyJWT middleware, we can pass different middlewares with each having next()
// post(middleware1, middleware2, middleware3, lastExecutingFn)
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
