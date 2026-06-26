import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  apiFetch,
  clearAuthStorage,
  getAuthStorage,
  normalizeUser,
  setAuthStorage,
} from "../../lib/api";

const persistedAuth = getAuthStorage();

export const registerUser = createAsyncThunk("auth/registerUser", async (payload) => {
  const data = await apiFetch("/api/auth/local/register", {
    method: "POST",
    body: payload,
  });

  const authData = {
    jwt: data.jwt,
    user: normalizeUser(data.user),
  };
  setAuthStorage(authData);
  return authData;
});

export const loginUser = createAsyncThunk("auth/loginUser", async (payload) => {
  const data = await apiFetch("/api/auth/local", {
    method: "POST",
    body: payload,
  });

  const authData = {
    jwt: data.jwt,
    user: normalizeUser(data.user),
  };
  setAuthStorage(authData);
  return authData;
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { getState }) => {
  const token = getState().auth.jwt;
  if (token) {
    await apiFetch("/api/auth/logout", {
      method: "POST",
      token,
    });
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: persistedAuth?.user || null,
    jwt: persistedAuth?.jwt || null,
    status: "idle",
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.jwt = null;
      state.status = "idle";
      state.error = null;
      clearAuthStorage();
    },
    updateStoredUser(state, action) {
      state.user = action.payload;
      if (state.jwt) {
        setAuthStorage({ jwt: state.jwt, user: action.payload });
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.jwt = action.payload.jwt;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.jwt = action.payload.jwt;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.jwt = null;
        state.status = "idle";
        state.error = null;
        clearAuthStorage();
      });
  },
});

export const { logout, updateStoredUser } = authSlice.actions;
export default authSlice.reducer;
