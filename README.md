# Knowledge Universe

MERN app: React (Vite + Tailwind + Three.js) frontend, Express + MongoDB backend,
with live Wikipedia/DuckDuckGo fallback for unlimited topic search.

## Local setup

### Backend
```
cd server
npm install
cp .env.example .env   # fill in MONGO_URI
npm run dev
```

### Frontend
```
cd client
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000 for local dev
npm run dev
```

## Deployment
- Backend: deploy `server/` to Render, set MONGO_URI and FRONTEND_URL env vars
- Frontend: deploy `client/` to Vercel, set VITE_API_URL env var to your Render backend URL
- Database: MongoDB Atlas (already set up)
