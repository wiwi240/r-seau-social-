# Mini Social Network

A small social network application built with React, Jotai, and a local Node.js backend.

## Features

- user registration
- user login and logout
- profile display and update
- post creation
- reverse chronological feed
- author profile access from posts

## Stack

- React
- Jotai
- React Router DOM
- Vite
- Node.js

## Installation

```bash
pnpm install
```

## Run the project

Start the full application:

```bash
pnpm run dev:all
```

This starts:

- frontend: `http://localhost:5173`
- backend: `http://127.0.0.1:1337`

If you want to run each part separately:

```bash
pnpm run dev
pnpm run dev:api
```

## Build

```bash
pnpm run build
```

## API check

After starting the backend, you can verify that it responds with:

```bash
curl http://127.0.0.1:1337/api/users/me
```

A `401 Unauthorized` response is normal if you are not logged in. It still proves the API is reachable.

## Notes

- the backend uses local JSON persistence in `server/db.json`
- the backend listens on `127.0.0.1:1337` by default
- global state is handled with Jotai
