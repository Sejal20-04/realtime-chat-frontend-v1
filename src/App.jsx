import "./App.css";
import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import ProtectedRoute from "./components/ProtectedRoute";
import { connectSocketWithToken } from "./socket";

export default function App() {
  const [channel, setChannel] = useState(null);

  // If user already logged in on refresh, re-connect socket
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) connectSocketWithToken(token);
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={
        <ProtectedRoute>
          <div className="app-container">
            <Sidebar currentChannel={channel} onChannelSelect={setChannel} />
            <ChatWindow currentChannel={channel} />
          </div>
        </ProtectedRoute>
      } />
    </Routes>
  );
}
