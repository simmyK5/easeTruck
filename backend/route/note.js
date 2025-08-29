const express = require('express');
const Note = require('../model/note');
const User = require('../model/user');
const cors = require('cors');
const bcrypt = require("bcryptjs")
const router = express();
const bodyParser = require('body-parser');
const { contentSecurityPolicy } = require('helmet');
router.use(cors());
router.use(bodyParser.json());


// Fetch old messages of a conversation between two users
router.get('/:userId', async (req, res) => {
    console.log("birtch miss me",req.params)
    const { userId } = req.params;
    console.log("Sender ID:", userId);

    try {
        // Find all notes where chatId contains the userId
        const notes = await Note.find({ chatId: { $regex: userId } });
        res.json(notes);
    } catch (err) {
        console.error('Error fetching notes:', err);
        res.status(500).send('Error fetching notes');
    }
});

// Save a new message
router.post('/:userId', async (req, res) => {
    console.log(req.body)
    console.log("yiyo", req.params)
    const  userId = req.params;
    const { content, callLog } = req.body;
    try {
        const newNote = new Note({ senderId: userId, usersInConversation: otherUserId, content, callLog });
        await newNote.save();
        res.status(201).json(newNote);
    } catch (err) {
        res.status(500).send('Error saving message');
    }
});


module.exports = router;
