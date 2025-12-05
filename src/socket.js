// frontend/src/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  autoConnect: false,
  transports: ["websocket"]
});

// helper: attach token and connect
export function connectSocketWithToken(token) {
  socket.auth = { token };
  socket.connect();
}

// helper: disconnect cleanly
export function disconnectSocket() {
  try { socket.disconnect(); } catch(e) {}
}

export default socket;
