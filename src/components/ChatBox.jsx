import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ChatBox = ({ meetingId, senderId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/messages/meeting/${meetingId}`);
      setMessages(res.data.filter(msg => !msg.deleted));
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await axios.post('http://localhost:8080/messages', {
        content: newMessage,
        timestamp: new Date().toISOString(),
        senderId,
        meetingId,
      });
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, [meetingId]);

  return (
    <div style={styles.chatContainer}>
      <div style={styles.messages}>
        {messages.map(msg => (
          <div key={msg.id} style={styles.message}>
            <strong>{msg.senderName || 'User'}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <div style={styles.inputArea}>
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleSendMessage} style={styles.button}>Send</button>
      </div>
    </div>
  );
};

const styles = {
  chatContainer: {
    width: '100%',
    maxWidth: '400px',
    height: '400px',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #ccc',
    borderRadius: '10px',
    padding: '10px',
    backgroundColor: 'white',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '10px',
  },
  message: {
    marginBottom: '5px',
    padding: '5px',
    backgroundColor: '#f1f1f1',
    borderRadius: '6px',
  },
  inputArea: {
    display: 'flex',
  },
  input: {
    flex: 1,
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '8px 12px',
    marginLeft: '5px',
    borderRadius: '6px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
  },
};

export default ChatBox;
