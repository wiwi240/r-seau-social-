import { atom } from "jotai";
import {
  apiFetch,
  clearAuthStorage,
  extractCollection,
  getAuthStorage,
  normalizePost,
  normalizeUser,
  setAuthStorage,
} from "../lib/api";

function sortPosts(posts) {
  return [...posts].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

const persistedAuth = getAuthStorage();

const emptyAuthState = {
  user: null,
  jwt: null,
  status: "idle",
  error: null,
  isReady: true,
};

const initialAuthState = {
  user: persistedAuth?.user || null,
  jwt: persistedAuth?.jwt || null,
  status: "idle",
  error: null,
  isReady: !persistedAuth?.jwt,
};

const initialPostsState = {
  items: [],
  status: "idle",
  createStatus: "idle",
  error: null,
};

const initialProfileState = {
  data: null,
  status: "idle",
  updateStatus: "idle",
  error: null,
};

const initialViewedUserState = {
  profile: null,
  posts: [],
  status: "idle",
  error: null,
};

export const authAtom = atom(initialAuthState);
export const postsAtom = atom(initialPostsState);
export const profileAtom = atom(initialProfileState);
export const viewedUserAtom = atom(initialViewedUserState);

export const currentUserAtom = atom((get) => get(authAtom).user);
export const jwtAtom = atom((get) => get(authAtom).jwt);
export const authReadyAtom = atom((get) => get(authAtom).isReady);

export const bootstrapSessionAtom = atom(null, async (get, set) => {
  const { jwt, isReady } = get(authAtom);

  if (isReady) {
    return;
  }

  if (!jwt) {
    set(authAtom, (current) => ({ ...current, isReady: true }));
    return;
  }

  try {
    const data = await apiFetch("/api/users/me", { token: jwt });
    const nextUser = normalizeUser(data);

    set(authAtom, (current) => ({
      ...current,
      user: nextUser,
      status: "succeeded",
      error: null,
      isReady: true,
    }));
    setAuthStorage({ jwt, user: nextUser });
  } catch {
    clearAuthStorage();
    set(authAtom, emptyAuthState);
  }
});

export const registerAtom = atom(null, async (get, set, payload) => {
  set(authAtom, (current) => ({ ...current, status: "loading", error: null }));

  try {
    const data = await apiFetch("/api/auth/local/register", {
      method: "POST",
      body: payload,
    });

    const nextAuth = {
      jwt: data.jwt,
      user: normalizeUser(data.user),
      status: "succeeded",
      error: null,
      isReady: true,
    };

    setAuthStorage({ jwt: nextAuth.jwt, user: nextAuth.user });
    set(authAtom, nextAuth);
  } catch (error) {
    set(authAtom, (current) => ({
      ...current,
      status: "failed",
      error: error instanceof Error ? error.message : "Erreur inconnue.",
      isReady: true,
    }));
  }
});

export const loginAtom = atom(null, async (get, set, payload) => {
  set(authAtom, (current) => ({ ...current, status: "loading", error: null }));

  try {
    const data = await apiFetch("/api/auth/local", {
      method: "POST",
      body: payload,
    });

    const nextAuth = {
      jwt: data.jwt,
      user: normalizeUser(data.user),
      status: "succeeded",
      error: null,
      isReady: true,
    };

    setAuthStorage({ jwt: nextAuth.jwt, user: nextAuth.user });
    set(authAtom, nextAuth);
  } catch (error) {
    set(authAtom, (current) => ({
      ...current,
      status: "failed",
      error: error instanceof Error ? error.message : "Erreur inconnue.",
      isReady: true,
    }));
  }
});

export const logoutAtom = atom(null, async (get, set) => {
  const { jwt } = get(authAtom);

  try {
    if (jwt) {
      await apiFetch("/api/auth/logout", {
        method: "POST",
        token: jwt,
      });
    }
  } finally {
    clearAuthStorage();
    set(authAtom, emptyAuthState);
    set(postsAtom, initialPostsState);
    set(profileAtom, initialProfileState);
    set(viewedUserAtom, initialViewedUserState);
  }
});

export const fetchPostsAtom = atom(null, async (get, set) => {
  const { jwt } = get(authAtom);
  if (!jwt) {
    set(postsAtom, initialPostsState);
    return;
  }

  set(postsAtom, (current) => ({ ...current, status: "loading", error: null }));

  try {
    const data = await apiFetch("/api/posts", {
      token: jwt,
      query: "?_limit=30&_sort=created_at:desc&populate=user",
    });

    set(postsAtom, (current) => ({
      ...current,
      items: sortPosts(extractCollection(data).map(normalizePost)),
      status: "succeeded",
      error: null,
    }));
  } catch (error) {
    set(postsAtom, (current) => ({
      ...current,
      status: "failed",
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    }));
  }
});

export const createPostAtom = atom(null, async (get, set, text) => {
  const { jwt, user } = get(authAtom);
  if (!jwt || !user) {
    return;
  }

  set(postsAtom, (current) => ({ ...current, createStatus: "loading", error: null }));

  try {
    const data = await apiFetch("/api/posts", {
      method: "POST",
      token: jwt,
      body: { text, user: user.id },
    });

    const nextPost = normalizePost(data);
    set(postsAtom, (current) => ({
      ...current,
      createStatus: "succeeded",
      items: sortPosts([nextPost, ...current.items.filter((item) => item.id !== nextPost.id)]),
      error: null,
    }));
  } catch (error) {
    set(postsAtom, (current) => ({
      ...current,
      createStatus: "failed",
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    }));
    throw error;
  }
});

export const deletePostAtom = atom(null, async (get, set, postId) => {
  const { jwt } = get(authAtom);
  if (!jwt) {
    return;
  }

  try {
    await apiFetch(`/api/posts/${postId}`, {
      method: "DELETE",
      token: jwt,
    });

    set(postsAtom, (current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== postId),
    }));
    set(viewedUserAtom, (current) => ({
      ...current,
      posts: current.posts.filter((post) => post.id !== postId),
    }));
  } catch (error) {
    set(postsAtom, (current) => ({
      ...current,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    }));
  }
});

export const toggleLikeAtom = atom(null, async (get, set, post) => {
  const { jwt, user } = get(authAtom);
  if (!jwt || !user) {
    return;
  }

  try {
    const data = await apiFetch(`/api/posts/${post.id}`, {
      method: "PUT",
      token: jwt,
      body: {},
    });

    const nextPost = normalizePost(data);
    set(postsAtom, (current) => ({
      ...current,
      items: sortPosts(current.items.map((item) => (item.id === nextPost.id ? nextPost : item))),
    }));
    set(viewedUserAtom, (current) => ({
      ...current,
      posts: current.posts.map((item) => (item.id === nextPost.id ? nextPost : item)),
    }));
  } catch (error) {
    set(postsAtom, (current) => ({
      ...current,
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    }));
  }
});

export const fetchMyProfileAtom = atom(null, async (get, set) => {
  const { jwt } = get(authAtom);
  if (!jwt) {
    set(profileAtom, initialProfileState);
    return;
  }

  set(profileAtom, (current) => ({ ...current, status: "loading", error: null }));

  try {
    const data = await apiFetch("/api/users/me", { token: jwt });
    set(profileAtom, (current) => ({
      ...current,
      data: normalizeUser(data),
      status: "succeeded",
      error: null,
    }));
  } catch (error) {
    set(profileAtom, (current) => ({
      ...current,
      status: "failed",
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    }));
  }
});

export const updateMyProfileAtom = atom(null, async (get, set, payload) => {
  const { jwt, user } = get(authAtom);
  if (!jwt || !user) {
    return;
  }

  set(profileAtom, (current) => ({ ...current, updateStatus: "loading", error: null }));

  try {
    const data = await apiFetch(`/api/users/${user.id}`, {
      method: "PUT",
      token: jwt,
      body: payload,
    });

    const nextUser = normalizeUser(data);
    set(profileAtom, (current) => ({
      ...current,
      data: nextUser,
      updateStatus: "succeeded",
      error: null,
    }));
    set(authAtom, (current) => {
      const nextAuth = { ...current, user: nextUser, isReady: true };
      if (nextAuth.jwt) {
        setAuthStorage({ jwt: nextAuth.jwt, user: nextUser });
      }
      return nextAuth;
    });
  } catch (error) {
    set(profileAtom, (current) => ({
      ...current,
      updateStatus: "failed",
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    }));
  }
});

export const fetchUserByUsernameAtom = atom(null, async (get, set, username) => {
  const { jwt } = get(authAtom);
  if (!jwt) {
    set(viewedUserAtom, initialViewedUserState);
    return;
  }

  set(viewedUserAtom, (current) => ({ ...current, status: "loading", error: null }));

  try {
    let users = [];

    try {
      const filteredUsers = await apiFetch("/api/users", {
        token: jwt,
        query: `?username=${encodeURIComponent(username)}`,
      });
      users = Array.isArray(filteredUsers) ? filteredUsers : [];
    } catch {
      users = [];
    }

    if (!users.length) {
      const allUsers = await apiFetch("/api/users", {
        token: jwt,
        query: "?_limit=500",
      });
      users = Array.isArray(allUsers) ? allUsers : [];
    }

    const foundUser = users.find((entry) => entry.username?.toLowerCase() === username.toLowerCase());

    if (!foundUser) {
      throw new Error("Utilisateur introuvable.");
    }

    const profile = normalizeUser(foundUser);
    const postsData = await apiFetch("/api/posts", {
      token: jwt,
      query: `?user.id=${profile.id}&_sort=created_at:desc&populate=user`,
    });

    set(viewedUserAtom, {
      profile,
      posts: sortPosts(extractCollection(postsData).map(normalizePost)),
      status: "succeeded",
      error: null,
    });
  } catch (error) {
    set(viewedUserAtom, {
      ...initialViewedUserState,
      status: "failed",
      error: error instanceof Error ? error.message : "Erreur inconnue.",
    });
  }
});

export const clearViewedUserAtom = atom(null, (get, set) => {
  set(viewedUserAtom, initialViewedUserState);
});
