import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, addUserToChat, onUserAdded, addNotes, getNotes, getBreakDown, onAcceptCall, onEndCall, removeUserFromChat, getCallLog, subscribeToMessages, getMessages, onReceiveCall, acceptCall, makeCall, connectSocket } from '../services/socketService';
import { Typography, TextField, Button, Box, Divider, Autocomplete, FormControlLabel, Checkbox, List, ListItem, ListItemText, DialogActions, IconButton, Grid, Paper, DialogTitle, DialogContent, Tabs, Tab, Dialog } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import Peer from 'simple-peer';
import ringtoneAudio from '../ringtone/7120-download-iphone-6-original-ringtone-42676.mp3';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import './chatWindow.css'


const ChatWindow = ({ chatId, participants, senderId }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState(participants);
  const [userIdToRemove, setUserIdToRemove] = useState('');
  const [callIncoming, setCallIncoming] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const myVideo = useRef();
  const userVideo = useRef();
  const peerRef = useRef();
  const audioRef = useRef(new Audio(ringtoneAudio));
  const [inCall, setInCall] = useState(false);
  const [callLogs, setCallLogs] = useState([]);
  const [noteLog, setNoteLog] = useState([]);
  const [breakDownLog, setBreakDownLog] = useState([]);
  const [notes, setNotes] = useState([]);
  const [breakDown, setBreakDown] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [callerId, setCallerId] = useState(null);
  const [callStarted, setCallStarted] = useState(false);
  const [callStartTime, setCallStartTime] = useState('');
  const [open, setOpen] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);
  const [openNote, setOpenNote] = useState(false);
  const [selectedCallLogs, setSelectedCallLogs] = useState(null);
  const [searchNumberPlate, setSearchNumberPlate] = useState('');
  const [selectedNumberPlate, setSelectedNumberPlate] = useState(null);
  const [numberPlates, setNumberPlates] = useState([]);



  useEffect(() => {
    if (searchNumberPlate) {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/truck/numberPlate`, {
            params: {
                searchNumberPlate,
                userId: senderId
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


  const handleSendMessage = () => {
    if (chatId && senderId && message && participants) {
      sendMessage(chatId, senderId, message, participants);
      setMessage(''); // Clear input after sending
      //setEditingMessageId(null); // Reset editing state
    }
  };

  const handleCallEnd = () => {
    const endTime = new Date();

    // Calculate duration (assuming `callStartTime` was recorded when the call was accepted)
    const callDuration = Math.floor((endTime - callStartTime) / 1000); // Duration in seconds

    onEndCall(
      chatId,    // The chatId for this call
      endTime,
      callDuration,
      { isCall: true }
    );

    // Destroy the peer connection if it exists
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null; // 
    }

    // Stop local video stream
    if (myVideo.current && myVideo.current.srcObject) {
      myVideo.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    if (userVideo.current.srcObject) {
      userVideo.current.srcObject.getTracks().forEach(track => track.stop());
    }

    // Clean up UI (optional)
    userVideo.current.srcObject = null;
    setCallEnded(true); // Update state to reflect the call has ended
    setInCall(false); // No longer in a call
    if (audioRef.current) {
      audioRef.current.pause(); // Stop the audio
      audioRef.current.currentTime = 0; // Reset the playback position
    }

    setCallAccepted(false);
    setCallIncoming(false);
    setCallStarted(false);


  };




  useEffect(() => {

    if (chatId) {

      getCallLog(chatId, (msgs) => {
        setCallLogs(msgs); // Set the retrieved messages in state
      });
      getNotes(chatId, (msgs) => {
        setNoteLog(msgs); // Set the retrieved messages in state
      });

      getBreakDown(chatId, (msgs) => {
        setBreakDownLog(msgs); // Set the retrieved messages in state
      });


    }
    getMessages(chatId, (fetchedMessages) => {
      const flattenedMessages = fetchedMessages.flat();
      setMessages(flattenedMessages);
    });

    subscribeToMessages((newMessage) => {
      if (newMessage.chatId === chatId) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    onUserAdded(({ chatId: updatedChatId, users }) => {
      console.log(updatedChatId)
      console.log(chatId)
      if (updatedChatId === chatId) {
        setMembers(users);  // Update the user list
      }
    });

    // Set up the socket listener for incoming calls
    onReceiveCall((signal, senderId) => {

      setInCall(true); // Set the state to indicate that you are in a call
      setCallIncoming(true);
      setCallerId(senderId);
      audioRef.current.play(); // Play ringtone on incoming call
      handleIncomingCall(senderId, signal); // Handle the incoming call

    });
    const acceptCall = (callerId, signalData) => {
      // Emit the 'accept-call' event with the signal data
      // socket.emit('accept-call', { callerId, signalData });
      acceptCall('acceptCall', { callerId, signalData })
    };


  }, [chatId]);


  // Handle adding a new user
  const handleAddUser = (newUserId) => {
    addUserToChat(chatId, newUserId);
  };

  const handleRemoveUser = () => {
    if (userIdToRemove) {
      removeUserFromChat(chatId, userIdToRemove); // Call the function to remove user
      setUserIdToRemove(''); // Clear the input field
    }
  };


  const handleCall = async () => {
    setCallStarted(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on('signal', (signal) => {
      makeCall(participants[0]._id, signal, senderId);
    });

    peer.on('stream', (remoteStream) => {
      userVideo.current.srcObject = remoteStream;
    });

    peerRef.current = peer;
    myVideo.current.srcObject = stream;

  };

  const handleIncomingCall = (incomingSignal, callerId) => {
    const peer = new Peer({ initiator: false, trickle: false });

    peer.on('signal', (signal) => {
      // Return the signal to the caller, completing the handshake
      //  socket.emit('acceptCall', { signal, to: callerId });
      acceptCall(signal, callerId)

    });

    peer.on('stream', (remoteStream) => {
      // Set the remote stream in the video element
      userVideo.current.srcObject = remoteStream;
    });

    peer.signal(incomingSignal);

    peer.on('close', () => {
      onCallEnded();
    });

    peerRef.current = peer;
  };

  const onCallEnded = () => {
    peerRef.current.destroy(); // Destroy the peer connection
    myVideo.current.srcObject = null; // Reset local video
    userVideo.current.srcObject = null; // Reset remote video
    //socket.emit('endCall', { to: participants[0]._id }); // Notify the other user
    //endCall(); 
    onCallEnded(participants[0]._id)
  };



  const handleAcceptCall = async () => {
    setCallIncoming(false);
    setCallAccepted(true);

    audioRef.current.pause(); // Stop ringtone when call is accepted

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    myVideo.current.srcObject = stream;

    peerRef.current.addStream(stream); // Add your stream to the peer
    const callTime = new Date();

    setCallStartTime(callTime);
    onAcceptCall(
      chatId,    // The current chat's ID
      senderId,  // ID of the user accepting the call
      participants[0]._id, // ID of the user calling
      callStartTime,
    );
  };


  const callEnd = () => {
    // Close the peer connection
    if (peerRef.current) {
      peerRef.current.destroy();
    }

    // Notify the other participant that the call has ended
    //socket.emit('endCall', { recipientId: participants[0]._id, senderId });
    //endCall(participants[0]._id,senderId)
    onCallEnded(participants[0]._id)

    // Clean up UI (optional)
    myVideo.current.srcObject = null;
    userVideo.current.srcObject = null;
  };

  const handleStartCall = () => {
    handleCall();
    setCallStarted(true); // Show the video call section after starting the call
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  const handleCallLogClick = (userInfo) => {
    setSelectedCallLogs([userInfo]);
  };

  const handleEditClick = (callInfo) => {
    setSelectedCallLogs(callInfo);
    setNotes(callInfo.note || '');
    setBreakDown(callInfo.breakdown || false); // Set the initial notes value
    setOpenNote(true);
  };
  const handleNumberPlateChange = (event, value) => {
    setSelectedNumberPlate(value);
};

  const handleSaveNotes = () => {
    if (selectedCallLogs) {
      const noteId = uuidv4();

      // Emit the updated message to the backend via serviceSocket
      console.log("numberPlate", selectedNumberPlate.numberPlate)
      addNotes(chatId, senderId, notes, breakDown,selectedNumberPlate.numberPlate, noteId, (response) => {
        if (response.success) {
          console.log('Notes updated successfully');
          // Optionally update the UI to reflect the saved notes
        } else {
          console.error('Error updating notes:', response.error);
        }
      });

      handleClose(); // Close the dialog after saving
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'senderId', headerName: 'Sender ID', width: 150 },
    { field: 'note', headerName: 'Note', width: 250 },
    {
      field: 'breakdown', headerName: 'Breakdown', width: 120,
      renderCell: (params) => (params.value ? 'Yes' : 'No')
    },
    {
      field: 'numberPlate', headerName: 'NumberPlate', width: 120,
      renderCell: (params) => (params.value ? 'Yes' : 'No')
    },
    {
      field: 'timestamp', headerName: 'Timestamp', width: 200,
      valueGetter: (params) => new Date(params.value).toLocaleString()
    },
  ];

  // Convert messages array into rows for DataGrid
  const rows = breakDownLog.map((message) => ({
    id: message.noteId, // Use index as ID or use message ID if available
    senderId: message.senderId,
    note: message.note,
    breakdown: message.breakdown,
    timestamp: message.timestamp,
  }));


  console.log("NOTES we see")
  console.log(breakDownLog)

  console.log(messages)

  return (

    <>



      <div style={{ height: 400, width: '100%' }}>
        <Dialog open={open} onClose={handleClose} className="dialog">
          <DialogTitle className="dialogTitle">Messaging</DialogTitle>
          <DialogContent>
            <Tabs value={tabIndex} onChange={handleTabChange} aria-label="simple tabs example">
              <Tab label="Chat" data-testid="chatTab"/>
              <Tab label="Call Log" data-testid="callLogTab"/>
              <Tab label="Breakdown" data-testid="breakdownTab"/>
            </Tabs>
            {tabIndex === 0 && (
              <Box className="tabContent">
                <Box p={3}>
                  {callStarted && (
                    <>
                      <Grid container spacing={2} justifyContent="center" className="videoContainer">
                        <Grid item>
                          <Paper elevation={3} className="videoPaper">
                            <video ref={myVideo} autoPlay muted style={{ width: '300px' }} />
                            <Typography variant="caption" display="block" align="center">My Video</Typography>
                          </Paper>
                        </Grid>
                        <Grid item>
                          <Paper elevation={3} className="videoPaper">
                            <video ref={userVideo} autoPlay style={{ width: '300px' }} />
                            <Typography variant="caption" display="block" align="center">User Video</Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                      {callAccepted && (
                        <Box textAlign="center" className="endCallButton">
                          <Button variant="contained" color="secondary" onClick={handleCallEnd} data-testid="endCallBtn">
                            End Call
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                  {!callStarted && (
                    <Box textAlign="center" mt={3}>
                      <Button variant="contained" color="primary" onClick={handleStartCall} data-testid="startCall">
                        Start Call
                      </Button>
                    </Box>
                  )}
                  {callIncoming && (
                    <Box textAlign="center" mt={3}>
                      <Typography variant="h6">Incoming call...</Typography>
                      <Button variant="contained" color="success" onClick={handleAcceptCall} style={{ marginRight: '10px' }} data-testid="acceptCall">
                        Accept Call
                      </Button>
                      <Button variant="contained" color="error" onClick={handleCallEnd} data-testid="rejectCall">
                        Reject Call
                      </Button>
                    </Box>
                  )}
                </Box>
                <Box className="chatBox">
                  <Typography variant="h6" gutterBottom>
                    Chat with participants
                  </Typography>
                  <List className="messageList">
                    {messages.map((message, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={message.content} // Display the sender's name
                          secondary={message.senderName}  // Display the message content
                        />
                      </ListItem>
                    ))}
                  </List>
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Type your message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    sx={{ mb: 2 }}
                    data-testid="typeMessage"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSendMessage}
                    className="sendButton"
                    data-testid="sendBtn"
                  >
                    Send
                  </Button>
                </Box>
                <Box className="addUserBox">
                  <TextField
                    type="text"
                    placeholder="User ID to add"
                    id="newUserId"
                    variant="outlined"
                    sx={{ flexGrow: 1, marginRight: 1 }}
                  />
                  <Button variant="contained" color="secondary" onClick={() => handleAddUser(document.getElementById('newUserId').value)} data-testid="addUserBtn">
                    Add User
                  </Button>
                </Box>
              </Box>
            )}
            {tabIndex === 1 && (
              <Box className="tabContent">
                <Box className="chatBox">
                  <Typography variant="h6" gutterBottom>
                    Add notes
                  </Typography>
                  <List>
                    {callLogs.map(callLogInfo => (
                      <ListItem button key={callLogInfo._id} onClick={() => handleCallLogClick(callLogInfo)}>
                        <ListItemText primary={callLogInfo.senderId} />
                        <IconButton
                          edge="end"
                          color="secondary"
                          onClick={() => handleEditClick(callLogInfo)}
                        >
                          <EditIcon />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                  <Dialog open={openNote} onClose={handleClose} className="noteDialog">
                    <DialogTitle>Edit Notes</DialogTitle>
                    <DialogContent>
                      <div>
                        <h3>Notes:</h3>
                        {noteLog && noteLog.length > 0 ? (
                          noteLog.map((note) => (
                            <div key={note.id} style={{ border: '1px solid #ccc', margin: '5px', padding: '10px' }}>
                              <p><strong>Sender ID:</strong> {note.senderId}</p>
                              <p><strong>Note:</strong> {note.note}</p>
                              <p><strong>Breakdown:</strong> {note.breakdown ? 'Yes' : 'No'}</p>
                              <p><strong>Timestamp:</strong> {new Date(note.timestamp).toLocaleString()}</p>
                            </div>
                          ))
                        ) : (
                          <p>No notes available.</p>
                        )}
                      </div>
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
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="breakDown"
                            value={breakDown}
                            checked={breakDown}
                            onChange={(e) => setBreakDown(e.target.checked)}
                          />
                        }
                        label="breakdown"
                        data-testid="breakdownChecklist"
                      />
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={handleClose} color="primary" data-testid="cancelBtn"> 
                        Cancel
                      </Button>
                      <Button onClick={handleSaveNotes} color="primary" data-testid="saveNotes">
                        Save Notes
                      </Button>
                    </DialogActions>
                  </Dialog>
                </Box>
              </Box>
            )}
            {tabIndex === 2 && (
              <Box className="tabContent">
                <Box className="breakdownBox">
                  <Typography variant="h6" gutterBottom>
                    Breakdowns
                  </Typography>
                  <Box sx={{ height: 400, width: '100%' }}>
                    <DataGrid
                      rows={rows}
                      columns={columns}
                      pageSize={5}
                      rowsPerPageOptions={[5]}
                      checkboxSelection={false}
                    />
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );


};

export default ChatWindow;


