Next.js minimal auth API (MongoDB)

This folder contains a minimal Next.js app that exposes two API routes:

- `POST /api/auth/register` — create a new user
- `POST /api/auth/login` — authenticate and get a JWT + user

It uses MongoDB, bcryptjs for password hashing and jsonwebtoken for tokens.

Environment

Create a file named `.env.local` in `next-api/` with these values:

MONGODB_URI="your mongodb connection string"
MONGODB_DB="your_db_name" # optional, default database from URI used if omitted
JWT_SECRET="a long secure secret"

Run locally

cd next-api
npm install
npm run dev

The API endpoints will be available at http://localhost:3000/api/auth/register and /api/auth/login

Notes

- This is an example to drop into a Next.js project. If you already have a Next.js app, copy `pages/api/auth/*` and `lib/mongodb.ts` into your app and install the listed dependencies.
- Always use HTTPS and secure env management in production. Rotate the JWT secret and use a proper cookie or Authorization header strategy on the client.
