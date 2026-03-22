// takes the reducers from   reducers of other slices

import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/users/userSlice.js";
import connectionsReducer from "../features/connections/connectionSlice.js";
import messagesReducer from "../features/messages/messagesSlice.js";
export const store = configureStore({
  reducer: {
    user: userReducer,
    connections: connectionsReducer,
    messages: messagesReducer,
  },
});
