# Mini Social Network

A small social network application built with React on the frontend and a custom Node.js backend.

## Stack

### Frontend

- React 18
- React DOM
- Redux Toolkit
- React Redux
- React Router DOM
- Vite

### Backend

- Node.js
- native `http` server
- local JSON file persistence

## Features

- user registration
- user login with email or username
- user logout
- personal profile page
- profile update
- post creation
- reverse chronological feed
- like / unlike posts
- delete own posts
- public author profile page

## Project Structure

```text
.
├── server
│   ├── auth.js
│   ├── db.js
│   ├── db.json
│   └── index.js
├── src
│   ├── app
│   ├── components
│   ├── features
│   ├── lib
│   ├── pages
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Installation

Install dependencies:

```bash
npm install
```

## Scripts

### Run frontend only

```bash
npm run dev
```

Starts the Vite development server.

### Run backend only

```bash
npm run dev:api
```

Starts the backend with file watching on port `1337`.

### Run frontend and backend together

```bash
npm run dev:all
```

This is the main development command.

It starts:

- the backend on `http://localhost:1337`
- the frontend on the Vite dev server, usually `http://localhost:5173`

### Build the frontend

```bash
npm run build
```

Build output is generated in:

```text
dist/
```

### Preview the frontend build

```bash
npm run preview
```

### Run backend without watch mode

```bash
npm run start:api
```

## Build

The project build process is handled by Vite for the frontend.

When you run:

```bash
npm run build
```

the frontend application is bundled into the `dist/` folder.

Important:

- the backend is not bundled
- the backend remains in `server/`
- running the full application still requires the backend server

## Local URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:1337`

## API Routes

The local backend exposes these main routes:

- `POST /api/auth/local/register`
- `POST /api/auth/local`
- `POST /api/auth/logout`
- `GET /api/users/me`
- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `GET /api/posts`
- `GET /api/posts/count`
- `POST /api/posts`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`

## Data Persistence

Application data is stored locally in:

```text
server/db.json
```

This includes:

- users
- posts
- sessions

## Notes

- this project does not use Strapi
- authentication is token-based
- this is an MVP-style implementation with local file persistence

## Current Status

The frontend build passes with:

```bash
npm run build
```

For local development, use:

```bash
npm run dev:all
```
