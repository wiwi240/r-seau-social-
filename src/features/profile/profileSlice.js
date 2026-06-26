import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFetch, normalizeUser } from "../../lib/api";
import { updateStoredUser } from "../auth/authSlice";

export const fetchMyProfile = createAsyncThunk("profile/fetchMyProfile", async (_, { getState }) => {
  const token = getState().auth.jwt;
  const data = await apiFetch("/api/users/me", { token });
  return normalizeUser(data);
});

export const updateMyProfile = createAsyncThunk(
  "profile/updateMyProfile",
  async (payload, { getState, dispatch }) => {
    const state = getState();
    const token = state.auth.jwt;
    const userId = state.auth.user?.id;
    const data = await apiFetch(`/api/users/${userId}`, {
      method: "PUT",
      token,
      body: payload,
    });
    const normalized = normalizeUser(data);
    dispatch(updateStoredUser(normalized));
    return normalized;
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState: {
    data: null,
    status: "idle",
    updateStatus: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(updateMyProfile.pending, (state) => {
        state.updateStatus = "loading";
        state.error = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        state.data = action.payload;
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error = action.error.message;
      });
  },
});

export default profileSlice.reducer;
