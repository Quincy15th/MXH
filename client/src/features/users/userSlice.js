import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../../api/axios";
import { toast } from "react-hot-toast";

const initialState = {
  value: null,
  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

// Fetch user
export const fetchUser = createAsyncThunk(
  "user/fetchUser",
  async (token, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 👇 make this more defensive
      if (data.success && data.user) {
        return data.user;
      } else if (data.success && data.data?.user) {
        return data.data.user;
      } else {
        return rejectWithValue("No user in response");
      }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

// Update user
export const updateUser = createAsyncThunk(
  "user/updateUser",
  async ({ userData, token }, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/api/user/update", userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (data.success) {
        toast.success(data.message);
        return data.user; // ✅ return updated user
      } else {
        toast.error(data.message);
        return rejectWithValue(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.value = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- fetchUser cases ---
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.value = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // --- updateUser cases ---
      .addCase(updateUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.value = action.payload; // ✅ immediate redux update
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;
