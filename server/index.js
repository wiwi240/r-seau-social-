import http from "node:http";
import { URL } from "node:url";
import { createToken, hashPassword, verifyPassword } from "./auth.js";
import { readDb, writeDb } from "./db.js";

const PORT = 1337;

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  });
  response.end(JSON.stringify(payload));
}

function sendError(response, status, message) {
  sendJson(response, status, { message });
}

async function readBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (!chunks.length) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function withoutSensitiveUserFields(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    description: user.description || "",
  };
}

function serializePost(post, user) {
  return {
    id: post.id,
    text: post.text,
    like: post.like ?? 0,
    users_likes: Array.isArray(post.users_likes) ? post.users_likes : [],
    created_at: post.created_at,
    updated_at: post.updated_at,
    user: user ? withoutSensitiveUserFields(user) : null,
  };
}

function getBearerToken(request) {
  const header = request.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length);
}

function getAuthenticatedUser(db, request) {
  const token = getBearerToken(request);
  if (!token) {
    return null;
  }

  const session = db.sessions.find((entry) => entry.token === token);
  if (!session) {
    return null;
  }

  return db.users.find((user) => user.id === session.userId) || null;
}

function nextId(collection) {
  return collection.length ? Math.max(...collection.map((entry) => Number(entry.id))) + 1 : 1;
}

function normalizeQueryValue(value) {
  return value === null ? undefined : value;
}

function sortPosts(posts, sort) {
  if (sort === "created_at:desc") {
    return [...posts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  if (sort === "created_at:asc") {
    return [...posts].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  return posts;
}

async function handleRegister(request, response, db) {
  const body = await readBody(request);
  const username = String(body.username || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!username || !email || !password) {
    return sendError(response, 400, "username, email et password sont requis.");
  }

  if (db.users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
    return sendError(response, 409, "Ce username est déjà utilisé.");
  }

  if (db.users.some((user) => user.email.toLowerCase() === email)) {
    return sendError(response, 409, "Cet email est déjà utilisé.");
  }

  const now = new Date().toISOString();
  const user = {
    id: nextId(db.users),
    username,
    email,
    description: "",
    passwordHash: hashPassword(password),
    created_at: now,
    updated_at: now,
  };
  const token = createToken();

  db.users.push(user);
  db.sessions.push({
    token,
    userId: user.id,
    created_at: now,
  });
  await writeDb(db);

  return sendJson(response, 201, {
    jwt: token,
    user: withoutSensitiveUserFields(user),
  });
}

async function handleLogin(request, response, db) {
  const body = await readBody(request);
  const identifier = String(body.identifier || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!identifier || !password) {
    return sendError(response, 400, "identifier et password sont requis.");
  }

  const user = db.users.find(
    (entry) =>
      entry.email.toLowerCase() === identifier || entry.username.toLowerCase() === identifier
  );

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return sendError(response, 401, "Identifiants invalides.");
  }

  const token = createToken();
  db.sessions.push({
    token,
    userId: user.id,
    created_at: new Date().toISOString(),
  });
  await writeDb(db);

  return sendJson(response, 200, {
    jwt: token,
    user: withoutSensitiveUserFields(user),
  });
}

async function handleLogout(response, db, request) {
  const token = getBearerToken(request);
  if (!token) {
    return sendError(response, 401, "Authentification requise.");
  }

  const nextSessions = db.sessions.filter((entry) => entry.token !== token);
  db.sessions = nextSessions;
  await writeDb(db);

  return sendJson(response, 200, { ok: true });
}

async function handleGetUsers(request, response, db, currentUser, url) {
  if (!currentUser) {
    return sendError(response, 401, "Authentification requise.");
  }

  const username = normalizeQueryValue(url.searchParams.get("username"));
  const limitValue = normalizeQueryValue(url.searchParams.get("_limit"));

  let users = [...db.users];
  if (username) {
    users = users.filter((user) => user.username.toLowerCase() === username.toLowerCase());
  }

  if (limitValue) {
    users = users.slice(0, Number(limitValue));
  }

  return sendJson(response, 200, users.map(withoutSensitiveUserFields));
}

async function handleUpdateUser(request, response, db, currentUser, userId) {
  if (!currentUser) {
    return sendError(response, 401, "Authentification requise.");
  }

  if (currentUser.id !== userId) {
    return sendError(response, 403, "Tu ne peux modifier que ton propre profil.");
  }

  const body = await readBody(request);
  const username = String(body.username || "").trim();
  const description = String(body.description || "").trim();

  if (!username) {
    return sendError(response, 400, "Le username est requis.");
  }

  const existingUsername = db.users.find(
    (user) => user.id !== userId && user.username.toLowerCase() === username.toLowerCase()
  );
  if (existingUsername) {
    return sendError(response, 409, "Ce username est déjà utilisé.");
  }

  const user = db.users.find((entry) => entry.id === userId);
  if (!user) {
    return sendError(response, 404, "Utilisateur introuvable.");
  }

  user.username = username;
  user.description = description;
  user.updated_at = new Date().toISOString();
  await writeDb(db);

  return sendJson(response, 200, withoutSensitiveUserFields(user));
}

async function handleGetPosts(request, response, db, currentUser, url) {
  if (!currentUser) {
    return sendError(response, 401, "Authentification requise.");
  }

  const limitValue = normalizeQueryValue(url.searchParams.get("_limit"));
  const sortValue = normalizeQueryValue(url.searchParams.get("_sort"));
  const userIdFilter = normalizeQueryValue(url.searchParams.get("user.id"));

  let posts = [...db.posts];
  if (userIdFilter) {
    posts = posts.filter((post) => String(post.user) === String(userIdFilter));
  }

  posts = sortPosts(posts, sortValue);
  if (limitValue) {
    posts = posts.slice(0, Number(limitValue));
  }

  const payload = posts.map((post) => {
    const user = db.users.find((entry) => entry.id === post.user);
    return serializePost(post, user);
  });

  return sendJson(response, 200, payload);
}

async function handleCreatePost(request, response, db, currentUser) {
  if (!currentUser) {
    return sendError(response, 401, "Authentification requise.");
  }

  const body = await readBody(request);
  const text = String(body.text || "").trim();
  const userId = Number(body.user);

  if (!text) {
    return sendError(response, 400, "Le texte du post est requis.");
  }

  if (currentUser.id !== userId) {
    return sendError(response, 403, "Tu ne peux créer un post que pour ton propre compte.");
  }

  const now = new Date().toISOString();
  const post = {
    id: nextId(db.posts),
    text,
    user: currentUser.id,
    like: 0,
    users_likes: [],
    created_at: now,
    updated_at: now,
  };
  db.posts.push(post);
  await writeDb(db);

  return sendJson(response, 201, serializePost(post, currentUser));
}

async function handleUpdatePost(request, response, db, currentUser, postId) {
  if (!currentUser) {
    return sendError(response, 401, "Authentification requise.");
  }

  const post = db.posts.find((entry) => entry.id === postId);
  if (!post) {
    return sendError(response, 404, "Post introuvable.");
  }

  await readBody(request);
  const currentLikes = Array.isArray(post.users_likes) ? [...post.users_likes] : [];
  const alreadyLiked = currentLikes.includes(currentUser.id);

  post.users_likes = alreadyLiked
    ? currentLikes.filter((id) => id !== currentUser.id)
    : [...currentLikes, currentUser.id];
  post.like = Math.max(post.users_likes.length, 0);
  post.updated_at = new Date().toISOString();
  await writeDb(db);

  const author = db.users.find((entry) => entry.id === post.user);
  return sendJson(response, 200, serializePost(post, author));
}

async function handleDeletePost(response, db, currentUser, postId) {
  if (!currentUser) {
    return sendError(response, 401, "Authentification requise.");
  }

  const index = db.posts.findIndex((entry) => entry.id === postId);
  if (index === -1) {
    return sendError(response, 404, "Post introuvable.");
  }

  if (db.posts[index].user !== currentUser.id) {
    return sendError(response, 403, "Tu ne peux supprimer que tes propres posts.");
  }

  db.posts.splice(index, 1);
  await writeDb(db);

  return sendJson(response, 200, { ok: true });
}

const server = http.createServer(async (request, response) => {
  try {
    if (!request.url) {
      return sendError(response, 400, "Requête invalide.");
    }

    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      });
      response.end();
      return;
    }

    const url = new URL(request.url, `http://localhost:${PORT}`);
    const db = await readDb();
    const currentUser = getAuthenticatedUser(db, request);

    if (request.method === "POST" && url.pathname === "/api/auth/local/register") {
      return handleRegister(request, response, db);
    }

    if (request.method === "POST" && url.pathname === "/api/auth/local") {
      return handleLogin(request, response, db);
    }

    if (request.method === "POST" && url.pathname === "/api/auth/logout") {
      return handleLogout(response, db, request);
    }

    if (request.method === "GET" && url.pathname === "/api/users/me") {
      if (!currentUser) {
        return sendError(response, 401, "Authentification requise.");
      }
      return sendJson(response, 200, withoutSensitiveUserFields(currentUser));
    }

    if (request.method === "GET" && url.pathname === "/api/users") {
      return handleGetUsers(request, response, db, currentUser, url);
    }

    if (request.method === "GET" && /^\/api\/users\/\d+$/.test(url.pathname)) {
      if (!currentUser) {
        return sendError(response, 401, "Authentification requise.");
      }

      const userId = Number(url.pathname.split("/").pop());
      const user = db.users.find((entry) => entry.id === userId);
      if (!user) {
        return sendError(response, 404, "Utilisateur introuvable.");
      }
      return sendJson(response, 200, withoutSensitiveUserFields(user));
    }

    if (request.method === "PUT" && /^\/api\/users\/\d+$/.test(url.pathname)) {
      const userId = Number(url.pathname.split("/").pop());
      return handleUpdateUser(request, response, db, currentUser, userId);
    }

    if (request.method === "GET" && url.pathname === "/api/posts/count") {
      if (!currentUser) {
        return sendError(response, 401, "Authentification requise.");
      }
      return sendJson(response, 200, db.posts.length);
    }

    if (request.method === "GET" && url.pathname === "/api/posts") {
      return handleGetPosts(request, response, db, currentUser, url);
    }

    if (request.method === "POST" && url.pathname === "/api/posts") {
      return handleCreatePost(request, response, db, currentUser);
    }

    if (request.method === "PUT" && /^\/api\/posts\/\d+$/.test(url.pathname)) {
      const postId = Number(url.pathname.split("/").pop());
      return handleUpdatePost(request, response, db, currentUser, postId);
    }

    if (request.method === "DELETE" && /^\/api\/posts\/\d+$/.test(url.pathname)) {
      const postId = Number(url.pathname.split("/").pop());
      return handleDeletePost(response, db, currentUser, postId);
    }

    return sendError(response, 404, "Route introuvable.");
  } catch (error) {
    return sendError(response, 500, error instanceof Error ? error.message : "Erreur interne.");
  }
});

server.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
