import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const Chat = () => {
  const { swapId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await api.get(`/chat/${swapId}`);
      setMessages(res.data);
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [swapId]); // fetchMessages is now defined inside, so no missing dependency

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await api.post(`/chat/${swapId}`, { message: newMessage });
    setNewMessage('');
    // Refresh messages after sending
    const res = await api.get(`/chat/${swapId}`);
    setMessages(res.data);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>Chat for Swap #{swapId}</h2>
      <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', backgroundColor: '#f9f9f9' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: '0.5rem', padding: '0.25rem', borderBottom: '1px solid #eee' }}>
            <strong>User {msg.senderId}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..." style={{ flex: 1, padding: '0.5rem' }} />
        <button onClick={sendMessage} style={{ padding: '0.5rem 1rem', backgroundColor: '#2d6a4f', color: 'white', border: 'none', borderRadius: '4px' }}>Send</button>
      </div>
    </div>
  );
};

export default Chat;