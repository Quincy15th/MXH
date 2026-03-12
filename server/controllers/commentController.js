import Comment from "../models/Comment.js";

export const postComment = async (req, res) => {
  try {
    const { userId } = req.auth; // ✅ Clerk injects req.auth, not a function
    const { postId, text } = req.body;

    if (!userId || !postId || !text) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // create comment
    const comment = await Comment.create({
      postId,
      user: userId,
      text,
    });

    // populate user info so frontend can show immediately
    const populated = await comment.populate("user");

    return res.json({
      success: true,
      message: "Comment Posted",
      comment: populated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const fetchComments = async (req, res) => {
  try {
    const { postId } = req.body;
    const comments = await Comment.find({ postId }).sort({ createdAt: -1 });
    return res.json({ success: true, comments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.body;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res
        .status(404)
        .json({ success: false, message: "Comment not found" });
    }

    await Comment.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
