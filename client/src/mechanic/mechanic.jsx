import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete
} from '@mui/material';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { startConversation, sendMessage, onMessageReceived, offMessageReceived, onConversationStarted, offConversationStarted, addUserToChat, onUserAdded, addNotes, getNotes, getBreakDown, onAcceptCall, onEndCall, removeUserFromChat, getCallLog, subscribeToMessages, getMessages, onReceiveCall, acceptCall, makeCall, connectSocket } from '../services/socketService';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const Mechanic = () => {
  const [selectedUser, setSelectedUser] = useState(null); // Stores the selected user
  const [tabIndex, setTabIndex] = useState(0); // Stores the current tab index
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false); // Controls dialog visibility
  const [isEditing, setIsEditing] = useState(false); // Controls whether we're adding or editing
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    userRole: 'Mechanic',
    isLive: '',
    vehicleOwnerId: ''
  });
  const [chatId, setChatId] = useState('');
  const { user } = useAuth0();
  const [userId, setUserId] = useState([]);
  const [messageData, setMessageData] = useState({
    senderId: '',
    content: [],
    callLog: [],
    usersInConversation: []
  });
  const [messages, setMessages] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedNumberPlate, setSelectedNumberPlate] = useState(null);
  const [searchNumberPlate, setSearchNumberPlate] = useState('');
  const [numberPlates, setNumberPlates] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [drivers, setDrivers] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    if (searchNumberPlate) {
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/truck/numberPlate`, {
        params: {
          searchNumberPlate,
          userId: userId
        }
      })
        .then(response => {
          setNumberPlates(response.data);
        })
        .catch(error => {
          console.error('Error fetching number plates:', error);
        });
    }
  }, [searchNumberPlate]);


  useEffect(() => {
    const handleConversation = ({ chatId }) => {
      console.log("Got chatId", chatId);
      setChatId(chatId);
    };

    onConversationStarted(handleConversation);

    return () => {
      // Clean up listener when component unmounts
      offConversationStarted(handleConversation);
    };
  }, [selectedUser]);


  const fetchItems = useCallback(async () => {
    try {
      await fetchUserDetails(user.email);

      if (selectedUser) {
        startConversation([userId, selectedUser._id]); // This will trigger conversationStarted event
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  }, [user, selectedUser]);

  const fetchDrivers = useCallback(async () => {
    if (!userId) return; // prevent running if userId isn't ready
  
    try {
      const params = searchQuery ? { query: searchQuery } : {};
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/truckDrivers/${userId}`, { params });
  
      setDrivers(Array.isArray(response.data) ? response.data : []); // safeguard
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setDrivers([]); // fallback
    }
  }, [searchQuery, userId]);  



  const fetchUserDetails = async (email) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${email}`);
      setUserId(response.data._id);
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/mechanics/${response.data._id}`);
      console.log(res.data)
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };


  useEffect(() => {
    fetchItems(); // still fine to run early
  }, [fetchItems]);
  
  useEffect(() => {
    if (userId) {
      fetchDrivers(); // only run once userId is ready
    }
  }, [userId, fetchDrivers]);


  useEffect(() => {
    if (chatId) {
      getMessages(chatId, (fetchedMessages) => {
        const flattenedMessages = fetchedMessages.flat();
        console.log("see flattered messages", flattenedMessages)
        setMessages(flattenedMessages);

      });
    }
  }, [chatId]);

  // Frontend: Listen for new messages
  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      console.log('Received new message:', newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]); // Append the new message
    };

    if (chatId) {
      onMessageReceived(handleNewMessage);
    }

    return () => {
      offMessageReceived(handleNewMessage); // Clean up listener when chatId changes
    };
  }, [chatId]);


  const handleUserClick = (user) => {
    console.log("kuphuka", userId)
    console.log("soft spot", user._id)
    const userIds = [userId, user._id];
    startConversation(userIds);
    setSelectedUser(user);
    setFormData(user);
    setIsEditing(true);
    setTabIndex(0);
    setOpenDialog(true); // Open dialog
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const handleOpen = () => {
    setIsEditing(false);
    setFormData({ firstName: '', lastName: '', email: '', userRole: 'mechanic', isLive: '', vehicleOwnerId: userId });
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/backend/user/${formData._id}`, formData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/user/`, formData);
      }
      fetchItems();
      handleClose();
    } catch (error) {
      console.error('Error updating/adding user:', error);
    }
  };

  const handleSendMessage = () => {
    if (userId && messageData && selectedUser._id) {
      sendMessage(chatId, userId, messageData, [selectedUser._id]);

      // Optionally, you can also append the message directly to the UI:
      setMessages((prevMessages) => [
        ...prevMessages,
        { senderId: userId, content: messageData },
      ]);

      // Clear the input after sending the message
      setMessageData({ content: '' });
    }
  };


  const handleDriverChange = (event, value) => {
    setSelectedDriver(value);
  };

  const handleBreakDownNavigation = async (e) => {
    e.preventDefault();
    navigate('/breakDownList');
  }

  const handleNumberPlateChange = (event, value) => {
    setSelectedNumberPlate(value);
  };

  const handleSaveNotes = () => {
      const noteId = uuidv4();
      const breakdown=true;
      console.log("check chatId",chatId)

      addNotes(chatId, userId, notes,breakdown, selectedNumberPlate.numberPlate, noteId, (response) => {
        if (response.success) {
          console.log('Notes updated successfully');
          // Optionally update the UI to reflect the saved notes
        } else {
          console.error('Error updating notes:', response.error);
        }
      });
      setNotes('');
      setSelectedDriver(null);
      setSearchQuery('');
      setSelectedNumberPlate(null);
      setSearchNumberPlate('');
      handleClose(); // Close the dialog after saving
    
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ my: 3 }}>Mechanics</Typography>

      {/* Add Driver Button */}
      <Button variant="contained" color="primary" sx={{ my: 2 }} onClick={handleOpen} data-testid="mechanicBtn">
        Add Mechanic
      </Button>

      {/* User List */}
      <List>
        {users.map((user) => (
          <ListItem button key={user._id} onClick={() => handleUserClick(user)} data-testid="userList">
            <ListItemText
              primary={`${user.firstName} ${user.lastName}`}
              secondary={`Email: ${user.email}`}
            />
          </ListItem>
        ))}
      </List>

      {/* Dialog for user details and messaging */}
      <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth="sm" data-testid="dialog">
        <DialogTitle>{isEditing ? `Edit User: ${formData.firstName}` : 'Add New Mechanic'}</DialogTitle>
        <DialogContent dividers>
          <Tabs value={tabIndex} onChange={handleTabChange} sx={{ my: 2 }}>
            <Tab label="Details" data-testid="details" />
            <Tab label="Messages" data-testid="messages" />
            <Tab label="BreakDown" data-testid="breakDown" />
          </Tabs>

          {/* Tab Panel 1: Edit Details */}
          {tabIndex === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">User Details</Typography>
              <TextField
                label="First Name"
                value={formData.firstName}
                fullWidth
                sx={{ my: 1 }}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                data-testid="firstName"
              />
              <TextField
                label="Last Name"
                value={formData.lastName}
                fullWidth
                sx={{ my: 1 }}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                data-testid="lastName"
              />
              <TextField
                label="Email"
                value={formData.email}
                fullWidth
                sx={{ my: 1 }}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                data-testid="email"
              />
              <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleEdit} data-testid="editBtn">
                {isEditing ? 'Save Changes' : 'Add Mechanic'}
              </Button>
            </Box>
          )}

          {/* Tab Panel 2: Messages */}
          {tabIndex === 1 && selectedUser && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Messages with {selectedUser.firstName}</Typography>

              <Box
                sx={{
                  maxHeight: '300px', // Set the max height for the scrollable area
                  overflowY: 'auto',  // Enable vertical scrolling
                  mt: 2,              // Add top margin for spacing
                  backgroundColor: '#f0f0f0', // Light grey background for the box
                  padding: 2,         // Add padding inside the box
                }}
              >
                {messages && messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const isSender = msg.content.senderId === userId; // Check if the message is from the current user

                    return (
                      <Typography
                        key={index}
                        sx={{
                          my: 1,
                          display: 'flex',
                          justifyContent: isSender ? 'flex-end' : 'flex-start',  // Align messages based on sender
                        }}
                      >
                        <Box
                          sx={{
                            backgroundColor: isSender ? '#a5d6f3' : '#ffffff', // Light blue for sender, white for receiver
                            borderRadius: '8px', // Round corners
                            padding: 1,          // Add padding inside the message box
                            maxWidth: '75%',     // Limit the message box width
                            boxShadow: '1px 1px 5px rgba(0, 0, 0, 0.1)', // Add subtle shadow for effect
                          }}
                        >
                          <div>{msg.content.content}</div> {/* Message content */}
                          <div>{msg.timestamp}</div> {/* Message content */}
                        </Box>
                      </Typography>
                    );
                  })
                ) : (
                  <Typography sx={{ mt: 1 }}>No messages available yet.</Typography>
                )}
              </Box>
              <TextField
                label="Type a message"
                fullWidth
                sx={{ my: 2 }}
                multiline
                rows={2}
                placeholder="Write your message here"
                value={messageData.content || ''}
                onChange={(e) => setMessageData({ ...messageData, content: e.target.value })}
                data-testid="message"
              />

              <Button variant="contained" color="primary" data-testid="sendBtn" onClick={handleSendMessage}>
                Send Message
              </Button>

            </Box>
          )}


          {/* Tab Panel 3: CallLog */}
          {tabIndex === 2  && (
            <Box sx={{ p: 2 }}>
              <Button variant="contained" color="primary" sx={{ my: 2 }} onClick={handleBreakDownNavigation} data-testid="viewBreaDownBtn">
               View BreakDown
              </Button>


              <Autocomplete
                value={selectedDriver}
                onChange={handleDriverChange}
                inputValue={searchQuery}
                onInputChange={(e, newInputValue) => setSearchQuery(newInputValue)}
                options={drivers}
                getOptionLabel={(driver) => `${driver.firstName} ${driver.lastName}`}
                renderInput={(params) => <TextField {...params} label="Driver" variant="outlined" />}
              />

              <Autocomplete
                value={selectedNumberPlate}
                onChange={handleNumberPlateChange}
                inputValue={searchNumberPlate}
                onInputChange={(event, newInputValue) => setSearchNumberPlate(newInputValue)}
                options={numberPlates}
                getOptionLabel={(option) => option.numberPlate}
                renderInput={(params) => <TextField {...params} label="Number Plate" variant="outlined" margin="normal" />}
                renderOption={(props, option) => (
                  <li {...props} key={option.numberPlate}>
                    {option.numberPlate}
                  </li>
                )}

                className="text-field"
                data-testid="driverSearch"
              />

              <TextField
                autoFocus
                margin="dense"
                id="notes"
                label="Add new notes"
                type="text"
                fullWidth
                variant="outlined"
                value={notes}
                onChange={(e) => setNotes(e.target.value)} // Handle note input change
                data-testid="noteInput"
                multiline
                minRows={4} // You can adjust this as needed
              />

              <DialogActions>
                <Button onClick={handleClose} color="primary" data-testid="cancelBtn">
                  Cancel
                </Button>
                <Button onClick={handleSaveNotes} color="primary" disabled={!selectedDriver || !selectedNumberPlate} data-testid="saveNotes">
                  Save Notes
                </Button>
              </DialogActions>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary" data-testid="closeBtn">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Mechanic;
