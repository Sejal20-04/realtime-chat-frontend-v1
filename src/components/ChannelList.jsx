import { useEffect, useState } from "react";

export default function ChannelList({ onSelect }) {
  const [channels, setChannels] = useState([]);

  async function loadChannels() {
   const res = await fetch( `${import.meta.env.VITE_BACKEND_URL}/api/channels`
, {
  headers: { Authorization: localStorage.getItem("token") }
});

    const data = await res.json();
    setChannels(data);
  }

  useEffect(() => {
    loadChannels();
  }, []);

  return (
    <div className="sidebar">
      <h3>Channels</h3>
      {channels.map(ch => (
        <p key={ch._id} onClick={() => onSelect(ch)}>
          #{ch.name} ({ch.members.length})
        </p>
      ))}
    </div>
  );
}
