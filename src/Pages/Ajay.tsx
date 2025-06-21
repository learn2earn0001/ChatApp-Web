import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://192.168.1.15:5000');

type Message = {
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
};

const AjayChatBox = ({ currentUserId, otherUserId }: { currentUserId: string, otherUserId: string }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    socket.emit('join', { userId: currentUserId });

    axios.get(`http://192.168.1.15:5000/api/chat/messages/${currentUserId}/${otherUserId}`)
      .then(res => setMessages(res.data));

    socket.on('receiveMessage', (msg: Message) => {
      if (
        (msg.senderId === otherUserId && msg.receiverId === currentUserId)
      ) {
        setMessages(prev => [...prev, msg]);
      }
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, [currentUserId, otherUserId]);

  const sendMessage = () => {
    const msg = {
      senderId: currentUserId,
      receiverId: otherUserId,
      message: newMessage
    };
    socket.emit('sendMessage', msg);
    setMessages(prev => [...prev, { ...msg, timestamp: new Date().toISOString() }]);
    setNewMessage('');
  };
// try {
// const res = await axios.get(`http://localhost:5000/api/search?q=${query}`);
// setResults(res.data);
// } catch (err) {
// console.error('Search failed:', err);
// }
  return (
    <div className="p-4 border rounded w-full max-w-md mx-auto">
                <h1>AJAY </h1>
      <div className="h-64 overflow-y-auto mb-2 bg-gray-100 p-2 rounded">
        {messages.map((msg, i) => (
          <div key={i} className={`p-1 my-1 rounded ${msg.senderId === currentUserId ? 'text-right bg-blue-200' : 'text-left bg-gray-300'}`}>
            <p>{msg.message}</p>
            <small className="text-xs text-gray-600">{new Date(msg.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border px-2 py-1"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-4 py-1 rounded" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default AjayChatBox;
