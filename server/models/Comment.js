import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      ref: "Post",
      required: true,
    },
    user: {
      type: String, // Clerk userId
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, minimize: false },
);

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
