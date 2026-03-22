import React, { useEffect, useState } from "react";
import { dummyRecentMessagesData } from "../assets/assets";
import { Link } from "react-router-dom";
import moment from "moment";
import toast from "react-hot-toast";
import { api } from "../api/axios.js";
import { useAuth } from "@clerk/clerk-react";

const RecentMessages = () => {
  const [messages, setMessages] = useState([]);
  const { getToken } = useAuth();

  const fetchRecentMessages = async () => {
    try {
      const { data } = await api.get("/api/message/recent", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      setMessages(data.messages);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchRecentMessages();
    setInterval(() => {
      fetchRecentMessages();
    }, 3000);
  }, []);

  return (
    <div className="w-full rounded-md bg-white mt-5 shadow flex flex-col p-3 pb-4  max-h-[400px] overflow-y-scroll">
      <h1 className="text-sm font-semibold mb-3">Recent Messages</h1>

      {messages.map((itm, idx) => (
        <Link
          to={`/messages/${itm.from_user_id._id}`}
          key={idx}
          className="flex items-center justify-between gap-2 py-2 px-2 hover:bg-slate-100 rounded-md transition"
        >
          {/* Left Side: Avatar + Name + Message */}
          <div className="flex items-center gap-3">
            <img
              src={itm.from_user_id.profile_picture}
              alt={itm.from_user_id.full_name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex flex-col max-w-[180px] truncate">
              <p className="text-sm font-medium truncate">
                {itm.from_user_id.full_name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {itm.text ? itm.text : "📷 Media"}
              </p>
            </div>
          </div>

          {/* Right Side: Time + Badge */}
          <div className="flex flex-col items-end text-xs">
            <p className="text-gray-400">{moment(itm.createdAt).fromNow()}</p>
            {!itm.seen && (
              <span className="mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px]">
                1
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RecentMessages;
