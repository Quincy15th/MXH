import { ArrowLeftIcon, Sparkle, Text, Upload } from "lucide-react";
import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../api/axios";

const CreateStory = () => {
  const bgColor = [
    "#4F46E5",
    "#7C3AED",
    "#DB2777",
    "#E11D48",
    "#CA8A04",
    "#0D9488",
  ];
  const { setCreateStory } = useContext(AppContext);
  const [background, setBackground] = useState(bgColor[0]);
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mode, setMode] = useState("text"); // "text" | "image" | "video"
  const { getToken } = useAuth();

  const MAX_VIDEO_DURATION = 60;
  const MAX_VIDEO_SIZE_MB = 50;

  // ✅ Handle Media Upload
  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith("video")) {
      if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        toast.error(`Video Size cannot exceed ${MAX_VIDEO_SIZE_MB} MB`);
        setMedia(null);
        setPreviewUrl(null);
        return;
      }

      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadeddata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > MAX_VIDEO_DURATION) {
          toast.error("Video cannot exceed 1 minute");
          setMedia(null);
          setPreviewUrl(null);
        } else {
          setMedia(file);
          setPreviewUrl(URL.createObjectURL(file));
          setText("");
          setMode("video"); // ✅ valid enum
        }
      };
      video.src = URL.createObjectURL(file);
    } else if (file.type.startsWith("image")) {
      setMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
      setText("");
      setMode("image"); // ✅ valid enum
    }
  };

  // ✅ Handle Create Story
  const handleCreateStory = async () => {
    try {
      if (mode === "text" && !text) {
        toast.error("Please enter some text...");
        return;
      }

      const formData = new FormData();
      formData.append("content", text);
      formData.append("media_type", mode); // now sends "text" | "image" | "video"
      if (media) formData.append("media", media);
      formData.append("background_color", background);

      const token = await getToken();
      const { data } = await api.post("/api/story/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setCreateStory(false);
        toast.success(data.message);
      }
      // reset
      setText("");
      setMedia(null);
      setPreviewUrl(null);
      setMode("text");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 150 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative sm:w-[28%] w-[80%] flex flex-col items-center justify-start"
      >
        {/* Close Button */}
        <div className="absolute left-0 top-0">
          <ArrowLeftIcon
            onClick={() => setCreateStory(false)}
            className="text-white hover:scale-110 transition-all duration-250 cursor-pointer"
          />
        </div>

        <div className="text-white font-semibold text-lg mt-2">
          Create Story
        </div>

        {/* TEXT MODE */}
        {mode === "text" && (
          <textarea
            onChange={(e) => setText(e.target.value)}
            value={text}
            className="resize-none w-full rounded-lg mt-5 pt-4 pl-4 text-white outline-none h-88"
            style={{ backgroundColor: background }}
            placeholder="What's on your mind?"
          />
        )}

        {/* IMAGE / VIDEO MODE */}
        {(mode === "image" || mode === "video") &&
          previewUrl &&
          (mode === "image" ? (
            <div
              className="w-full rounded-lg mt-5 h-88 flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: background }}
            >
              <img
                src={previewUrl}
                alt="preview"
                className="object-contain max-h-full max-w-full"
              />
            </div>
          ) : (
            <div
              className="w-full rounded-lg mt-5 h-88 flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: background }}
            >
              <video
                src={previewUrl}
                controls
                className="object-contain max-h-full max-w-full"
              />
            </div>
          ))}

        {/* COLOR PICKER */}
        <div className="w-full flex items-center justify-start gap-2 my-3">
          {bgColor.map((itm, idx) => (
            <span
              key={idx}
              onClick={() => setBackground(itm)}
              className="border border-white rounded-full w-6 h-6 cursor-pointer"
              style={{ backgroundColor: itm }}
            />
          ))}
        </div>

        {/* OPTIONS */}
        <div className="w-full flex items-center justify-between my-2">
          <div
            onClick={() => {
              setMode("text");
              setMedia(null);
              setPreviewUrl(null);
            }}
            className={`${mode === "text" ? "bg-white text-black" : "bg-zinc-800 text-white"} w-[49%] py-3 rounded-xs cursor-pointer`}
          >
            <div className="flex items-center justify-center text-xs gap-2">
              <Text size={14} />
              <p>Text</p>
            </div>
          </div>

          <div
            className={`${mode === "image" || mode === "video" ? "bg-white text-black" : "bg-[#27272A] text-white"} w-[49%] py-3 rounded-xs cursor-pointer`}
          >
            <label className="w-full h-full flex items-center justify-center text-xs gap-2 cursor-pointer">
              <Upload size={14} />
              <p>Photo/Video</p>
              <input
                hidden
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  handleMediaUpload(e);
                  e.target.value = ""; // reset input
                }}
              />
            </label>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div
          onClick={() =>
            toast.promise(handleCreateStory(), {
              loading: "Saving...",
              success: "Story created!",
              error: "Failed to create story",
            })
          }
          className="rounded-xs my-2 w-full py-3 text-white text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-[#615FFF] to-[#9810FA] cursor-pointer"
        >
          <Sparkle size={15} />
          <p>Create Story</p>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateStory;
