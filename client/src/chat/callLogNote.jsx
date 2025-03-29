import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, subscribeToMessages, getMessages } from '../services/socketService';
import { Typography, TextField, Button, Box, Divider, List, ListItem, ListItemText, IconButton, Grid, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

/*const CallLogNote = ({ chatId, participants, senderId }) => {




   

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                Chat with {participants.map((p) => p.name).join(', ')}
            </Typography>
            <Box sx={{ p: 2, width: '100%' }}>
                <Typography variant="h6" gutterBottom>
                    Add notes
                </Typography>
                <TextField
                    fullWidth
                    variant="outlined"
                    label="Type your notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSendMessage}
                >
                    Send
                </Button>
            </Box>


        </Box>

    );
};

export default CallLogNote;


return (

    <>

        


    </>
);*/