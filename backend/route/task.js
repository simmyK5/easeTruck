const express = require('express');
const User = require('../model/user');
const Task = require('../model/task');
const Notification = require('../model/notification');
const path = require('path');

require('dotenv').config();
//const multer = require("multer")

const router = express.Router(); // Just router, no use(cors()), etc here


router.use('/uploadFile', express.static(path.join(__dirname, 'uploads')));


//create task

// Endpoint to create a new task and corresponding notification
router.post("/", async (req, res) => {
    console.log("Received request body:", req.body);

    const { vehicleOwnerId, driverId, numberPlate, startPoint, endPoint, status,loadCapacity } = req.body;
    const newTask = new Task({
        vehicleOwnerId, driverId, numberPlate, startPoint, endPoint, status, onload: '', offload: '',loadCapacity
    });

    try {
        const vehicleOwner = await User.findById(vehicleOwnerId);
        const driver = await User.findById(driverId);

        // Check if both users are found
        if (!vehicleOwner || !driver) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("Vehicle Owner:", vehicleOwner);
        console.log("Driver:", driver);

        // Save the new task
        const savedTask = await newTask.save();

        // Push the saved task's ID to both users' task arrays
        vehicleOwner.task.push(savedTask._id);
        driver.task.push(savedTask._id);

        // Save the updated users with the new task
        await vehicleOwner.save();
        await driver.save();

        // Create a notification for the driver
        const title = `New task created `;
        const message = `New task created and assigned to you by ${vehicleOwner.firstName} ${vehicleOwner.lastName} \nStart Point: ${startPoint}\nEnd Point: ${endPoint}`;

        const notification = new Notification({
            driverId,
            title, 
            message,
            vehicleOwnerId,
            task:savedTask._id
        });

        const savedNotification = await notification.save();

        // Push the saved notification's ID to both users' notification arrays
        vehicleOwner.notification.push(savedNotification._id);
        driver.notification.push(savedNotification._id);

        await vehicleOwner.save();
        await driver.save();

        console.log("Notification created for the driver:", savedNotification);

        // Respond with the saved task
        res.status(200).json(savedTask);
    } catch (error) {
        console.error('Error saving task and creating notification:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put("/:id", async (req, res) => {
    console.log("kanti tini");
    try {
        console.log("Updating task for:", req.params.id);
        console.log("Received task body:", req.body);
        console.log("Received task files:", req.files);

        // Destructure body with default values
        const {
            vehicleOwnerId = null,
            driverId = null,
            numberPlate = null,
            startPoint = null,
            endPoint = null,
            status = null,
            onload = null,
            offload = null,
            loadCapacity = null,
        } = req.body || {};

        let updateData = { ...req.body };

        // Fetch existing task to retain previous file URLs
        const existingTask = await Task.findById(req.params.id);
        let fileUrls = existingTask?.fileUrls || []; // Retain old files if they exist

        // Handle file upload
        if (req.files) {
            const uploadedFiles = Object.entries(req.files);
            const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "");

            for (const [fieldName, file] of uploadedFiles) {
                const sanitizedFileName = file.name.replace(/\s+/g, "_");
                const fileName = `${timestamp}_${fieldName}_${sanitizedFileName}`;
                const uploadPath = path.join(__dirname, "uploads", fileName);

                try {
                    // Move the file to the uploads directory
                    await file.mv(uploadPath);

                    // Check if this file type already exists in fileUrls
                    const existingFileIndex = fileUrls.findIndex(f => f.name === fieldName);

                    if (existingFileIndex !== -1) {
                        // Update existing file entry
                        fileUrls[existingFileIndex] = {
                            name: fieldName, // Field name (onload, offload, etc.)
                            url: `/uploads/${fileName}`,
                        };
                    } else {
                        // Add new file entry
                        fileUrls.push({
                            name: fieldName,
                            url: `/uploads/${fileName}`,
                        });
                    }
                } catch (error) {
                    console.error(`File upload failed for ${file.name}:`, error);
                    return res.status(500).json({ error: `File upload failed for ${file.name}` });
                }
            }
        }

        // Prepare update data, ensuring previous values are retained
        updateData = {
            ...(vehicleOwnerId && { vehicleOwnerId }),
            ...(driverId && { driverId }),
            ...(numberPlate && { numberPlate }),
            ...(startPoint && { startPoint }),
            ...(endPoint && { endPoint }),
            ...(status && { status }),
            ...(loadCapacity && { loadCapacity }),
            ...(onload !== "null" && onload !== undefined && { onload }),
            ...(offload !== "null" && offload !== undefined && { offload }),
            ...(fileUrls.length > 0 && { fileUrls }), // Only update if files exist
        };

        // Update the database record
        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id },
            updateData,
            { new: true }
        );

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("Error:", error);
        res.status(400).send(error);
    }
});


//delete task
router.delete("/:id", async (req, res) => {
    try {
        const truck = await Task.findById(req.params.id)
        if (truck._id) {
            await truck.deleteOne()
            res.status(200).json("Truck deleted")
        } else {
            res.status(403).json("Don't have permissions to delete this truck")
        }

    } catch (error) {

        res.status(500).json(error)
    }
})




// get all task by driver id
router.get("/driver/:driverId", async (req, res) => {

    try {

        console.log("dlala stokie",req.params.driverId)

        const tasks = await Task.find({ driverId: req.params.driverId });
        res.status(200).json(tasks)
    } catch (error) {
        res.status(500).json(error)
    }

})

// get all task by vehicleOnwerId
router.get("/vehicleOnwerTask/:vehicleOnwerId", async (req, res) => {

    try {
        // const currentUser = await User.findOne({ vehicleOnwerId: req.params.vehicleOnwerId });
        console.log(req.params.vehicleOnwerId)
        const tasks = await Task.find({ vehicleOwnerId: req.params.vehicleOnwerId });
        console.log("task are here")
        console.log(tasks)
        res.status(200).json(tasks)
    } catch (error) {
        res.status(500).json(error)
    }

})

// get all no started task
router.get("/task/:status", async (req, res) => {

    try {
        const tasks = await Task.find({ status: "Not Started" });
        res.status(200).json(tasks)
    } catch (error) {
        res.status(500).json(error)
    }

})

// get all tasks
router.get("/tasks", async (req, res) => {

    try {
        const tasks = await Task.find();
        res.status(200).json(tasks)
    } catch (error) {
        res.status(500).json(error)
    }

})

module.exports = router;