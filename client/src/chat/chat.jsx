import React, { useState, useEffect } from 'react';
//import { sendMessage, receiveMessage } from '../services/socketService';
import { io } from 'socket.io-client';
import socket from '../services/socketService';
import Message from './message';
//import Message from 'Message';
import axios from 'axios';


function Chat() {
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [userId, setuserId] = useState('');
    const [partnerId, setpartnerId] = useState('');

    // Fetch existing messages from the database
    const fetchChatHistory = async () => {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/chat/${userId}/${partnerId}`);
        setChatHistory(response.data);
    };

    useEffect(() => {
        fetchChatHistory();

        socket.on('receiveMessage', (newMessage) => {
            setChatHistory(prev => [...prev, newMessage]);
        });

        return () => {
            socket.off('receiveMessage');
        };
    }, []);

    const sendMessage = () => {
        socket.emit('sendMessage', { sender: userId, receiver: partnerId, message });
        setMessage('');
    };

    return (
        <div>
            <div>
                {chatHistory.map((chat, index) => (
                    <div key={index} data-testid="SubmitBtn">
                        <strong>{chat.sender}:</strong> {chat.message}
                    </div>
                ))}
            </div>
            <input 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                placeholder="Type your message..." 
                data-testid="SubmitBtn"
            />
            <button onClick={sendMessage} data-testid="SubmitBtn">Send</button>
        </div>
    );
}

export default Chat;
