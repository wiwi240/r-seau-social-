import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiFetch, extractCollection, normalizePost } from "../../lib/api";

function sortPosts(posts) {
  return [...posts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export const fetchPosts = createAsyncThunk("posts/fetchPosts", async (_, { getState }) => {
  const token = getState().auth.jwt;
  const data = await apiFetch("/api/posts", {
    token,
    query: "?_limit=30&_sort=created_at:desc&populate=user",
  });
  return extractCollection(data).map(normalizePost);
});

export const createPost = createAsyncThunk("posts/createPost", async (text, { getState }) => {
  const state = getState();
  const token = state.auth.jwt;
  const userId = state.auth.user?.id;
  const data = await apiFetch("/api/posts", {
    method: "POST",
    token,
    body: { text, user: userId },
  });
  return normalizePost(data?.data || data);
});

export const deletePost = createAsyncThunk("posts/deletePost", async (postId, { getState }) => {
  const token = getState().auth.jwt;
  await apiFetch(`/api/posts/${postId}`, {
    method: "DELETE",
    token,
  });
  return postId;
});

export const toggleLike = createAsyncThunk("posts/toggleLike", async (post, { getState }) => {
  const state = getState();
  const token = state.auth.jwt;
  const currentUserId = state.auth.user?.id;
  const alreadyLiked = post.users_likes.includes(currentUserId);
  const nextUsersLikes = alreadyLiked
    ? post.users_likes.filter((id) => id !== currentUserId)
    : [...post.users_likes, currentUserId];
  const nextLikeCount = Math.max((post.like || 0) + (alreadyLiked ? -1 : 1), 0);

  const data = await apiFetch(`/api/posts/${post.id}`, {
    method: "PUT",
    token,
    body: {
      like: nextLikeCount,
      users_likes: nextUsersLikes,
    },
  });

  return normalizePost(data?.data || data);
});

const postsSlice = createSlice({
  name: "posts",
  initialState: {
    items: [],
    status: "idle",
    createStatus: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = sortPosts(action.payload);
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createPost.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.items = sortPosts([action.payload, ...state.items.filter((item) => item.id !== action.payload.id)]);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error = action.error.message;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        state.items = sortPosts(
          state.items.map((item) => (item.id === action.payload.id ? action.payload : item))
        );
      });
  },
});

export default postsSlice.reducer;
