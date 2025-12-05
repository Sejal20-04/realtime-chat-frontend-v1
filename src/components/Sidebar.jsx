// frontend/src/components/Sidebar.jsx
import { useEffect, useState } from "react";
import socket from "../socket";

export default function Sidebar({ currentChannel, onChannelSelect }) {
  const [channels, setChannels] = useState([]);
  const [newChannel, setNewChannel] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/channels`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        setChannels(data);
      } catch (err) {
        console.error("load channels failed", err);
      }
    }

    load();
    socket.on("channel_list_updated", load);

    return () => socket.off("channel_list_updated", load);
  }, []);

  async function createChannel(e) {
    e.preventDefault();
    if (!newChannel.trim()) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/channels`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ name: newChannel.trim() })
        }
      );

      const data = await res.json();

      if (res.ok) {
        setChannels(prev => [...prev, data]);
        setNewChannel("");
        socket.emit("channel_created", data);
      } else {
        console.error("create channel error", data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function handleSelect(ch) {
    if (currentChannel) socket.emit("leave_channel", currentChannel);
    socket.emit("join_channel", ch._id);
    onChannelSelect(ch);
  }

  return (
    <div style={styles.sidebar}>
      <h2 style={styles.title}>Channels</h2>

      <ul style={styles.list}>
        {channels.map(ch => (
          <li
            key={ch._id}
            onClick={() => handleSelect(ch)}
            style={{
              ...styles.channelItem,
              ...(currentChannel?._id === ch._id ? styles.activeChannel : {})
            }}
          >
            <span># {ch.name}</span>
            <span style={styles.memberCount}>{ch.members?.length ?? 0}</span>
          </li>
        ))}
      </ul>

      <form onSubmit={createChannel} style={styles.form}>
        <input
          value={newChannel}
          onChange={e => setNewChannel(e.target.value)}
          placeholder="New channel"
          style={styles.input}
        />
        <button style={styles.btn} type="submit">+</button>
      </form>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "260px",
    height: "100vh",
    background: "#1f1f1f",
    color: "white",
    padding: "15px",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid #333"
  },
  title: {
    fontSize: "20px",
    marginBottom: "12px",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    flex: 1,
    overflowY: "auto",
  },
  channelItem: {
    padding: "10px 12px",
    borderRadius: "8px",
    marginBottom: "6px",
    background: "#2a2a2a",
    display: "flex",
    justifyContent: "space-between",
    cursor: "pointer",
    transition: "0.2s",
  },
  activeChannel: {
    background: "#2563eb",
    fontWeight: "bold"
  },
  memberCount: {
    fontSize: "12px",
    opacity: 0.7,
  },
  form: {
    marginTop: "12px",
    display: "flex",
  },
  input: {
    flex: 1,
    padding: "6px",
    borderRadius: "6px",
    border: "1px solid #444",
    background: "#2a2a2a",
    color: "white",
  },
  btn: {
    padding: "6px 12px",
    marginLeft: "8px",
    border: "none",
    background: "#2563eb",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "bold",
  }
};

