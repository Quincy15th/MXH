import express from "express";
import {
  getUserData,
  discoverUsers,
  followUser,
  unfollowUser,
  updateUserData,
  sendConnectionRequest,
  acceptConnectionRequest,
  getUserConnections,
  getUserProfiles,
} from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";
import { upload } from "../configs/multer.js";
import { getUserRecentMessages } from "../controllers/messageController.js";

const userRouter = express.Router();

userRouter.get("/data", protect, getUserData); // ✅ no ()
userRouter.put(
  "/update",
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  protect,
  updateUserData,
);
userRouter.post("/discover", protect, discoverUsers); // ✅ no ()
userRouter.post("/follow", protect, followUser); // ✅ no ()
userRouter.post("/unfollow", protect, unfollowUser); // ✅ no ()
userRouter.post("/connect", protect, sendConnectionRequest);
userRouter.post("/accept", protect, acceptConnectionRequest);
userRouter.get("/connections", protect, getUserConnections);
userRouter.post("/profiles", protect, getUserProfiles);
userRouter.get("/recent-message", protect, getUserRecentMessages);

export default userRouter;
