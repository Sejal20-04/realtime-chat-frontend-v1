// frontend/src/components/ChatWindow.jsx
import { useEffect, useRef, useState } from "react";
import socket from "../socket";

export default function ChatWindow({ currentChannel }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const topRef = useRef(null);

  const PAGE_SIZE = 20;

  useEffect(() => {
    setMessages([]);
    setPage(1);
    setHasMore(false);
    if (!currentChannel) return;

    // load latest messages (page 1)
    fetchPage(1);

    // subscribe to live messages for this channel
    socket.on("new_message", handleIncoming);
    return () => socket.off("new_message", handleIncoming);
    // eslint-disable-next-line
  }, [currentChannel]);

  async function fetchPage(p) {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/messages/${currentChannel}?page=${p}&limit=${PAGE_SIZE}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return;
    const data = await res.json();
    // server returns newest-first page; we want to display chronological
    if (p === 1) {
      setMessages(data.messages.reverse()); // show oldest -> newest in viewport
    } else {
      // when loading older pages, prepend them
      setMessages(prev => [...data.messages.reverse(), ...prev]);
    }
    setHasMore(data.hasMore);
    setPage(p);
  }

  function handleIncoming(msg) {
    // only append if message for current channel
    if (msg.channel.toString() === currentChannel) {
      setMessages(prev => [...prev, msg]);
      // scroll to bottom
      setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 50);
    }
  }

  async function sendMessage(e) {
  e.preventDefault();
  if (!input.trim() || !currentChannel) return;

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const userId =  user._id;  // <-- IMPORTANT FIX

  if (!userId) {
    console.error("❌ No userId found in localStorage");
    return;
  }

  socket.emit("send_message", {
    channelId: currentChannel,
    text: input,
    userId,
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
          <div style={{ padding: 12, borderBottom: '1px solid #eee' }}>
            <strong>Channel</strong>
          </div>

          <div className="messages-area" style={{ padding: 15 }}>
            {hasMore && (
              <button onClick={() => fetchPage(page + 1)}>Load older messages</button>
            )}

            {messages.map(msg => (
              <div key={msg._id} className="message">
                <strong>{msg.sender?.username}: </strong>
                <span>{msg.text}</span>
                <div style={{ fontSize: 11, color: '#666' }}>{new Date(msg.createdAt).toLocaleString()}</div>
              </div>
            ))}
            <div ref={topRef} />
          </div>

          <form className="message-input" onSubmit={sendMessage}>
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." />
            <button type="submit">Send</button>
          </form>
        </>
      )}
    </div>
  );
}
