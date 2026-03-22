import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  UserCheck,
  UserPen,
  UserPlus,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "react-hot-toast";
import { api } from "../api/axios.js";

const Connections = () => {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [connections, setConnections] = useState([]);
  const [pendingConnections, setPendingConnections] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [selectedList, setSelectedList] = useState("Followers");

  // fetch connections on mount
  useEffect(() => {
    async function fetchConnections() {
      try {
        const token = await getToken();
        const { data } = await api.get("/api/user/connections", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.success) {
          setConnections(data.connections || []);
          setPendingConnections(data.pendingConnections || []);
          setFollowers(data.followers || []);
          setFollowing(data.following || []);
        } else {
          toast.error(data.message || "Failed to fetch connections");
        }
      } catch (error) {
        toast.error(error.message);
      }
    }

    fetchConnections();
  }, [getToken]);

  const dataArray = [
    { label: "Followers", value: followers, icon: <Users size={14} /> },
    { label: "Following", value: following, icon: <UserCheck size={14} /> },
    {
      label: "Pending",
      value: pendingConnections,
      icon: <UserPen size={14} />,
    },
    { label: "Connections", value: connections, icon: <UserPlus size={14} /> },
  ];

  const handleUnfollow = async (userId) => {
    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/user/unfollow",
        { id: userId },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (data.success) {
        toast.success(data.message);
        setFollowing((prev) => prev.filter((u) => u._id !== userId));
      } else {
        toast.error(data.message || "Failed to unfollow");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const acceptConnection = async (userId) => {
    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/user/accept",
        { id: userId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (data.success) {
        toast.success(data.message);

        // remove from pending
        setPendingConnections((prev) => prev.filter((u) => u._id !== userId));

        // add to connections
        if (data.acceptedUser) {
          setConnections((prev) => [...prev, data.acceptedUser]);
        }
      } else {
        toast.error(data.message || "Failed to accept connection");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 150 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5 }}
      className="min-h-screen sm:w-[100%] w-[100vw] relative sm:pl-10 pb-10"
    >
      <p className="font-bold text-4xl sm:text-5xl mt-10">Connections</p>
      <p className="text-sm sm:text-lg mt-[-1px] text-[#45556C]">
        Manage your network and discover new connections
      </p>

      {/* Summary boxes */}
      <div className="w-[90%] sm:w-full flex flex-wrap items-center justify-start gap-6 mt-18">
        {dataArray.map((itm, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setSelectedList(itm.label)}
            className="bg-white rounded-sm shadow-lg h-22 w-45 sm:w-40 flex flex-col items-center justify-center gap-1 cursor-pointer"
          >
            <p className="font-bold">{itm.value?.length || 0}</p>
            <p className="text-[#45556C]">{itm.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="sm:w-[50%] w-[80%] bg-white flex items-center flex-wrap justify-start rounded-sm shadow-lg mt-10 py-2 px-2 gap-6">
        {dataArray.map((itm, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedList(itm.label)}
            className={`cursor-pointer flex items-center gap-2 ${
              selectedList === itm.label ? "text-black" : "text-gray-400/90"
            }`}
          >
            <span className="text-xs">{itm.icon}</span>
            <p className="text-sm font-semibold">{itm.label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="mt-12 flex flex-wrap w-[90%] sm:w-[100%] gap-4">
        {dataArray
          .find((itm) => itm.label === selectedList)
          ?.value?.map((item) => (
            <div
              key={item._id}
              className="flex items-start justify-start shadow rounded-sm bg-white gap-2 py-3 px-5 w-[100%] sm:w-80 min-h-40"
            >
              <img
                className="w-10 h-10 rounded-full"
                src={item.profile_picture}
                alt="profile"
              />
              <div className="w-full flex flex-col items-start gap-1">
                <p className="text-sm font-semibold">{item.full_name}</p>
                <p className="text-sm text-[#62748E]">@{item.username}</p>
                <p className="text-xs text-[#4A5565]">
                  {item.bio?.slice(0, 90)}...
                </p>

                <div className="w-full flex items-center gap-2 mt-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/profile/${item._id}`)}
                    className="cursor-pointer text-sm w-full bg-gradient-to-r from-[#615FFF] to-[#9810FA] rounded-sm py-2 flex items-center justify-center text-white"
                  >
                    View Profile
                  </motion.button>

                  {selectedList === "Following" && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUnfollow(item._id)}
                      className="cursor-pointer text-sm w-full bg-slate-200 rounded-sm py-2 flex items-center justify-center text-black"
                    >
                      Unfollow
                    </motion.button>
                  )}

                  {selectedList === "Pending" && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => acceptConnection(item._id)}
                      className="cursor-pointer text-sm w-full bg-slate-200 rounded-sm py-2 flex items-center justify-center text-black"
                    >
                      Accept
                    </motion.button>
                  )}

                  {selectedList === "Connections" && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate(`/messages/${item._id}`)}
                      className="cursor-pointer text-sm w-full bg-slate-200 rounded-sm py-2 flex items-center justify-center text-black gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </motion.div>
  );
};

export default Connections;
