# ✦ Virtual Cosmos

A 2D proximity-based virtual space where users can move around and chat in real time. When two users come close to each other, a chat window automatically opens. When they move apart, it closes.

---

## 📸 Demo Flow

```
1. Open app → Enter username
2. See other users moving in real time
3. Move close to another user (within radius)
4. Chat panel appears → Start messaging
5. Move away → Chat panel closes
```

> **Test locally:** Open two browser tabs, enter different usernames, and move the avatars close together.

---

## 🗂️ Directory Structure

```
virtual-cosmos/
├── package.json                  ← Root: runs client + server together
├── shared/
│   └── types.js                  ← Socket event contracts & JSDoc types (DRY)
│
├── server/
│   ├── package.json
│   ├── .env                      ← Environment variables (copy from .env.example)
│   ├── .env.example
│   └── src/
│       ├── index.js              ← Entry point: bootstrap server
│       ├── app.js                ← Express app factory (middleware + routes)
│       ├── config/
│       │   ├── env.js            ← Centralised env config (DRY)
│       │   └── database.js       ← MongoDB connection
│       ├── models/
│       │   ├── User.js           ← Mongoose user schema
│       │   └── Message.js        ← Mongoose message schema
│       ├── controllers/
│       │   └── userController.js ← HTTP handlers (register, list)
│       ├── routes/
│       │   └── userRoutes.js     ← Express route definitions
│       ├── services/
│       │   └── sessionStore.js   ← In-memory live user state (Map)
│       ├── socket/
│       │   ├── index.js          ← Socket.IO server init
│       │   └── handlers.js       ← All socket event handlers
│       └── utils/
│           └── proximity.js      ← Pure proximity math functions
│
└── client/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx              ← React DOM entry point
        ├── App.jsx               ← Root component & layout
        ├── index.css             ← Tailwind + global styles
        ├── services/
        │   ├── socket.js         ← Socket.IO client singleton
        │   └── api.js            ← REST API helpers
        ├── store/
        │   └── useCosmosStore.js ← Zustand global state
        ├── hooks/
        │   ├── useSocket.js      ← All socket event subscriptions
        │   ├── useKeyboard.js    ← Key press tracking (ref-based)
        │   └── useMovement.js    ← Movement loop + socket emit throttle
        ├── components/
        │   ├── canvas/
        │   │   └── CosmosCanvas.jsx  ← PixiJS 2D world renderer
        │   ├── chat/
        │   │   └── ChatPanel.jsx     ← Proximity-triggered chat UI
        │   ├── hud/
        │   │   └── HUD.jsx           ← Overlay stats & controls
        │   └── ui/
        │       ├── LoginScreen.jsx   ← Username entry screen
        │       └── ProximityToast.jsx← Connect/disconnect notifications
        └── utils/
            └── proximity.js          ← Shared proximity math (client copy)
```

---

## ⚙️ Prerequisites

| Tool | Version | Why |
|------|---------|-----|
| Node.js | ≥ 18.x | ESM support, performance |
| npm | ≥ 9.x | Workspace scripts |
| MongoDB | ≥ 6.x | User & message persistence |

Install MongoDB Community: https://www.mongodb.com/docs/manual/installation/

---

## 🚀 Setup & Run

### 1. Install all dependencies

```bash
# From the project root
npm run install:all
```

This installs root, server, and client dependencies in one command.

### 2. Configure environment

```bash
cd server
cp .env.example .env
# Edit .env if your MongoDB URI is different
```

Default `.env`:
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/virtual-cosmos
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
PROXIMITY_RADIUS=150
```

### 3. Start MongoDB

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 4. Run the app (both client + server)

```bash
# From the project root — starts both concurrently
npm run dev
```

Or run separately:

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

### 5. Open the app

```
http://localhost:5173
```

Open **two tabs** with different usernames to test proximity chat.

---

## 🛠️ Tech Stack & Justification

### Backend

| Choice | Why |
|--------|-----|
| **Node.js + Express** | Non-blocking I/O ideal for many concurrent WebSocket connections |
| **Socket.IO** | Auto-reconnect, room management, binary events — more robust than raw WebSocket |
| **MongoDB + Mongoose** | Flexible schema for user/message data; easy to extend |
| **In-memory session store (Map)** | Position updates fire ~20/sec — writing each to DB would saturate MongoDB. RAM is the right layer for ephemeral, high-frequency state |

### Frontend

| Choice | Why |
|--------|-----|
| **React + Vite** | Instant HMR, native ESM, zero-config for this scale |
| **PixiJS** | Hardware-accelerated WebGL canvas; handles 100+ moving sprites at 60fps without jank. Better than plain `<canvas>` API for game-like rendering |
| **Zustand** | 3-line store setup vs Redux's boilerplate. Perfect for this app's state complexity (KISS) |
| **Tailwind CSS** | Utility-first — fast to build UI panels without leaving JSX |

---

## 🏗️ System Design Principles Applied

### SOLID

| Principle | Where Applied |
|-----------|--------------|
| **S**ingle Responsibility | Every file has one job: `proximity.js` = math only, `sessionStore.js` = in-memory state only, `handlers.js` = socket events only |
| **O**pen/Closed | New socket events → add handler in `handlers.js`, zero changes elsewhere. New routes → add to `userRoutes.js` only |
| **L**iskov Substitution | N/A (no inheritance hierarchy — composition preferred) |
| **I**nterface Segregation | `useKeyboard` only tracks keys. `useMovement` only computes deltas. `useSocket` only manages socket subscriptions |
| **D**ependency Inversion | `socket/index.js` depends on `handlers.js` abstraction, not on specific event logic |

### DRY (Don't Repeat Yourself)
- All env variables accessed from `config/env.js` — never `process.env` scattered around
- Room ID generation (`buildRoomId`) lives in one place; both `handlers.js` and client `proximity.js` use it
- `fetchJSON` in `api.js` wraps all HTTP calls — base URL in one place
- `shared/types.js` is the single source of truth for socket event contracts

### KISS (Keep It Simple, Stupid)
- Avatars are colored circles + initials — no sprite assets needed
- Proximity is Euclidean distance — no spatial indexing (fine for <100 concurrent users)
- Linear scan for proximity checks — quadratic at most O(n²) but n is small; premature optimization avoided
- Zustand over Redux — 3 lines vs 30 lines for the same result

---

## 🔌 Socket Event Reference

```
CLIENT → SERVER
  user:join      { userId, username, avatarColor, position }
  user:move      { userId, position: { x, y } }
  chat:send      { roomId, senderId, senderName, text }
  chat:history   { roomId }

SERVER → CLIENT
  players:snapshot    UserSession[]           ← sent once on join
  players:update      UserSession[]           ← broadcast on every move
  proximity:connected   { roomId, users }     ← when two users enter range
  proximity:disconnected { roomId }           ← when they move apart
  proximity:userLeft  { userId }              ← on disconnect
  chat:message        ChatMessage             ← new chat message
  chat:history        { roomId, messages[] }  ← history on room open
```

---

## 🔧 Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | Backend port |
| `MONGO_URI` | `mongodb://localhost:27017/virtual-cosmos` | MongoDB connection string |
| `CLIENT_ORIGIN` | `http://localhost:5173` | CORS allowed origin |
| `PROXIMITY_RADIUS` | `150` | Pixel radius for proximity detection |
| `NODE_ENV` | `development` | Environment flag |

---

## 🚢 Production Build

```bash
# Build the React frontend
npm run build

# Serve static files from Express (add to server/src/app.js):
# app.use(express.static(path.join(__dirname, '../../client/dist')));

# Start the server
npm start
```

---

## 📈 Scaling Considerations (Future)

| Problem | Solution |
|---------|----------|
| >100 concurrent users | Add spatial indexing (quadtree) for proximity checks |
| Multi-server deployment | Replace in-memory `sessionStore` with Redis |
| Position update load | Implement server-side movement interpolation |
| Chat history | Add pagination to `chat:history` endpoint |
| Authentication | Add JWT middleware to the `/api/users/register` route |

---

## 📝 Submission

Submit at: https://forms.gle/GtkmYbjw4FVkrCzB8

Include:
1. GitHub repository link (with this README)
2. 2–5 minute demo video showing movement, proximity chat connect/disconnect
