API server (Express + MongoDB)

Run locally:

1. Copy `.env.example` to `.env` and fill `MONGODB_URI` and `JWT_SECRET`.

2. Install and start:

```
cd api-server
npm install
npm run dev
```

Server runs on `http://localhost:4000` by default.

Endpoints:
- `POST /auth/register` { name, email, institution, password }
- `POST /auth/login` { email, password }

The server ensures a unique index on `users.email` on startup.
