import React, { useState, useEffect,useCallback } from 'react';
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
  DialogActions
} from '@mui/material';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

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
  const { user } = useAuth0();
  const [userId, setUserId] = useState([]);

  // Fetch users from the server
  const fetchItems =useCallback(async () => {
    try {

      fetchUserDetails(user.email)
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  },[user]);
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
    fetchItems();
  }, [fetchItems]);

  const handleUserClick = (user) => {
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
            <Tab label="Details" data-testid="details"/>
            <Tab label="Messages" data-testid="messages" />
            <Tab label="CallLog" data-testid="callLog" />
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
              {/* Messages UI here */}
              <Typography sx={{ mt: 1 }}>No messages available yet.</Typography>
              <TextField
                label="Type a message"
                fullWidth
                sx={{ my: 2 }}
                multiline
                rows={2}
                placeholder="Write your message here"
                data-testid="message"
              />
              <Button variant="contained" color="primary" data-testid="sendBtn" >Send Message</Button>
            </Box>
          )}

          {/* Tab Panel 3: CallLog */}
          {tabIndex === 2 && selectedUser && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6">Messages with {selectedUser.firstName}</Typography>
              {/* Messages UI here */}
              <Typography sx={{ mt: 1 }}>No messages available yet.</Typography>
              <TextField
                label="Type a message"
                fullWidth
                sx={{ my: 2 }}
                multiline
                rows={2}
                placeholder="Write your message here"
                data-testid="callloMessage"
              />
              <Button variant="contained" color="primary" data-testid="callogMessageBtn">Send Message</Button>
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
