// frontend/src/components/ChatWindow.jsx
import { useEffect, useRef, useState } from "react";
import socket from "../socket";

export default function ChatWindow({ currentChannel }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const chatBottomRef = useRef(null);

  const PAGE_SIZE = 20;

  useEffect(() => {
    if (!currentChannel) return;

    setMessages([]);
    setPage(1);
    fetchPage(1);

    socket.on("new_message", handleIncoming);

    return () => socket.off("new_message", handleIncoming);
  }, [currentChannel]);

  async function fetchPage(p) {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/messages/${currentChannel._id}?page=${p}&limit=${PAGE_SIZE}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) return;
    const data = await res.json();

    if (p === 1) {
      setMessages(data.messages.reverse());
    } else {
      setMessages((prev) => [...data.messages.reverse(), ...prev]);
    }

    setHasMore(data.hasMore);
    setPage(p);

    // Scroll to bottom on first load
    if (p === 1) {
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }

  function handleIncoming(msg) {
    if (msg.channel.toString() !== currentChannel._id) return;

    setMessages((prev) => [...prev, msg]);

    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (!user._id) {
      console.error("❌ No userId found in localStorage");
      return;
    }

    socket.emit("send_message", {
      channelId: currentChannel._id,
      text: input,
      userId: user._id,
      username: user.username
    });

    setInput("");
  }

  return (
    <div className="chat-window">
      {!currentChannel ? (
        <p style={{ padding: 20 }}>Select a channel to start chatting.</p>
      ) : (
        <>
          <div className="chat-header">
            <h3># {currentChannel.name}</h3>
          </div>

          <div className="messages-area">
            {hasMore && (
              <button
                className="load-btn"
                onClick={() => fetchPage(page + 1)}
              >
                Load older messages
              </button>
            )}

            {messages.map((msg) => (
              <div key={msg._id} className="message">
                <strong>{msg.sender?.username}:</strong>
                <span> {msg.text}</span>
                <div className="timestamp">
                  {new Date(msg.createdAt).toLocaleString()}
                </div>
              </div>
            ))}

            <div ref={chatBottomRef}></div>
          </div>

          <form className="message-input" onSubmit={sendMessage}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit">Send</button>
          </form>
        </>
      )}
    </div>
  );
}

