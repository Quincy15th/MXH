import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import moment from "moment";
import { toast } from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../api/axios.js";

const CommentBox = ({ postId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  // Fetch user details for a single user (protected route)
  const fetchUser = async (userId) => {
    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/user/profiles",
        { profileId: userId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (data.success && data.profile) {
        return data.profile;
      }
      return {
        _id: userId,
        full_name: "Unknown",
        profile_picture: "/profile_default.jpeg",
      };
    } catch (err) {
      return {
        _id: userId,
        full_name: "Unknown",
        profile_picture: "/profile_default.jpeg",
      };
    }
  };

  // Fetch comments and populate user info
  const fetchComments = async () => {
    try {
      const { data } = await api.post("/api/comment/get", { postId });
      if (!data.comments) return;

      const uniqueUserIds = [...new Set(data.comments.map((c) => c.user))];
      const usersMap = {};

      await Promise.all(
        uniqueUserIds.map(async (uid) => {
          usersMap[uid] = await fetchUser(uid);
        }),
      );

      const populatedComments = data.comments.map((c) => ({
        ...c,
        user: usersMap[c.user] || {
          _id: c.user,
          full_name: "Unknown",
          profile_picture: "/profile_default.jpeg",
        },
      }));

      setComments(populatedComments);
    } catch (err) {
      toast.error("Failed to load comments");
    }
  };

  // Post comment with optimistic update
  const postComment = async () => {
    if (!text.trim()) return toast.error("Comment cannot be empty");

    const tempComment = {
      _id: `temp-${Date.now()}`,
      text,
      createdAt: new Date().toISOString(),
      user: currentUser,
      isTemp: true,
    };

    setComments((prev) => [tempComment, ...prev]);
    setText("");
    setLoading(true);

    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/comment/add",
        { postId, text: tempComment.text },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (data.comment) {
        const userProfile = await fetchUser(data.comment.user);
        const fullComment = { ...data.comment, user: userProfile };

        setComments((prev) =>
          prev.map((c) => (c._id === tempComment._id ? fullComment : c)),
        );
      }
    } catch (err) {
      setComments((prev) => prev.filter((c) => c._id !== tempComment._id));
      toast.error("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  // handle delete
  const handleDelete = async (commentId) => {
    try {
      const { data } = await api.delete("/api/comment/delete", {
        data: { id: commentId }, // ⚠️ must be inside `data`
      });
      if (data.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
        toast.success("Comment deleted");
      }
    } catch (err) {
      toast.error("Failed to delete comment");
    }
  };

  useEffect(() => {
    fetchComments();
    const interval = setInterval(fetchComments, 5000);
    return () => clearInterval(interval);
  }, [postId]);

  return (
    <div className="w-full min-h-[300px] py-3 flex flex-col">
      {/* Input */}
      <div className="flex gap-3 items-center border border-gray-300 rounded px-2 py-1">
        <input
          type="text"
          className="flex-1 outline-none border-none bg-transparent"
          placeholder="Enter your comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && postComment()}
        />
        <button
          onClick={postComment}
          className="px-4 py-2 bg-purple-800 text-white rounded flex items-center justify-center active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Post"}
        </button>
      </div>

      {/* Comments List */}
      <div className="mt-4 flex flex-col gap-4 overflow-y-auto max-h-[400px]">
        {comments.length ? (
          comments.map((comment) => (
            <div
              key={comment._id}
              className={`p-3 bg-gray-100 rounded shadow ${
                comment.isTemp ? "opacity-70 animate-pulse" : ""
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={comment.user?.profile_picture || "/profile_default.jpeg"}
                  alt={comment.user?.full_name || "User"}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-sm">
                    {comment.user?.full_name || "Unknown"}
                  </span>
                  <span className="text-gray-500 text-xs">
                    @{comment.user?._id}
                  </span>
                </div>
                {comment.user?._id === currentUser._id && !comment.isTemp && (
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="active:scale-95 cursor-pointer ml-auto text-red-500 text-xs"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-gray-800">{comment.text}</p>
              <span className="text-gray-400 text-xs mt-1">
                {moment(comment.createdAt).fromNow()}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No comments yet</p>
        )}
      </div>
    </div>
  );
};

export default CommentBox;
