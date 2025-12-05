// frontend/src/socket.js
import { io } from "socket.io-client";

// Pick backend URL (Render for production OR localhost for dev)
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const socket = io(BACKEND_URL, {
  autoConnect: false,
  transports: ["websocket"],
});

// helper: attach token and connect
export function connectSocketWithToken(token) {
  socket.auth = { token };
  socket.connect();
}

// helper: disconnect cleanly
export function disconnectSocket() {
  try {
    socket.disconnect();
  } catch (e) {}
}

export default socket;

