const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:1337";

export function buildUrl(path, query = "") {
  return `${API_URL}${path}${query}`;
}

export async function apiFetch(path, { method = "GET", token, body, query = "" } = {}) {
  let response;

  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error(
      "Impossible de joindre l'API. Vérifie que le serveur backend écoute bien sur le port 1337."
    );
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message?.[0]?.messages?.[0]?.message ||
      data?.message ||
      "Une erreur API est survenue.";
    throw new Error(message);
  }

  return data;
}

export function getAuthStorage() {
  const raw = localStorage.getItem("social_auth");
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("social_auth");
    return null;
  }
}

export function setAuthStorage(value) {
  localStorage.setItem("social_auth", JSON.stringify(value));
}

export function clearAuthStorage() {
  localStorage.removeItem("social_auth");
}

function pickUser(source) {
  if (!source) {
    return null;
  }

  const user = source.attributes ? { id: source.id, ...source.attributes } : source;
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    description: user.description || "",
  };
}

export function normalizeUser(user) {
  return pickUser(user);
}

export function normalizePost(post) {
  if (!post) {
    return null;
  }

  const source = post.attributes ? { id: post.id, ...post.attributes } : post;
  const relatedUser =
    source.user?.data ? pickUser(source.user.data) : Array.isArray(source.user) ? pickUser(source.user[0]) : pickUser(source.user);
  const likes = source.like ?? source.likes ?? 0;
  const usersLikes = Array.isArray(source.users_likes)
    ? source.users_likes.map((entry) => (typeof entry === "object" ? entry.id : entry))
    : [];

  return {
    id: source.id,
    text: source.text || "",
    like: likes ?? 0,
    users_likes: usersLikes,
    createdAt: source.createdAt || source.created_at || null,
    updatedAt: source.updatedAt || source.updated_at || null,
    user: relatedUser,
    userId: relatedUser?.id || source.user?.id || source.user,
  };
}

export function extractCollection(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}
