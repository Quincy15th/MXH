import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { CirclePlus, User, X } from "lucide-react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { updateUser } from "../features/users/userSlice.js";
import toast from "react-hot-toast";

const ShowEdit = ({ onUpdateSuccess }) => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const user = useSelector((state) => state.user.value);
  const [image, setImage] = useState(user?.profile_picture || "");
  const [coverPhoto, setCoverPhoto] = useState(user?.cover_photo || "");
  const [name, setName] = useState(user?.full_name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const { setShowEdit } = useContext(AppContext);

  const getImagePreview = (img) => {
    if (typeof img === "string") return img;
    return URL.createObjectURL(img);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const editForm = new FormData();
    editForm.append("username", username);
    editForm.append("bio", bio);
    editForm.append("location", location);
    editForm.append("full_name", name);
    editForm.append("profile", image);
    editForm.append("cover", coverPhoto);

    try {
      const token = await getToken();
      await dispatch(updateUser({ userData: editForm, token }));
      setShowEdit(false);
      if (onUpdateSuccess) onUpdateSuccess(); // 🔹 trigger parent refresh
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className=" fixed inset-x-0 inset-y-0 bg-black/60 z-31 flex flex-col items-center justify-start pt-10 overflow-y-scroll pb-12 ">
      <motion.div
        initial={{ opacity: 0, y: 150 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
        onClick={() => setShowEdit(false)}
        className="fixed top-2 right-3 "
      >
        <X
          size={30}
          className="active:scale-95 sm:text-white text-gray-400  cursor-pointer"
        />
      </motion.div>

      {/* ---- edit section ------ */}
      <motion.div
        initial={{ opacity: 0, y: 150 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
        className="w-[90%] sm:w-[50%]  rounded-md bg-white shadow shadow-gray-300 h-auto flex flex-col justify-start items-start py-5 px-6 gap-4"
      >
        <p className="font-semibold">Edit Profile</p>

        {/*-------- profile pic ------- */}
        <div className="">
          <p className="my-1 text-gray-600">Profile Picture</p>
          <label>
            {image ? (
              <img
                src={getImagePreview(image)}
                className="w-18 h-18 rounded-full cursor-pointer active:scale-95 transition-all duration-500 "
              />
            ) : (
              <div className="w-15 h-15  rounded-full shadow flex items-center justify-center">
                <User className=" sm:w-8 sm:h-8 w-5 h-5 " />
              </div>
            )}
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              hidden
            />
          </label>
        </div>

        {/*--------- cover pic --------- */}
        <div className="w-full">
          <p className="my-1 text-gray-600">Cover Photo</p>
          <label>
            {coverPhoto ? (
              <img
                src={getImagePreview(coverPhoto)}
                className="sm:w-[25rem] w-[100%] rounded active:scale-95 transition-all duration-500"
              />
            ) : (
              <div className="w-[25rem] w-[100%] h-40 border border-dashed rounded flex items-center justify-center gap-1">
                <CirclePlus /> <p>Add Cover Photo</p>
              </div>
            )}
            <input
              onChange={(e) => setCoverPhoto(e.target.files[0])}
              type="file"
              hidden
            />
          </label>
        </div>

        {/*---------- name ----- */}
        <div className="w-full flex flex-col items-start justify-start gap-1">
          <p className="my-1 text-gray-600">Name</p>
          <input
            onChange={(e) => setName(e.target.value)}
            className="w-full py-2 px-2 border border-gray-300  rounded  h-11"
            value={name}
          />
        </div>

        {/*---------- username ----- */}
        <div className="w-full flex flex-col items-start justify-start gap-1">
          <p className="my-1 text-gray-600">Username</p>
          <input
            onChange={(e) => setUsername(e.target.value)}
            className="w-full py-2 px-2 border border-gray-300  rounded  h-11"
            value={username || "Add User Name"}
          />
        </div>

        {/*---------- bio ----- */}
        <div className="w-full flex flex-col items-start justify-start gap-1">
          <p className="my-1 text-gray-600">Bio</p>
          <textarea
            onChange={(e) => setBio(e.target.value)}
            className="w-full py-3 px-2 border border-gray-300  rounded  h-auto min-h-18"
            value={bio}
            placeholder="Add Bio..."
          />
        </div>

        {/*---------- loaction ----- */}
        <div className="w-full flex flex-col items-start justify-start gap-1">
          <p className="my-1 text-gray-600">Location</p>
          <input
            onChange={(e) => setLocation(e.target.value)}
            className="w-full py-3 px-2 border border-gray-300  rounded  h-11 "
            value={location}
            placeholder="Add Location..."
          />
        </div>

        <div className="w-full my-3 flex items-center justify-end gap-2">
          <button
            className="rounded-sm border  border-gray-400  py-2 px-4 active:scale-95 cursor-pointer "
            onClick={() => setShowEdit(false)}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProfile}
            className="py-2 px-4 bg-gradient-to-r from-[#615FFF] to-[#9810FA] text-white rounded-sm active:scale-95 cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ShowEdit;
