import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { BadgeCheck, X } from "lucide-react";
import { motion } from "framer-motion";

const StoryViewer = ({ story }) => {
  const { storyViewer, setStoryViewer } = useContext(AppContext);

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let timer, progressInterval;
    if (story && story.media_type !== "video") {
      setProgress(0);
      const duration = 10000;

      // close stiry after 10sec
      timer = setTimeout(() => {
        setStoryViewer(false);
      }, duration);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [story, setStoryViewer]);

  const renderContent = () => {
    switch (story.media_type) {
      case "image":
        return (
          <img
            src={story?.media_url}
            className="max-w-full max-h-screen object-contain"
          ></img>
        );
      case "video":
        return (
          <video
            onEnded={() => setStoryViewer(false)}
            src={story?.media_url}
            className="max-w-full max-h-screen object-contain"
            controls
            autoPlay
          ></video>
        );
      case "text":
        return (
          <div className="w-full h-full flex itemsc-center justify-center p-8 text-white text-2xl text-center">
            <p>{story?.content}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    storyViewer && (
      <div
        style={{
          backgroundColor:
            story.media_type === "text"
              ? `${story.background_color}`
              : "#000000",
        }}
        className={`fixed inset-0 bg-black bg-opacity-90 z-31 flex items-center justify-center `}
      >
        {/* progress bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-700">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 10, ease: "linear" }}
            className="h-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-green-400

 transition-all duration-100 linear "
            style={{ width: `${progress}%` }}
          ></motion.div>
        </div>

        {/* user info */}
        <div className="absolute top-5 w-full flex items-center justify-between px-4">
          <div className="rounded border border-white p-2 flex items-center justify-center gap-2 text-white backdrop-blur-xs bg-black/50">
            <img
              src={story.user.profile_picture}
              className="w-10 h-10 rounded-full "
            ></img>
            <p>{story.user.full_name}</p>
            <BadgeCheck size={18} className="text-white " />
          </div>
          <X
            className="text-white cursor-pointer hover:scale-110"
            onClick={() => setStoryViewer(false)}
          />
        </div>

        {/* content info */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          className="max-w-[90vw] max-h-[90vw] flex items-center justify-center"
        >
          {renderContent()}
        </motion.div>
      </div>
    )
  );
};

export default StoryViewer;
