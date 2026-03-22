import React, { useContext, useEffect, useState } from "react";
import { dummyStoriesData } from "../assets/assets";
import { Plus } from "lucide-react";
import moment from "moment";
import CreateStory from "./CreateStory";
import { AppContext } from "../context/AppContext";
import StoryViewer from "./StoryViewer";
import toast from "react-hot-toast";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../api/axios.js";

const StoriesBar = () => {
  const { createStory, setCreateStory, storyViewer, setStoryViewer } =
    useContext(AppContext);
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null); // store clicked story
  const { getToken } = useAuth();

  //fetch stories
  const fetchStories = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get("/api/story/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (data.success) {
        setStories(data.stories);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchStories();
    console.log(stories);
  }, []);

  return (
    <>
      {createStory && <CreateStory />}
      {storyViewer && activeStory && <StoryViewer story={activeStory} />}

      <div className="w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl overflow-x-auto px-4 flex gap-4">
        {/*---- Add Story ------ */}
        <div
          className="flex-shrink-0 w-[120px] h-[160px] rounded-md border border-dashed flex flex-col items-center justify-center gap-3
          hover:shadow-lg transition-all duration-200 border-indigo-300 bg-gradient-to-b from-indigo-50 to-white"
        >
          <div className="rounded-full bg-[#615FFF] p-2 flex items-center justify-center">
            <Plus
              onClick={() => setCreateStory(true)}
              className="text-white transition-all duration-250 hover:scale-110 cursor-pointer"
            />
          </div>
          <p className="text-sm">Create Story</p>
        </div>

        {/*------ Story Cards ------*/}
        {stories.map((itm, index) => (
          <div
            key={index}
            onClick={() => {
              setActiveStory(itm); // set the clicked story
              setStoryViewer(true); // open viewer
            }}
            className="flex-shrink-0 relative w-[120px] h-[160px] rounded-lg shadow cursor-pointer
              hover:shadow-lg transition-all duration-200 bg-gradient-to-b from-indigo-500 to-purple-600 
              hover:from-indigo-700 hover:to-purple-600 active:scale-95 overflow-hidden"
          >
            {/* User profile picture */}
            <img
              src={itm.user.profile_picture}
              alt="user"
              className="absolute size-8 top-3 left-3 z-10 rounded-full ring ring-gray-100 shadow"
            />
            {/* Story text */}
            <p className="absolute bottom-16 left-3 text-white/90 text-sm truncate max-w-[90px]">
              {itm.content}
            </p>
            {/* Created time */}
            <p className="absolute text-white bottom-1 left-2 z-10 text-xs">
              {moment(itm.createdAt).fromNow()}
            </p>

            {itm.media_type !== "text" && (
              <div className="absolute inset-0 z-1 rounded-lg bg-black overflow-hidden">
                {itm.media_type === "image" ? (
                  <img
                    className="h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80"
                    src={itm.media_url}
                  />
                ) : (
                  <video
                    className="h-full w-full object-cover hover:scale-110 transition duration-500 opacity-70 hover:opacity-80"
                    src={itm.media_url}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default StoriesBar;
