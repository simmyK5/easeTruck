import React, { useState } from 'react';
import { Checkbox, Button, List, ListItem, ListItemText } from '@mui/material';

const GroupChat = ({ users, onCreateGroupChat }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleUserSelect = (user) => {
    if (selectedUsers.includes(user._id)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== user._id));
    } else {
      setSelectedUsers([...selectedUsers, user._id]);
    }
  };

  return (
    <div>
      <List>
        {users.map((user) => (
          <ListItem key={user._id} button>
            <Checkbox
              checked={selectedUsers.includes(user._id)}
              onChange={() => handleUserSelect(user)}
            />
            <ListItemText primary={user.username} />
          </ListItem>
        ))}
      </List>
      <Button
        onClick={() => onCreateGroupChat(selectedUsers)}
        variant="contained"
        disabled={selectedUsers.length < 2}
      >
        Create Group Chat
      </Button>
    </div>
  );
};

export default GroupChat;
