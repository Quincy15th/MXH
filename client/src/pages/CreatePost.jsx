import React, { useState } from "react";
import { dummyUserData } from "../assets/assets";
import { motion } from "framer-motion";
import { Image, X } from "lucide-react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../api/axios.js";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const CreatePost = () => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [user, setUser] = useState(null);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!images.length && !content) {
      return toast.error("Please add atleast one image or text ");
    }
    setLoading(true);
    const postType =
      images.length && content
        ? "text_with_image"
        : images.length
          ? "image"
          : "text";
    try {
      const formData = new FormData();
      (formData.append("content", content),
        formData.append("post_type", postType));
      images.map((image) => {
        formData.append("images", image);
      });
      const { data } = await api.post("/api/post/add", formData, {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        navigate("/");
      } else {
        console.log(data.message);
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await getToken(); // ✅ must await
        const { data } = await api.get("/api/user/data", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          setUser(data.user);
        } else {
          toast.error(data.message || "Failed to load user");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [getToken]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 150 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5 }}
      className="min-h-screen sm:w-[100%] w-[100vw] sm:w-[100%] sm:pl-12"
    >
      <p className="font-bold text-4xl sm:text-5xl mt-10 ">Create Post</p>
      <p className="text-sm sm:text-lg mt-[-1px] text-[#45556C]">
        Share your thoughts with the world
      </p>

      <div className="sm:w-[60%] w-[90%] rounded-lg border border-gray-300 shadow shadow-lg h-auto mt-10 px-6 py-4 ">
        <div className="w-full flex items-start justify-start gap-3 mt-2 mb-4">
          <img
            src={user?.profile_picture}
            className="w-18 h-18 rounded-full"
          ></img>
          <div className="flex h-full flex-col pt-2 items-start justify-start">
            <p className="font-semibold text-sm sm:text-lg">
              {user?.full_name}
            </p>
            <p className="text-sm text-[#6A7282]">
              @{user?.username ? user.username : "Add a username"}
            </p>
          </div>
        </div>

        {/*------ text area ----- */}
        <textarea
          onChange={(e) => setContent(e.target.value)}
          value={content}
          className="w-full  h-15 focus:outline-none focus:ring-2 focus:ring-purple-400 my-1 text-gray-400 placeholder:text-gray-400 p-2"
          placeholder="What's happening?"
        />

        {/*------- image area --------- */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 ">
            {images.map((image, i) => (
              <div className="relative group my-2">
                <img
                  src={URL.createObjectURL(image)}
                  className="h-20 rounded-md"
                ></img>
                <div
                  className="absolute hidden group-hover:flex justify-center items-center top-0 right-0 bottom-0 left-0 bg-black/40
            rounded-md cursor-pointer "
                  onClick={() =>
                    setImages(images.filter((_, index) => index !== i))
                  }
                >
                  <X className="w-6 h-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        )}

        <hr className="w-full text-[#D1D5DC]"></hr>

        <div className="w-full h-10  flex items-center mt-3 justify-between">
          <label>
            <Image className="hover:text-gray-700 transition-all duration-500 text-gray-400 cursor-pointer" />{" "}
            <input
              onChange={(e) => setImages([...images, ...e.target.files])}
              type="file"
              hidden
            ></input>
          </label>

          <button
            onClick={() =>
              toast.promise(handleSubmit(), {
                loading: "uploading...",
                success: <p>Post Added</p>,
                error: <p>Post Not Added</p>,
              })
            }
            className=" bg-gradient-to-r
           hover:from-indigo-600 hover:to-purple-700 
           transition-all duration-500 cursor-pointer
            from-[#615FFF] to-[#9810FA] text-white text-sm rounded-sm py-2 px-6"
          >
            Publish Post
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default CreatePost;
