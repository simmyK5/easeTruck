const express = require('express');
const Message = require('../model/message');
const User = require('../model/user');
const cors = require('cors');
const bcrypt = require("bcryptjs")
const router = express();
const bodyParser = require('body-parser');
const { contentSecurityPolicy } = require('helmet');
router.use(cors());
router.use(bodyParser.json());


// Fetch old messages of a conversation between two users
router.get('/:userId/:otherUserId', async (req, res) => {
    console.log(req.params)
    const { userId, otherUserId } = req.params;
    console.log("Sender"+userId)
    console.log("reciever"+otherUserId)
    try {
        const messages = await Message.find({
            $or: [
                { senderId: userId, usersInConversation: otherUserId },
                { senderId: otherUserId, usersInConversation: userId }
            ]
        }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).send('Error fetching messages');
    }
});

// Save a new message
router.post('/:userId/:otherUserId', async (req, res) => {
    console.log(req.body)
    console.log("yiyo",req.params)
    const { userId, otherUserId } = req.params;
    const { content,callLog } = req.body;
    try {
        const newMessage = new Message({ senderId:userId, usersInConversation:otherUserId, content,callLog  });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).send('Error saving message');
    }
});

router.get("/breakDown", async (req, res) => {
    const { userId } = req.query;
    console.log("siyagena", userId);

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        const messages = await Message.find({
            chatId: { $regex: user.vehicleOwnerId } // Check if vehicleOwnerId is part of chatId
        });
        if (!messages || messages.length === 0) {
            return res.status(404).send('No messages found');
        }
        console.log("messages social", messages);

        // Collect all breakdown notes with number plate and timestamp
        const breakdownNotes = [];

        messages.forEach(message => {
            console.log("messages social one", message);
            message.callLog.forEach(callLog => {
                console.log("messages social callog", callLog);
                callLog.notes.forEach(note => {
                    console.log("messages social note", note);
                    if (note.breakdown === true && note.numberPlate) {
                        breakdownNotes.push({
                            noteId:note.noteId,
                            senderId:note.senderId,
                            note:note.note,
                            breakdown:note.breakdown,
                            numberPlate: note.numberPlate,
                            timestamp: new Date(note.timestamp)
                        });
                    }
                });
            });
        });

        console.log("all breakdowns", breakdownNotes);

        // Respond with the recent breakdowns
        return res.status(200).json(breakdownNotes);
    } catch (err) {
        console.error('Error fetching breakdown data:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
