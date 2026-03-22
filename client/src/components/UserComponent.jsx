import { MapPin, MessageCircle, Plus, UserPlus } from "lucide-react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { api } from "../api/axios";
import { fetchUser } from "../features/users/userSlice";

const UserComponent = ({ user }) => {
  const currentUser = useSelector((state) => state.user.value) || {};
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  // ✅ safely fallback to [] if not array
  const currentConnections = Array.isArray(currentUser?.connections)
    ? currentUser.connections
    : [];
  const currentFollowing = Array.isArray(currentUser?.following)
    ? currentUser.following
    : [];

  const handleFollow = async (userId) => {
    try {
      const { data } = await api.post(
        "/api/user/follow",
        { id: userId },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );
      if (data.success) {
        toast.success(data.message + " " + user.username);
        dispatch(fetchUser(await getToken()));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    }
  };

  const handleConnectionRequest = async () => {
    if (currentConnections.includes(user._id)) {
      return navigate("/messages/" + user._id);
    }
    try {
      const { data } = await api.post(
        "/api/user/connect",
        { id: user._id },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      );
      if (data.success) {
        toast.success(data.message + " " + user.username);
        dispatch(fetchUser(await getToken()));
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    }
  };

  return (
    <div
      key={user._id}
      className="rounded-md border border-gray-300 flex flex-col items-center justify-start p-4 w-70 h-auto min-h-60 gap-2"
    >
      <img
        src={user.profile_picture}
        alt={user.username}
        className="w-15 h-15 rounded-full"
      />
      <p className="font-semibold text-sm">{user.full_name}</p>
      {user.username && <p className="text-sm">@{user.username}</p>}
      {user.bio && <p className="text-xs text-center">{user.bio}</p>}

      <div className="w-full flex items-center justify-center gap-2 my-3">
        {user.location && (
          <div className="flex items-center gap-1 text-xs border border-gray-500 rounded-[50px] px-2 py-1 text-gray-600">
            <MapPin className="w-4 h-4" />
            <p>{user.location}</p>
          </div>
        )}
        <div className="flex items-center gap-1 text-xs border border-gray-500 rounded-[50px] px-2 py-1 text-gray-600">
          <p>{user.followers?.length || 0}</p>
          <p>Followers</p>
        </div>
      </div>

      <div className="w-full flex items-center justify-center gap-3">
        {/*------- Follow button ---------- */}
        <button
          onClick={
            user._id === currentUser._id
              ? () => navigate(`/profile/${user._id}`)
              : () => handleFollow(user._id)
          }
          disabled={currentFollowing.includes(user._id)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#615FFF] to-[#9810FA] rounded-sm text-white
                 hover:from-indigo-600 hover:to-purple-700 text-sm py-2 cursor-pointer "
        >
          <UserPlus size={14} />{" "}
          {user._id === currentUser._id
            ? "Your Account"
            : currentFollowing.includes(user._id)
              ? "Following"
              : "Follow"}
        </button>

        {/*----------- Connection button ----------- */}
        {user._id !== currentUser._id && (
          <button
            onClick={handleConnectionRequest}
            className="active:scale-95 flex items-center border border-gray-300 rounded-md p-2"
          >
            {currentConnections.includes(user._id) ? (
              <MessageCircle className="cursor-pointer w-5 h-5 hover:scale-106 transition-all text-gray-500" />
            ) : (
              <Plus className="cursor-pointer active:scale-96 w-5 h-5 hover:scale-106 transition-all text-gray-500" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserComponent;
