import React, { useEffect, useRef, useState } from "react";
import { Image, SendHorizonal } from "lucide-react";
import moment from "moment";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { api } from "../api/axios.js";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessage,
  fetchMessages,
  resetMessages,
} from "../features/messages/messagesSlice.js";

const ChatBox = () => {
  const { messages = [] } = useSelector((state) => state.messages || {});
  const connections = useSelector(
    (state) => state.connections?.connections || [],
  );

  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [user, setUser] = useState(null);

  const { userId } = useParams();
  const { getToken } = useAuth();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // --- Fetch messages ---
  const fetchUserMessages = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      dispatch(fetchMessages({ token, userId }));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // --- Send message ---
  const sendMessage = async () => {
    try {
      if (!text && !image) return;

      const token = await getToken();
      if (!token) return;

      const formData = new FormData();
      formData.append("to_user_id", userId);
      formData.append("text", text);
      if (image) formData.append("image", image);

      const { data } = await api.post("/api/message/send", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setText("");
        setImage(null);
        setPreviewUrl(null);
        dispatch(addMessage(data.message));
      }
    } catch (error) {
      toast.error(error.message || "Failed to send message");
    }
  };

  // --- Auto scroll only if near bottom ---
  const scrollToBottomIfNear = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottomIfNear();
  }, [messages]);

  // --- Generate image preview ---
  useEffect(() => {
    if (image) {
      const objectUrl = URL.createObjectURL(image);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [image]);

  // --- Fetch messages periodically ---
  useEffect(() => {
    fetchUserMessages(); // immediate fetch
    const intervalId = setInterval(fetchUserMessages, 2000);

    return () => {
      clearInterval(intervalId);
      dispatch(resetMessages());
    };
  }, [userId]);

  // --- Find user from connections ---
  useEffect(() => {
    if (connections.length > 0) {
      const foundUser = connections.find((c) => c._id === userId);
      if (foundUser) setUser(foundUser);
    }
  }, [connections, userId]);

  if (!user) return null;

  return (
    <div className="absolute flex flex-col bottom-0 left-[-16rem] sm:left-0 right-0 top-0">
      {/* --- Header --- */}
      <div
        className="w-full h-15 border-b border-indigo-100 
        bg-gradient-to-r from-indigo-100 to-purple-100 py-2 px-2 
        flex items-center justify-start sticky top-0 z-10 shadow"
      >
        <div className="flex flex-col items-start px-2">
          <p className="font-semibold">{user.full_name}</p>
          <p className="text-sm text-gray-600">
            @{user.username || "Add Username"}
          </p>
        </div>
      </div>

      {/* --- Messages section --- */}
      <div
        ref={containerRef}
        className="pb-38 flex-1 overflow-y-auto p-5 md:px-10 bg-gradient-to-b from-blue-50 to-indigo-100"
      >
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm text-center">No messages yet</p>
        ) : (
          messages
            .slice()
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
            .map((message, index) => {
              const isSender = message.to_user_id !== user._id;
              return (
                <div
                  key={message._id || index}
                  className={`flex flex-col ${isSender ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`my-1 relative text-sm max-w-sm rounded-lg 
                      ${
                        message.message_type === "image"
                          ? "bg-white"
                          : "bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-700 text-white"
                      } ${isSender ? "rounded-bl-none" : "rounded-br-none"}`}
                  >
                    {message.message_type === "image" && (
                      <img
                        src={message.media_url}
                        className="w-full h-full max-w-sm rounded-lg"
                        alt="message media"
                      />
                    )}
                    {message.text && (
                      <p className="rounded-lg p-2">{message.text}</p>
                    )}
                  </div>
                  <p
                    className={`text-[10px] mt-1 ${isSender ? "text-left" : "text-right"} text-gray-500`}
                  >
                    {moment(message.createdAt).fromNow()}
                  </p>
                </div>
              );
            })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* --- Message input --- */}
      <div className="w-full absolute bottom-13 left-0 right-0 flex items-center justify-center">
        <div className="w-[90%] sm:w-[55%] rounded-full bg-white h-12 flex items-center justify-between gap-3 px-4 shadow-md relative">
          <input
            value={text}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            onChange={(e) => setText(e.target.value)}
            className="p-2 w-[80%] rounded-full outline-none border-none h-full"
            placeholder="Type a message..."
          />
          <div className="flex items-center justify-center gap-3">
            <label>
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
              {previewUrl ? (
                <div className="relative h-10 w-10">
                  <img
                    src={previewUrl}
                    className="h-full w-full rounded object-cover"
                    alt="preview"
                  />
                  <button
                    onClick={() => {
                      setImage(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <Image size={24} className="text-gray-400 cursor-pointer" />
              )}
            </label>
            <span
              onClick={sendMessage}
              className="rounded-full flex items-center justify-center bg-gradient-to-b from-[#615FFF] to-[#9810FA] p-2 cursor-pointer"
            >
              <SendHorizonal className="w-5 h-5 text-white" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
