import React, { useContext, useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Edit, MapPin, User } from "lucide-react";
import moment from "moment";
import { motion } from "framer-motion";
import { AppContext } from "../context/AppContext";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../api/axios.js";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import Loading from "../components/Loading";
import PostCard from "../components/PostCard";
import ShowEdit from "../components/ShowEdit";

const Profile = () => {
  const currentUser = useSelector((state) => state.user.value);
  const { getToken } = useAuth();
  const { profileId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const { showEdit, setShowEdit } = useContext(AppContext);

  // --- Fetch profile + posts
  const fetchUser = useCallback(async () => {
    try {
      const id = profileId || currentUser?._id;
      if (!id) return;

      const token = await getToken();
      const { data } = await api.post(
        "/api/user/profiles",
        { profileId: id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (data.success) {
        setUser(data.profile);
        setPosts(data.posts || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch profile");
      console.error(error);
    }
  }, [profileId, currentUser, getToken]);

  // --- Load profile on mount or profileId change
  useEffect(() => {
    let isMounted = true;

    fetchUser();

    return () => {
      isMounted = false; // cleanup
    };
  }, [fetchUser]);

  if (!user) return <Loading />;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 150 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
        className="pt-15 min-h-screen w-[100vw] sm:w-[100%] relative sm:pl-10 pb-20 flex flex-col sm:items-center items-start justify-start gap-4"
      >
        {/* Profile Card */}
        <div className="sm:w-[55%] w-[90%] rounded-xl h-103 shadow shadow-md">
          {/* Cover */}
          <div className="w-full h-[52%] flex items-center justify-center">
            <img
              src={
                user.cover_photo ? user.cover_photo : "/profile_default.jpeg"
              }
              alt="cover"
              className={`${user.cover_photo ? "rounded-t-xl object-cover w-full h-full" : "object-cover"}`}
            />
          </div>

          {/* User Info */}
          <div className="relative w-full h-[48%] flex flex-col items-end justify-start py-4 px-5">
            {/* Profile Picture */}
            <div className="rounded-full w-auto h-auto p-1 absolute top-[-25px] left-2 sm:left-3 bg-white shadow">
              {user.profile_picture ? (
                <img
                  className="rounded-full w-15 h-15 sm:w-20 sm:h-20"
                  src={user.profile_picture}
                  alt="profile"
                />
              ) : (
                <div className="p-5">
                  <User className="sm:w-9 sm:h-9 w-5 h-5" />
                </div>
              )}
            </div>

            <div className="w-[85%] flex items-center justify-between gap-10">
              <div className="h-full flex flex-col items-start justify-start">
                <p className="font-semibold text-sm">{user.full_name}</p>
                <p className="text-sm text-gray-600">
                  @{user.username || "Add a Username"}
                </p>
                {user.bio && (
                  <p className="text-xs text-gray-600">{user.bio}</p>
                )}
              </div>

              {!profileId && (
                <button
                  onClick={() => setShowEdit(true)}
                  className="cursor-pointer rounded-sm py-1 px-2 border border-gray-400 flex items-center gap-2 text-sm"
                >
                  <Edit size={14} /> Edit
                </button>
              )}
            </div>

            {/* Location + Joined */}
            <div className="w-[85%] flex items-center justify-start gap-5 text-gray-600 mt-3 text-xs">
              <div className="flex items-center justify-center gap-1">
                <MapPin size={14} />
                <p>{user.location || "Add Location"}</p>
              </div>
              <div className="flex items-center justify-center gap-1">
                <Calendar size={14} />
                <p>Joined {moment(user.createdAt).fromNow()}</p>
              </div>
            </div>

            <hr className="w-[85%] text-gray-400 mt-5 mb-4" />

            {/* Stats */}
            <div className="w-[85%] flex items-center justify-start gap-6 mt-1 text-gray-600">
              <div>
                <p>
                  <span className="font-bold">{posts.length}</span>{" "}
                  <span className="text-sm text-gray-600">Posts</span>
                </p>
              </div>
              <div>
                <p>
                  <span className="font-bold">
                    {user.followers?.length || 0}
                  </span>{" "}
                  <span className="text-sm text-gray-600">Followers</span>
                </p>
              </div>
              <div>
                <p>
                  <span className="font-bold">
                    {user.following?.length || 0}
                  </span>{" "}
                  <span className="text-sm text-gray-600">Following</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sm:w-[40%] w-[90%] flex items-center justify-between py-2 px-1 rounded-sm bg-white shadow mt-5">
          {["posts", "media", "likes"].map((itm) => (
            <div
              key={itm}
              onClick={() => setActiveTab(itm)}
              className={`cursor-pointer gap-3 h-8 rounded-sm text-gray-400 flex items-center justify-center px-10 text-sm ${
                activeTab === itm
                  ? "bg-[#4F39F6] text-white transition-all duration-600"
                  : ""
              }`}
            >
              {itm[0].toUpperCase() + itm.slice(1)}
            </div>
          ))}
        </div>

        {/* Media */}
        {activeTab === "media" && (
          <div className="sm:max-w-4xl w-[90%] grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5 mb-10">
            {posts
              .filter((post) => post.image_urls?.length > 0)
              .flatMap((post) =>
                post.image_urls.map((img, idx) => (
                  <Link
                    to={img}
                    key={`${post._id}-${idx}`}
                    className="relative block group aspect-square w-full overflow-hidden rounded-lg"
                  >
                    <img
                      src={img}
                      alt="post"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <p className="absolute inset-0 hidden group-hover:flex items-end justify-end bg-black/30 p-2 text-white text-xs">
                      Posted: {moment(post.createdAt).fromNow()}
                    </p>
                  </Link>
                )),
              )}
          </div>
        )}

        {/* Posts */}
        {activeTab === "posts" && (
          <div className="sm:w-full w-[90%] flex flex-col items-center mt-10 gap-5">
            {posts.map((post) => (
              <PostCard key={post._id} itm={post} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      {showEdit && <ShowEdit user={user} onUpdateSuccess={fetchUser} />}
    </>
  );
};

export default Profile;
