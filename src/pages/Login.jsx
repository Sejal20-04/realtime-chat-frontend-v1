import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import socket from "../socket";

export default function Login() {
  const navigate = useNavigate();
  
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrUsername,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Save token
      
      // 🔥 IMPORTANT: Save user info
      // Save token
localStorage.setItem("token", data.token);

// Save full user (IMPORTANT)
localStorage.setItem("user", JSON.stringify({
  _id: data.user._id,
  username: data.user.username,
  email: data.user.email
}));


socket.auth = { token: data.token };
socket.connect();

navigate("/");

      // Connect socket
      
    } catch (err) {
      setError("Server error");
    }
  }

  return (
    <div className="auth-container">
      <h2>Login</h2>

      <form onSubmit={handleLogin} className="auth-form">
        <input
          type="text"
          placeholder="Email or Username"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>

        {error && <p className="error">{error}</p>}
      </form>

      <p>No account? <Link to="/register">Register</Link></p>
    </div>
  );
}
