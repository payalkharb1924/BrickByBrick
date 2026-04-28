# GrindTracker

A MERN stack productivity app for developers actively job hunting. Combines a DSA practice tracker, job application pipeline, and weekly review system into a single dashboard.

## Tech Stack

- **Frontend**: React (Vite) + TailwindCSS + shadcn/ui + Zustand + React Router
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Auth**: JWT

## Project Structure

```
grindtracker/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── api/         # Axios API client
│   │   ├── components/  # Reusable UI components
│   │   ├── lib/         # Utilities (cn, etc.)
│   │   ├── pages/       # Route-level page components
│   │   └── store/       # Zustand stores
│   ├── components.json  # shadcn/ui config
│   ├── tailwind.config.js
│   └── vite.config.js
└── server/          # Express backend
    ├── controllers/
    ├── middleware/
    ├── models/
    └── routes/
```

## Setup

### Prerequisites

- Node.js >= 18
- MongoDB running locally (or a MongoDB Atlas URI)

### Backend

```bash
cd server
cp .env.example .env
# Edit .env with your values
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173` and proxies `/api` requests to `http://localhost:5000`.

## Environment Variables

Copy `server/.env.example` to `server/.env` and fill in:

| Variable    | Description                        | Default                                  |
|-------------|------------------------------------|------------------------------------------|
| PORT        | Server port                        | 5000                                     |
| MONGO_URI   | MongoDB connection string          | mongodb://localhost:27017/grindtracker   |
| JWT_SECRET  | Secret key for signing JWTs        | (required — set a strong random string)  |

## Routes

| Path        | Description              |
|-------------|--------------------------|
| `/`         | Dashboard (home)         |
| `/dsa`      | DSA Tracker              |
| `/jobs`     | Job Applications         |
| `/reviews`  | Weekly Reviews           |
| `/mistakes` | Mistake Log              |
| `/login`    | Login                    |
| `/register` | Register                 |
