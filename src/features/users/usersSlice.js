import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFetch, extractCollection, normalizePost, normalizeUser } from "../../lib/api";
import { deletePost, toggleLike } from "../posts/postsSlice";

export const fetchUserByUsername = createAsyncThunk("users/fetchUserByUsername", async (username, { getState }) => {
  const token = getState().auth.jwt;
  let users = [];

  try {
    const filteredUsers = await apiFetch("/api/users", {
      token,
      query: `?username=${encodeURIComponent(username)}`,
    });
    users = Array.isArray(filteredUsers) ? filteredUsers : [];
  } catch {
    users = [];
  }

  if (!users.length) {
    const allUsers = await apiFetch("/api/users", {
      token,
      query: "?_limit=500",
    });
    users = Array.isArray(allUsers) ? allUsers : [];
  }

  const foundUser = users.find((user) => user.username?.toLowerCase() === username.toLowerCase());

  if (!foundUser) {
    throw new Error("Utilisateur introuvable.");
  }

  const profile = normalizeUser(foundUser);
  const postsData = await apiFetch("/api/posts", {
    token,
    query: `?user.id=${profile.id}&_sort=created_at:desc&populate=user`,
  });

  return {
    profile,
    posts: extractCollection(postsData).map(normalizePost),
  };
});

const usersSlice = createSlice({
  name: "users",
  initialState: {
    profile: null,
    posts: [],
    status: "idle",
    error: null,
  },
  reducers: {
    clearViewedUser(state) {
      state.profile = null;
      state.posts = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserByUsername.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserByUsername.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload.profile;
        state.posts = action.payload.posts;
      })
      .addCase(fetchUserByUsername.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        state.posts = state.posts.map((post) => (post.id === action.payload.id ? action.payload : post));
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((post) => post.id !== action.payload);
      });
  },
});

export const { clearViewedUser } = usersSlice.actions;
export default usersSlice.reducer;
