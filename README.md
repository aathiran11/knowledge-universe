# Knowledge Universe — Phase 1 (Firestore)

MERN-ish skeleton: React (Vite + Tailwind) frontend, Express backend, Firebase Firestore as the database.

## 1. Create a Firebase project

1. Go to https://console.firebase.google.com
2. Click **Add project**, name it (e.g. `knowledge-universe`), finish setup
3. In the left sidebar go to **Build → Firestore Database → Create database**
   - Start in **test mode** for now (you'll lock it down before deploying for real)
4. Go to **Project settings (gear icon) → Service accounts**
5. Click **Generate new private key** — this downloads a JSON file
6. Rename that file `serviceAccountKey.json` and put it inside the `server/` folder
   (it's already git-ignored, so it won't get committed)

## 2. Backend setup

```bash
cd server
npm install
cp .env.example .env
```

`.env` should look like:
```
PORT=5000
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

Start the server:
```bash
npm run dev
```

You should see `Server running on port 5000`.

## 3. Frontend setup

In a new terminal:
```bash
cd client
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173).

## Phase 1 done when...

The page shows **"Knowledge Universe API is alive (Firestore connected)"**.
If it says "Backend not reachable," check the server terminal for errors — usually a missing/misplaced `serviceAccountKey.json`.

## Next: Phase 2 — Space UI

Starfield, nebula, ambient camera drift using Three.js / React Three Fiber / Drei.
