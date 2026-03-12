import {
  deleteComment,
  fetchComments,
  postComment,
} from "../controllers/commentController.js";
import express from "express";
import { protect } from "../middlewares/auth.js";

const commentRouter = express.Router();
commentRouter.post("/add", protect, postComment);
commentRouter.post("/get", fetchComments);
commentRouter.delete("/delete", deleteComment);

export default commentRouter;
