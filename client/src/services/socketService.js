import { useId } from 'react';
import { io } from 'socket.io-client';

//const socket = io(`${import.meta.env.VITE_API_BASE_URL}`);
//wss://easetruckbackend-emfbc9dje7hdargb.southafricanorth-01.azurewebsites.net

const socket = io("https://easetruckbackend-emfbc9dje7hdargb.southafricanorth-01.azurewebsites.net", {
  withCredentials: true,
  transports: ["websocket", "polling"]
});


export const connectSocket = () => {
  socket.on('connect', () => {
    console.log('Connected to socket server:', socket.id);
  });
};

export const joinRoom = (userId, recipientId) => {
  socket.emit('joinRoom', { userId, recipientId });
};

export const startConversation = (userIds, handleChatId) => {
  socket.emit('startConversation', { userIds });

  // Listening for the conversationStarted event from the backend
  socket.on('conversationStarted', (data) => {
    const { chatId } = data;

    // Call the callback to pass chatId to the component
    if (handleChatId && typeof handleChatId === 'function') {
      handleChatId(chatId);
    }
  });
};

export const joinGroup = (groupId) => {
  socket.emit('join-group', groupId);
};

// Listen for confirmation of joining the group
socket.on('group-joined', (joinedGroupId) => {
  console.log(`Successfully joined group: ${joinedGroupId}`);
});

// Optional: Listen for confirmation of joining
socket.on('group-joined', (joinedGroupId) => {
  console.log(`Joined group ${joinedGroupId}`);
});


export const emitLocationUpdate = (groupId, driverId, location) => {
  socket.emit('location-update', { groupId, driverId, location });

};

export const listenForLocationUpdates = (callback) => {
  if (!callback || typeof callback !== 'function') {
    throw new Error("A valid callback function must be provided.");
  } else {
    socket.on('location-update', (data) => {
      console.log("Received location update:", data);
      callback(data); // This ensures the callback is always called with data
    });
  }
  socket.on('error', (error) => {
    console.error('Error fetching messages:', error);
  });
};




export const sendMessage = (chatId, senderId, content, participants) => {
  socket.emit('sendMessage', { chatId, senderId, content, participants });
};

export const addNotes = (chatId, senderId, note, breakdown,numberPlate, noteId) => {
  socket.emit('sendNotes', { chatId, senderId, note, breakdown,numberPlate, noteId });
};

export const onAcceptCall = (chatId, senderId, participants, startTime) => {
  console.log(chatId)
  console.log(senderId)
  console.log(participants)

  console.log(startTime)
  socket.emit('onAcceptCall', { chatId, senderId, participants, startTime });
};

export const onEndCall = (chatId, endTime, callDuration, isCall) => {
  socket.emit('onEndCall', { chatId, endTime, callDuration, isCall });
};


// Handle receiving the updated message array when new messages are added
socket.on('messageAdded', (messages) => {
  console.log('Messages updated:', messages);
  // Handle updating the frontend here
});



export const getMessages = (chatId, callback) => {
  socket.emit('getMessages', chatId, callback);
};

// Listen for new messages from the backend
socket.on('newMessage', (message) => {
  // Handle receiving a new message, update the UI accordingly
  console.log('New message received:', message);
});

// Add user to the current chat
export const addUserToChat = (chatId, newUser) => {
  socket.emit('addUserToChat', { chatId, newUser });
};

// Listening for the user added event
export const onUserAdded = (callback) => {
  socket.on('userAdded', callback);
};



export const subscribeToMessages = (callback) => {
  socket.on('newMessage', (message) => callback(message));
};

// Assuming you have a function to remove a user
export const removeUserFromChat = (chatId, userId) => {
  socket.emit('removeUserFromConversation', { chatId, userId });
};

// Listen for the userRemoved event to update the UI accordingly
socket.on('userRemoved', ({ userId, usersInConversation }) => {
  // Update your state or perform necessary actions to reflect the removed user
  console.log(`User removed: ${userId}`);
  console.log(`Current users in conversation: ${usersInConversation}`);
});

socket.on('addUserToCall', async ({ callId, newUserId }) => {
  socket.join(callId);  // Add the new user to the existing call room
  io.to(callId).emit('userAdded', { newUserId });
});

function fetchCallHistory(userId) {
  socket.emit('fetchCallHistory', { userId });
  socket.on('callHistory', (history) => {
    // Update the chat window with call history
  });
}

export const makeCall = (participants, signal, senderId) => {
  socket.emit('makeCall', { participants, signal, senderId });
};


export const onReceiveCall = (callback) => {
  try {
    socket.on('receiveCall', (data) => {
      callback(data); // Execute the callback passed from the WindowChat component
    });
  } catch (error) {
    console.error('Error receiving call:', error);
  }
}


export const acceptCall = (senderId, participants) => {
  socket.emit('acceptCall', { senderId, participants });
};

export const onCallAccepted = (data, callback) => {


  socket.on('callAccepted', (data) => {
    const { chatId } = data;

    // Call the callback to pass chatId to the component
    if (callback && typeof callback === 'function') {
      callback(chatId);
    }
  });

  /*socket.on('callAccepted', (data) => {
    callback(data);
  });*/
};

export const onCallEnded = (callback) => {

  socket.on('callEnded', (data) => {
    console.log("we cookng ending calls")
    console.log(data)
    const { chatId } = data;

    // Call the callback to pass chatId to the component
    if (callback && typeof callback === 'function') {
      callback(chatId);
    }
  });

  /*socket.on('callEnded', (data) => {
      callback(data);
  });*/
};


export const endCall = (recipientId, senderId) => {
  console.log(recipientId)
  console.log(senderId)
  socket.emit('endCall', { recipientId, senderId });
}



export const getCallLog = (chatId, callback) => {
  // Emit socket to request messages for the given chatId
  socket.emit('getCallLog', chatId);

  // Listen for the response containing the messages
  socket.on('callLogs', (data) => {
    if (callback) callback(data); // Pass the retrieved messages to a callback
  });

  // Optionally, handle any errors from the server
  socket.on('error', (error) => {
    console.error('Error fetching messages:', error);
  });
};


export const getNotes = (chatId, callback) => {
  // Emit socket to request messages for the given chatId
  socket.emit('getNotes', chatId);

  // Listen for the response containing the messages
  socket.on('notes', (data) => {
    if (callback) callback(data); // Pass the retrieved messages to a callback
  });

  // Optionally, handle any errors from the server
  socket.on('error', (error) => {
    console.error('Error fetching messages:', error);
  });
};

export const getUser = (userId, callback) => {

  // Emit socket to request users for the given userId
  socket.emit('getUsers', userId);

  // Listen for the response containing the users
  socket.on('users', (data) => {
    if (callback) callback(data); // Pass the retrieved messages to a callback
  });

  // Optionally, handle any errors from the server
  socket.on('error', (error) => {
    console.error('Error fetching users:', error);
  });
};

export const getBreakDown = (chatId, callback) => {
  // Emit socket to request messages for the given chatId
  socket.emit('getBreakDown', chatId);

  // Listen for the response containing the messages
  socket.on('breakdown', (data) => {
    if (callback) callback(data); // Pass the retrieved messages to a callback
  });

  // Optionally, handle any errors from the server
  socket.on('error', (error) => {
    console.error('Error fetching messages:', error);
  });
};

/*export const checkSubscription = (email, callback) => {
  // Emit socket to request messages for the given chatId
  socket.emit('getSubscriptionStatus', email);

  // Listen for the response containing the messages
  socket.on('subscriptionStatus', (data) => {
    console.log("see data")
    console.log(data)
    if (callback) callback(data); // Pass the retrieved messages to a callback
  });

  // Optionally, handle any errors from the server
  socket.on('error', (error) => {
    console.error('Error fetching messages:', error);
  });
};

/// For layoutout nav
export const userNav = (email, callback) => {
  // Emit socket to request messages for the given chatId
  socket.emit('getUserNav', email);

  // Listen for the response containing the messages
  socket.on('userNav', (data) => {
    console.log("see data")
    console.log(data)
    if (callback) callback(data); // Pass the retrieved messages to a callback
  });

  // Optionally, handle any errors from the server
  socket.on('error', (error) => {
    console.error('Error fetching messages:', error);
  });
};*/

/*export const checkSubscription = (email) => {
  return new Promise((resolve, reject) => {
    socket.emit('checkSubscription', email);
    socket.on('subscriptionStatus', (isSubscribed) => {
      resolve(isSubscribed);
    });
  });
}*/

export default socket;
