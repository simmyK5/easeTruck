const express = require('express');
const cors = require('cors');
const bcrypt = require("bcryptjs")
const router = express();
const bodyParser = require('body-parser');
router.use(cors());
router.use(bodyParser.json());
const Acceleration = require('../model/acceleration');
const Fuel = require('../model/fuel');
const IdleTime = require('../model/idleTime');
const Service = require('../model/service');
const TireService = require('../model/tireService');
const User = require('../model/user');
const Steering = require('../model/steering');
const Brake = require('../model/brake');
const Voucher = require('../model/voucher');
const Truck = require('../model/truck');
const brake = require('../model/brake');
const Task = require('../model/task');
const { DateTime } = require('luxon');
const Installation = require('../model/installation');
const Message = require('../model/message');


router.get('/recentTask', async (req, res) => {
    const { userId } = req.query;

    try {
        // Find the user and populate tasks data
        const user = await User.findOne({
            $or: [
                { _id: userId },
                { vehicleOwnerId: userId }
            ]
        }).populate({
            path: 'task',
            options: { sort: { createdAt: -1 }, limit: 5 } // Sort by creation date and limit to 5
        }).exec();

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Extract the populated tasks
        const tasks = user.task;

        // Respond with the last five tasks
        res.status(200).json(tasks);
    } catch (err) {
        console.error('Error fetching recent tasks:', err);
        res.status(500).send('Server error');
    }
});

router.get('/recentInstallation', async (req, res) => {
    const { userId } = req.query;

    try {
        // Find the user and populate tasks data
        const installations = await Installation.find({ technician: userId })
        .sort({ createdAt: -1 })  // Sort by createdAt in descending order
        .limit(5);  // Limit the results to 5

        if (!installations) {
            return res.status(404).send('installations not found');
        }

        

        // Respond with the last five tasks
        res.status(200).json(installations);
    } catch (err) {
        console.error('Error fetching recent installations:', err);
        res.status(500).send('Server error');
    }
});

router.get("/recentBreakDownData", async (req, res) => {
    const { userId } = req.query;
   

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
      
        // Collect all breakdown notes with number plate and timestamp
        const breakdownNotes = [];

        messages.forEach(message => {
          
            message.callLog.forEach(callLog => {
               
                callLog.notes.forEach(note => {
                   
                    if (note.breakdown === true && note.numberPlate) {
                        breakdownNotes.push({
                            numberPlate: note.numberPlate,
                            timestamp: new Date(note.timestamp)
                        });
                    }
                });
            });
        });

        // Sort the breakdown notes by timestamp in descending order
        breakdownNotes.sort((a, b) => b.timestamp - a.timestamp);

        // Take the top 5 most recent breakdown notes
        const recentBreakdowns = breakdownNotes.slice(0, 5);

        // Respond with the recent breakdowns
        return res.status(200).json(recentBreakdowns);
    } catch (err) {
        console.error('Error fetching breakdown data:', err);
        res.status(500).send('Server error');
    }
});


router.get("/recentCalender", async (req, res) => {
    const { userId } = req.query;

    try {
        // Find the trucks and populate serviceDue data
        const trucks = await Truck.find({
            $or: [
                { driver: userId },
                { vehicleOwner: userId }
            ]
        }).populate({
            path: 'serviceDue',
            options: { sort: { createdAt: -1 } } // Sort by creation date, no limit needed now
        }).exec();

        if (!trucks || trucks.length === 0) {
            return res.status(404).send('User not found or no trucks available');
        }

        // Current UTC time and the time 10 days from now
       
        const now = DateTime.utc().startOf('day');
            const tenDaysFromNow = now.plus({ days: 10 }).startOf('day');

        let nextServiceDueDate = null;
        let dueTruck=null;
        
        // Loop through each truck
        for (let truck of trucks) {
            console.log("Processing truck:", truck._id);

            // Ensure serviceDue exists and is an array
            if (truck.serviceDue && Array.isArray(truck.serviceDue) && truck.serviceDue.length > 0) {
                // Loop through each serviceDue task
                for (let serviceTask of truck.serviceDue) {
                    console.log("Processing service task:", serviceTask);

                    // Check if the service task has a valid nextServiceDate
                    if (serviceTask && serviceTask.nextServiceDate) {
                        const serviceDueDate = DateTime.fromJSDate(serviceTask.nextServiceDate, { zone: 'utc' }).startOf('day');
                        console.log(serviceDueDate)
                        console.log(tenDaysFromNow)

                        // If the service due date is within the next 10 days, set nextServiceDueDate
                        if (serviceDueDate >= now && serviceDueDate <= tenDaysFromNow) {
                            nextServiceDueDate = serviceDueDate.toISO();
                            dueTruck=truck.make;
                            console.log("Next service due:", nextServiceDueDate);
                            break; // No need to check further tasks for this truck if one task is found
                        }
                    }
                }
            }
        }

        if (!nextServiceDueDate) {
            return res.status(200).json({ message: 'No upcoming service within the next 10 days' });
        }

        res.status(200).json({ nextServiceDueDate,dueTruck });

    } catch (err) {
        console.error('Error fetching service data:', err);
        res.status(500).send('Server error');
    }
});


/*router.get("/recentCalender", async (req, res) => {
    const { userId } = req.query;

    try {
        // Find the user and populate serviceDue data
        const truck = await Truck.find({
            $or: [
                { driver: userId },
                { vehicleOwner: userId }
            ]
        }).populate({
            path: 'serviceDue',
            options: { sort: { createdAt: -1 }, limit: 1 } // Sort by creation date and limit to 1
        }).exec();

        if (!truck) {
            return res.status(404).send('User not found');
        }

        console.log("clearly see")
        console.log(truck)

        // Extract the populated serviceDue
       // const serviceDue = truck.serviceDue; // Assuming serviceDue is an array, get the most recent one
        const now = DateTime.utc();
        const tenDaysFromNow = now.plus({ days: 10 });

        let nextServiceDueDate = null;
        console.log("yebobo")
        console.log(truck.serviceDue)


        if (truck.serviceDue) {
            console.log("limit nala")
            console.log("limit nala")
           // const serviceDueDate = DateTime.fromISO(serviceDue.nextServiceDate, { zone: 'utc' });

            //if (serviceDueDate >= now && serviceDueDate <= tenDaysFromNow) {
             //   nextServiceDueDate = serviceDueDate.toISO();
            //}
        }

        if (!nextServiceDueDate) {
            return res.status(200).json({ message: 'No upcoming service within the next 10 days' });
        }

        res.status(200).json({ nextServiceDueDate });

    } catch (err) {
        console.error('Error fetching service data:', err);
        res.status(500).send('Server error');
    }
});*/

module.exports = router;


/*router.get("/recentCalender", async (req, res) => {
    const { userId } = req.query;

    try {
        // Find the user and populate tasks data
        const truck = await Truck.findOne({
            $or: [
                { driver: userId },
                { vehicleOwner: userId }
            ]
        }).populate({
            path: 'serviceDue',
            options: { sort: { createdAt: -1 }, limit: 1 } // Sort by creation date and limit to 5
        }).exec();

        if (!truck) {
            return res.status(404).send('User not found');
        }
        console.log(truck.serviceDue)
   
        console.log(truck.serviceDue)

        // Extract the populated tasks
        const serviceDue = truck.serviceDue;

        // Respond with the last five tasks
        res.status(200).json(serviceDue);

    } catch (err) {
        console.error('Error fetching service data:', err);
        res.status(500).send('Server error');
    }
});*/


module.exports = router;