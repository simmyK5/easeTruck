const Message = require('../model/message');
const Map = require('../model/map');
const User = require('../model/user');
const Note = require('../model/note');
const Puncher = require('../model/puncher');
const Weapon = require('../model/weapon');
const GlassBreak = require('../model/glassBreak');
const People = require('../model/people');
const HistoryLocation = require('../model/historyLocation');


function socketHandler(io) {
    io.on('connection', (socket) => {
        console.log('New user connected:', socket.id);
        const usersInChats = {};
        const userSocketMap = {}
        let usersInGroup = '';


        // Start a new conversation or join an existing one
        socket.on('startConversation', async ({ userIds }) => {
            const chatId = [...userIds].sort().join('-'); // Generate unique chatId based on users
            console.log("before emit ", chatId)
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
                console.log("ama memes")
                console.log("chatId backend", chatId)
                console.log("senderId backend", senderId)
                console.log("content backend", content)
                console.log("participants backend", participants)

                // Check if the chat exists
                let message = await Message.findOne({ chatId });
                console.log("messsage backend", message)
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
                        content: { senderId, content },
                        usersInConversation: participants[0]._id// add all users in the conversation
                    });


                }

                await message.save();
                socket.to(chatId).emit('messageReceived', message);
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

        socket.on('sendNotes', async ({ chatId, senderId, note, breakdown, numberPlate, noteId }) => {
            try {
                console.log("progress chatid", chatId)
                console.log("progress senderid", senderId)
                console.log("progress note", note)
                console.log("progress breakdown", breakdown)
                console.log("progress numberplate", numberPlate)
                console.log("progress noteid", noteId)
                const newNote = new Note({
                    chatId,
                    senderId,
                    note,
                    breakdown,
                    numberPlate,
                    noteId
                });

                // Save the call to the database
                await newNote.save();

                console.log('Note saved successfully:', newNote);
            } catch (err) {
                console.error('Error saving call:', err);
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

        socket.on('getPuncher', async ({ role, vehicleOwnerId }, callback) => {
            try {
                let punchers;
                console.log("kilungile", role)
                console.log("vehicleOwnerId", vehicleOwnerId)

                if (role === 'admin' || role === 'superAdmin') {
                    punchers = await Puncher.find({}).populate('driverId', 'firstName lastName');
                } else if (role === 'vehicleOwner') {
                    punchers = await Puncher.find({ vehicleOwnerId }).populate('driverId', 'firstName lastName');
                } else {
                    return callback({ error: 'Access denied' });
                }

                callback(punchers);
            } catch (err) {
                callback({ error: 'Server error', details: err.message });
            }
        });


        socket.on('getGlassBreak', async ({ role, vehicleOwnerId }, callback) => {
            try {
                let glassBreaks;

                if (role === 'admin' || role === 'superAdmin') {
                    // Admin sees everything
                    glassBreaks = await GlassBreak.find({}).populate('driverId', 'firstName lastName');
                } else if (role === 'vehicleOwner') {
                    // Vehicle owner sees punchers for their drivers
                    glassBreaks = await GlassBreak.find({ vehicleOwnerId }).populate('driverId', 'firstName lastName');
                } else {
                    return res.status(403).json({ error: 'Access denied' });
                }
                callback(glassBreaks);
            } catch (err) {
                callback({ error: 'Server error', details: err.message });
            }
        });

        socket.on('getWeapon', async ({ role, vehicleOwnerId }, callback) => {
            try {
                let weapons;

                if (role === 'admin' || role === 'superAdmin') {
                    // Admin sees everything
                    weapons = await Weapon.find({}).populate('driverId', 'firstName lastName');
                } else if (role === 'vehicleOwner') {
                    // Vehicle owner sees punchers for their drivers
                    weapons = await Weapon.find({ vehicleOwnerId }).populate('driverId', 'firstName lastName');
                } else {
                    return res.status(403).json({ error: 'Access denied' });
                }
                callback(weapons);
            } catch (err) {
                callback({ error: 'Server error', details: err.message });
            }
        });

        socket.on('getPeople', async ({ role, vehicleOwnerId }, callback) => {

            try {
                let people;

                if (role === 'admin' || role === 'superAdmin') {
                    // Admin sees everything
                    people = await People.find({}).populate('driverId', 'firstName lastName');
                } else if (role === 'vehicleOwner') {
                    // Vehicle owner sees punchers for their drivers
                    people = await People.find({ vehicleOwnerId }).populate('driverId', 'firstName lastName');
                } else {
                    return res.status(403).json({ error: 'Access denied' });
                }
                callback(people);
            } catch (err) {
                callback({ error: 'Server error', details: err.message });
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


        // Map to store latest 5 coordinates per device
        socket.on('locationUpdate', async (data) => {
            const { truckLocation } = data;
            const { latitude, longitude, serialNumber } = truckLocation;

            console.log("[LOCATION] Received from device:", truckLocation);

            try {
                await HistoryLocation.findOneAndUpdate(
                    { serialNumber },
                    {
                        $push: {
                            coordinates: {
                                $each: [{ latitude, longitude, timestamp: new Date() }],
                                $slice: -5 // keep only last 5
                            }
                        }
                    },
                    { upsert: true, new: true }
                );
            } catch (error) {
                console.error("Failed to save latest coordinates:", error);
            }

            // Broadcast to frontend/admins
            io.emit('adminLocationUpdate', truckLocation);
        });

        /*socket.on('highSpeed', async (data) => {
            const { truckLocation } = data;
            console.log("[LOCATION] Received from device:", truckLocation);
            // Broadcast to frontend/admins
            io.emit('adminHighSpeed', truckLocation);

            try {
                // Save to MongoDB
                const highSpeedRecord = new HighSpeedEvent({
                    serialNumber: truckLocation.serialNumber,
                    lat: truckLocation.lat,
                    lng: truckLocation.lng,
                    speed: truckLocation.speed,
                    road: truckLocation.road || 'Unknown',
                    speedLimit: truckLocation.speedLimit || 0,
                });

                await highSpeedRecord.save();
                console.log("[DB] High-speed event saved.");
            } catch (err) {
                console.error("[DB ERROR] Could not save high-speed event:", err);
            }
        });*/


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




        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
}

module.exports = socketHandler;
