import { createContext, useState } from "react";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [createStory, setCreateStory] = useState(false);
  const [storyViewer, setStoryViewer] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showComment, setShowComment] = useState(false);

  const value = {
    createStory,
    setCreateStory,
    storyViewer,
    setStoryViewer,
    showEdit,
    setShowEdit,
    showComment,
    setShowComment,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
