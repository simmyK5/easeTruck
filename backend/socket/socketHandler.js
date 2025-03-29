const Message = require('../model/message');
const Map = require('../model/map');
const User = require('../model/user');

function socketHandler(io) {
    io.on('connection', (socket) => {
        console.log('New user connected:', socket.id);
        const usersInChats = {};
        const userSocketMap = {}
        let usersInGroup = '';


        // Start a new conversation or join an existing one
        socket.on('startConversation', async ({ userIds }) => {
            const chatId = [...userIds].sort().join('-'); // Generate unique chatId based on users
            socket.join(chatId);
            socket.emit('conversationStarted', { chatId });
            usersInChats[chatId] = userIds;
            userSocketMap[userIds] = socket.id;


        });


        socket.on('getUsers', async (userId) => {
            try {

                // Fetch messages from MongoDB for the given chatId
                const users = await User.find({ _id: userId });
                // const callLogs = await Message.find({ chatId });

                users.map((userId) => {
                    console.log(userId)

                    socket.emit('users', userId);


                })

                // Emit the messages back callLogs the client

            } catch (error) {
                console.error('Error retrieving users:', error);
                socket.emit('error', { message: 'Error retrieving users' });
            }
        });


        // Listen for the client request to join a group
        socket.on('join-group', (groupId) => {
            socket.join(groupId); // Join the specified group
            console.log(`User ${socket.id} joined group ${groupId}`);

            // Optionally send a confirmation back to the client
            socket.emit('group-joined', groupId);
        });

        // Receive location updates from drivers
        socket.on('location-update', ({ groupId, driverId, location }) => {
            if (groupId == '') {
                groupId = usersInGroup
            }

            io.to(groupId).emit('location-update', { driverId, location });
            // io.emit('location-update', { driverId, location });
            console.log(`Broadcasting location for driver ${driverId} to group ${groupId}:`, location);

        });

        socket.on('sendMessage', async ({ chatId, senderId, content, participants }) => {
            try {
                
                console.log("chatId backend",chatId)

                // Check if the chat exists
                let message = await Message.findOne({ chatId });
console.log("messsage backend",message)
                if (message) {
                    // If chat exists, add the message to the message array
                    message.content.push({
                        senderId,
                        content: content,
                        timestamp: new Date(),
                    });
                } else {
                    // If chat doesn't exist, create a new chat
                    message = new Message({
                        chatId,
                        senderId,
                        notes: [],
                        content: { senderId, content },
                        usersInConversation: participants[0]._id// add all users in the conversation
                    });


                }

                await message.save();
                socket.to(chatId).emit('newMessage', message);
            } catch (error) {
                console.error("Error adding message:", error);
            }
        });

        socket.on('onAcceptCall', async ({ chatId, senderId, participants, startTime }) => {
            try {

                console.log("we trying to accept calls" + chatId)
                console.log("we trying" + senderId)
                console.log("we trying" + participants)
                console.log("what's happeining startTime")
                console.log(startTime)


                // Check if the chat exists
                let message = await Message.findOne({ chatId });
                console.log(message)

                if (message) {
                    // If chat exists, add the message to the message array
                    message.callLog.push({
                        senderId,
                        callType: 'video',  // or 'audio'
                        startTime,
                        isCall: true,
                        callEnd: '',
                        callDuration: '',
                        notes: [],


                    });
                } else {
                    // If chat doesn't exist, create a new chat
                    message = new Message({
                        chatId,
                        callLog: {
                            senderId,
                            callType: 'video',  // or 'audio'
                            startTime,
                            isCall: true,
                            callEnd: '',
                            callDuration: '',
                            notes: [],

                        },

                        usersInConversation: participants// add all users in the conversation
                    });

                    // socket.to(receiverId).emit('receiveMessage', chatMessage);
                }
                console.log("we here my brother")
                console.log(message)
                await message.save();
                socket.to(chatId).emit('newMessage', message);
            } catch (error) {
                console.error("Error adding message:", error);
            }
        });

        socket.on('onEndCall', async ({ chatId, endTime, callDuration }) => {
            try {

                const message = await Message.findOne({ callLog: { $exists: true, $ne: [] } }).sort({ createdAt: -1 });
                if (message) {

                    message.callLog.forEach(log => {
                        if (log) {
                            log.callEnd = endTime;
                            log.callDuration = callDuration; // Update `isCall` to false or any other condition you want
                        }
                    });

                    await message.save();

                    console.log('Call log updated with end time and duration');
                } else {
                    console.log('No call log found to update');
                }

                await message.save();
                socket.to(chatId).emit('newMessage', message);
            } catch (error) {
                console.error("Error adding message:", error);
            }
        });


        socket.on('getCallLog', async (chatId) => {
            try {
                // Fetch messages from MongoDB for the given chatId
                const callLogs = await Message.find({ chatId, callLog: { $exists: true, $ne: [] } });
                // const callLogs = await Message.find({ chatId });

                callLogs.map((logsInfo) => {
                    socket.emit('callLogs', logsInfo.callLog);
                })

                // Emit the messages back callLogs the client

            } catch (error) {
                console.error('Error retrieving messages:', error);
                socket.emit('error', { message: 'Error retrieving messages' });
            }
        });

        socket.on('sendNotes', async ({ chatId, senderId, note, breakdown,numberPlate, noteId }) => {
            try {
                // Check if the chat exists
                let newNote = await Message.findOne({ chatId });
                if (newNote) {

                    newNote.callLog.forEach(log => {
                        if (log) {
                            if (!Array.isArray(log.notes)) {
                                log.notes = [];
                            }

                            //log.breakdown= breakdown,
                            log.notes.push({
                                noteId: noteId,
                                senderId: senderId,
                                note: note,
                                numberPlate: numberPlate,
                                breakdown: breakdown,
                                timestamp: new Date()
                            })

                        }
                    });

                    //await newNote.save();
                } else {
                    console.log('No note added');
                }

                await newNote.save();
                socket.to(chatId).emit('sendNotes', newNote)

            } catch (error) {
                console.error("Error adding note:", error);
            }
        });

        socket.on('getNotes', async (chatId) => {
            try {
                // Fetch messages from MongoDB for the given chatId
                const noteLogs = await Message.find({ chatId, callLog: { $exists: true, $ne: [] } });
                // const callLogs = await Message.find({ chatId });

                noteLogs.map((logsInfo) => {
                    const notes = logsInfo.callLog
                    notes.map((note) => {
                        socket.emit('notes', note.notes);

                    })

                })

                // Emit the messages back callLogs the client

            } catch (error) {
                console.error('Error retrieving messages:', error);
                socket.emit('error', { message: 'Error retrieving messages' });
            }
        });

        socket.on('getBreakDown', async (chatId) => {
            try {
                // Fetch messages from MongoDB for the given chatId
                const message = await Message.find({ chatId, callLog: { $exists: true, $ne: [] } });

                // const callLogs = await Message.find({ chatId });

                message.map((breakDownLog) => {
                    const breakDownList = breakDownLog.callLog
                    breakDownList.map((note) => {
                        const breakDowns = note.notes
                        const filteredMessages = breakDowns.filter(msg => msg.breakdown = true);

                        socket.emit('breakdown', filteredMessages);
                    })

                })

                // Emit the messages back callLogs the client

            } catch (error) {
                console.error('Error retrieving messages:', error);
                socket.emit('error', { message: 'Error retrieving messages' });
            }
        });


        socket.on('makeCall', ({ participants, signal, senderId }) => {
            // const includesId = Object.keys(userSocketMap).some(key => key.includes(participants));
            let result = null;
            for (const key in userSocketMap) {
                if (key.includes(participants)) {
                    result = userSocketMap[key]; // Get the corresponding value
                    break; // Exit the loop since we found a match
                }
            }

            if (result) {
                io.to(result).emit('receiveCall', { signal: signal.signal, from: signal.senderId });
            }
        });




        socket.on('acceptCall', async (signal) => {
            socket.to(signal.participants).emit('callAccepted', { signal: signal.signal });
            console.log(`${signal.participants} accepted the call from ${signal.senderId}`);
        });

        socket.on('endCall', (signal) => {
            // io.to(callerId).emit('callAccepted', { receiverId });
            // socket.to(signal.participants).emit('callEnded', { from:signal.senderId });
            socket.to(signal.participants).emit('endCall', { to: signal.participants, from: signal.senderId });
            console.log(`Call between ${signal.senderId} and ${signal.participants} ended`);
        });


        // Handle retrieving all messages for a chat
        /*socket.on('getMessages', async (chatId, callback) => {
            try {
                console.log("chatId backend",chatId)
               // const messages = await Message.find({ chatId, isCall: false || null }).sort({ createdAt: 1 });
               const messages = await Message.find({ 
                chatId, 
                $or: [{ isCall: false }, { isCall: null }] 
              }).sort({ createdAt: 1 });
                console.log("message backend",messages)
                callback(messages.content); // Send the messages back to the client
            } catch (err) {
                console.error('Error retrieving messages:', err);
            }
        });*/

       /* socket.on('getMessages', async (chatId, callback) => {
            try {
                console.log("chatId backend", chatId);
        
                // Fetch messages from the database
                const messages = await Message.find({
                    chatId,
                    $or: [{ isCall: false }, { isCall: null }]
                }).sort({ createdAt: 1 });
        
                console.log("messages backend", messages);
        
                // Extract the content from each message
                const messageContents = messages.map(message => message.content).flat(); // Flatten content if it's an array
        
                // Send the extracted content back to the client
                callback(messageContents);
            } catch (err) {
                console.error('Error retrieving messages:', err);
            }
        });*/

        socket.on('getMessages', async (chatId, callback) => {
            try {
                console.log("chatId backend", chatId);
        
                // Fetch messages from the database
                const messages = await Message.find({
                    chatId,
                    $or: [{ isCall: false }, { isCall: null }]
                }).sort({ createdAt: 1 });
        
                console.log("messages backend", messages);
        
                // Create an array to store modified messages with sender names
                const messageContents = await Promise.all(messages.map(async (message) => {
                    // If content is an array, process it
                    const contentItems = await Promise.all(message.content.map(async (contentItem) => {
                        // Fetch user details based on senderId
                        const user = await User.findById(contentItem.senderId); // Fetching the user based on senderId
        
                        // Return the content item with the sender's name
                        return {
                            content: contentItem.content, // the actual content
                            senderName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
                            timestamp: contentItem.timestamp || message.timestamp // If timestamp exists in contentItem, use it; else, use message timestamp
                        };
                    }));
        
                    return contentItems;
                }));
        
                // Send the message contents with sender's name back to the client
                callback(messageContents);
            } catch (err) {
                console.error('Error retrieving messages:', err);
            }
        });
        
        
        
        
        
        

        // Event to add a new user to the conversation
        socket.on('addUserToChat', async ({ chatId, newUser }) => {
            console.log("check me in")
            console.log(chatId)
            console.log(newUser)

            const message = await Message.findOne({ chatId });


            if (message) {
                "we here"
                // Check if the user is already in the conversation
                if (!message.usersInConversation.includes(newUser)) {
                    message.usersInConversation.push(newUser);
                    await message.save();
                    // Notify the clients in the chat room about the updated users
                    socket.to(chatId).emit('userAdded', { newUser, usersInConversation: message.usersInConversation });
                }
            }


        });


        socket.on('removeUserFromConversation', async ({ chatId, userId }) => {
            // Find the existing message/document that corresponds to the chatId
            const message = await Message.findOne({ chatId });

            if (message) {
                // Check if the user is in the conversation
                if (message.usersInConversation.includes(userId)) {
                    // Remove the user from the array
                    message.usersInConversation = message.usersInConversation.filter(id => id !== userId);
                    await message.save();
                    // Notify the clients in the chat room about the updated users
                    socket.to(chatId).emit('userRemoved', { userId, usersInConversation: message.usersInConversation });
                }
            }
        });




        socket.on('answerCall', (data) => {
            io.to(data.participants).emit('callAnswered', {
                signal: data.signal
            });
        });

        // Additional events like adding/removing users from the call
        socket.on('addUserToCall', (data) => {
            io.to(data.chatId).emit('userAdded', data.userId);
        });

        socket.on('endCall', async ({ chatId, participants, duration }) => {
            try {
                const newCall = new Call({
                    chatId,
                    participants,  // An array of users involved in the call
                    duration       // The length of the call in seconds
                });

                // Save the call to the database
                await newCall.save();

                console.log('Call saved successfully:', newCall);
            } catch (err) {
                console.error('Error saving call:', err);
            }
        });

        // Handle removing a user from the conversation
        socket.on('removeUser', ({ chatId, userId }) => {
            socket.leave(chatId);
            io.to(chatId).emit('userRemoved', { chatId, userId });
        });

        /*socket.on('getSubscriptionStatus', async (email) => {
            console.log("even connected")
            
            try {
                const user = await User.findOne({ email }).populate('subscription').exec();
                if (!user) {
                    socket.emit('subscriptionStatus', false);
                    return;
                }
                console.log("see socketUser")
                console.log(user)

                const activeSubscription = user.subscription.some(subscription => subscription && subscription.status === 'ACTIVE');
                socket.emit('subscriptionStatus', activeSubscription);
            } catch (error) {
                console.error('Error checking subscription status:', error);
                socket.emit('subscriptionStatus', false);
            }
        });

        socket.on('getUserNav', async (email) => {
            try {
                const user = await User.findOne({ email: req.params.email });

                if (!user) {
                    return res.status(404).send('User not found');
                }
                socket.emit('userNav', user);
            } catch (error) {
                console.error('Error checking subscription status:', error);
                socket.emit('subscriptionStatus', false);
            }
        });*/

        /*socket.on('checkSubscription', async (email) => {
            try {
              const user = await User.findOne({ email }).populate('subscription').exec();
              if (!user) {
                socket.emit('subscriptionStatus', false);
                return;
              }
        
              const activeSubscription = user.subscription.some(subscription => subscription && subscription.status === 'ACTIVE');
              socket.emit('subscriptionStatus', activeSubscription);
            } catch (error) {
              console.error('Error checking subscription status:', error);
              socket.emit('subscriptionStatus', false);
            }
          });*/


        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
}

module.exports = socketHandler;
