import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField } from '@mui/material';
import ChatWindow from './chatWindow';
import { startConversation } from '../services/socketService';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

const ChatList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth0();
  const [userId, setUserId] = useState([]);
  const [chatId, setChatId] = useState('');
  const [recieverId, setRecieverId] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // State for search query

  // Callback to handle chatId from socketService
  const handleChatId = (id) => {
    setChatId(id); // Set chatId in state
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users`);
      setUsers(res.data);
      fetchUserDetails(user.email);
    };
    fetchUsers();
    startConversation(selectedUsers, handleChatId);
  }, []);

  const fetchUserDetails = async (email) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${email}`);
      setUserId(response.data._id);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const handleUserClick = (userInfo) => {
    const userIds = [userId, userInfo._id];
    startConversation(userIds);
    setSelectedUsers([userInfo]);
    setRecieverId(userInfo._id);
    setOpen(true); // Open the dialog
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedUsers(null); // Clear selected user
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter users based on the search query
  const filteredUsers = users.filter((userInfo) =>
    userInfo.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (userInfo.firstName + ' ' + userInfo.lastName).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Chat
      </Typography>
      <TextField
        label="Search Users"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchQuery}
        onChange={handleSearchChange}
        data-testid="search"
      />
      <List>
        {filteredUsers.map((userInfo) => (
          <ListItem button key={userInfo._id} onClick={() => handleUserClick(userInfo)} data-testid="listItem">
            <ListItemText  primary={`${userInfo.firstName} ${userInfo.lastName}`} secondary={userInfo.email} data-testid="fullname"/>
          </ListItem>
        ))}
      </List>
      {chatId && <ChatWindow chatId={chatId} participants={selectedUsers} senderId={userId} data-testid="chatWindow"/>}
    </div>
  );
};

export default ChatList;
