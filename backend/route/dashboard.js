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
const truck = require('../model/truck');
const brake = require('../model/brake');
const Installation = require('../model/installation');
const Feedback = require('../model/feedback');
const Ad = require('../model/ad');
const Message = require('../model/message');


const getDateRange = (period) => {
    const now = new Date();
    let startDate;

    switch (period) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - now.getDay());
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case '4months':
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        default:
            startDate = new Date(0);
            break;
    }

    return { startDate, endDate: now };
};

/*router.get("/getVoucher/:id", async (req, res) => {

    console.log("ghetto febulaous")
    console.log(req.params)
    try {
        const user = await User.findById(req.params.id).populate('vouchers').exec();
        res.json(user);
    } catch (err) {
        res.status(500).send('Server error');
    }
  });*/

// get all acceleration by driver id
//router.get("/acceleration/:userId/:period", async (req, res) => {
router.get("/acceleration", async (req, res) => {
    const { userId, period } = req.query;
    const { startDate, endDate } = getDateRange(period);
    try {
        // Find the user and populate acceleration data
        //const user = await User.findById(userId).populate('acceleration').exec();
        /*const user = await User.findById(userId)
        .populate('vehicleOwnerId') // Populate the `vehicleOwnerId` field
        .populate('acceleration') // Populate the `acceleration` field if it references other data
        .exec();*/

        const users = await User.find({
            $or: [
                { _id: userId },
                { vehicleOwnerId: userId }
            ]
        })
            .populate('acceleration') // Assuming acceleration is a field to populate in the User model
            .exec();

        if (!users) {
            return res.status(404).send('User not found');
        }
        //console.log(user.acceleration)

        let allFilteredAccelerations = [];

        // Iterate through all users to filter acceleration data
        users.forEach(user => {
            if (user.acceleration && Array.isArray(user.acceleration) && user.acceleration.length > 0) {
                // Filter acceleration data within the date range for each user
                const filteredAccelerations = user.acceleration.filter(acceleration => {
                    return acceleration.timestamp >= startDate && acceleration.timestamp <= endDate;
                });

                // Add the filtered data to the result array
                allFilteredAccelerations = allFilteredAccelerations.concat(filteredAccelerations);
            }
        });

        if (allFilteredAccelerations.length === 0) {
            return res.status(404).send('No acceleration data found for the given period');
        }

        // Respond with combined filtered data
        return res.status(200).json(allFilteredAccelerations);
    } catch (err) {
        console.error('Error fetching acceleration data:', err);
        res.status(500).send('Server error');
    }
});

// get all fuel by driver id
router.get("/fuel", async (req, res) => {

    const { userId, period } = req.query;
    const { startDate, endDate } = getDateRange(period);


    try {
        // Find the user and populate acceleration data
        const users = await User.find({
            $or: [
                { _id: userId },
                { vehicleOwnerId: userId }
            ]
        })
            .populate('fuel') // Assuming acceleration is a field to populate in the User model
            .exec();

        if (!users) {
            return res.status(404).send('User not found');
        }


        let allFilteredFuel = [];

        // Iterate through all users to filter acceleration data
        users.forEach(user => {
            if (user.fuel && Array.isArray(user.fuel) && user.fuel.length > 0) {

                // Filter acceleration data within the date range for each user
                const filteredFuel = user.fuel.filter(fuel => {
                    return fuel.timestamp >= startDate && fuel.timestamp <= endDate;
                });

                // Add the filtered data to the result array
                allFilteredFuel = allFilteredFuel.concat(filteredFuel);

            }
        });

        if (allFilteredFuel.length === 0) {
            return res.status(404).send('No fuel data found for the given period');
        }

        // Respond with combined filtered data
        return res.status(200).json(allFilteredFuel);
    } catch (err) {
        console.error('Error fetching acceleration data:', err);
        res.status(500).send('Server error');
    }

})

// get all idleTime by driver id
router.get("/idleTime", async (req, res) => {
    const { userId, period } = req.query;
    const { startDate, endDate } = getDateRange(period);


    try {
        // Find the user and populate acceleration data
        const users = await User.find({
            $or: [
                { _id: userId },
                { vehicleOwnerId: userId }
            ]
        })
            .populate('idletimes') // Assuming acceleration is a field to populate in the User model
            .exec();

        if (!users) {
            return res.status(404).send('User not found');
        }


        let allFilteredIdleTimes = [];

        // Iterate through all users to filter acceleration data
        users.forEach(user => {
            if (user.idletimes && Array.isArray(user.idletimes) && user.idletimes.length > 0) {
                // Filter acceleration data within the date range for each user
                const filteredIdleTimes = user.idletimes.filter(idleTime => {
                    return idleTime.timestamp >= startDate && idleTime.timestamp <= endDate;
                });

                // Add the filtered data to the result array
                allFilteredIdleTimes = allFilteredIdleTimes.concat(filteredIdleTimes);

            }
        });

        if (allFilteredIdleTimes.length === 0) {
            return res.status(404).send('No fuel data found for the given period');
        }

        // Respond with combined filtered data
        return res.status(200).json(allFilteredIdleTimes);
    } catch (err) {
        console.error('Error fetching Idle Time data:', err);
        res.status(500).send('Server error');
    }

})

// get all service by driver id
router.get("/service", async (req, res) => {
    const { userId, period } = req.query;
    const { startDate, endDate } = getDateRange(period);

    try {
        // Fetch user with populated trucks
        const trucks = await truck.find({
            $or: [
                { driver: userId },
                { vehicleOwner: userId }
            ]
        })
            .populate('serviceDue') // Assuming acceleration is a field to populate in the User model
            .exec();

        if (!trucks) {
            return res.status(404).send('User not found');
        }



        // Extract serviceDue data within the date range
        const serviceDueData = trucks
            .map(truck => truck.serviceDue) // Extract serviceDue
            .filter(serviceDue => {
                // Ensure serviceDue exists and is within the range
                return (
                    serviceDue &&
                    serviceDue.timestamp >= startDate &&
                    serviceDue.timestamp <= endDate
                );
            });

        // Respond with the filtered service due data
        res.status(200).json(serviceDueData);
    } catch (err) {
        console.error('Error fetching service data:', err);
        res.status(500).send('Server error');
    }
});




// get all tireService by driver id
router.get("/tireService", async (req, res) => {
    const { userId, period } = req.query;
    const { startDate, endDate } = getDateRange(period);

    try {
        // Fetch user with populated trucks
        const trucks = await truck.find({
            $or: [
                { driver: userId },
                { vehicleOwner: userId }
            ]
        })
            .populate('tireService') // Assuming acceleration is a field to populate in the User model
            .exec();

        if (!trucks) {
            return res.status(404).send('User not found');
        }
        console.log(trucks)


        // Extract serviceDue data within the date range
        const serviceTireData = trucks
            .map(truck => truck.tireService) // Extract serviceDue
            .filter(tireService => {
                // Ensure serviceDue exists and is within the range
                return (
                    tireService &&
                    tireService.timestamp >= startDate &&
                    tireService.timestamp <= endDate
                );
            });

        // Respond with the filtered service due data
        res.status(200).json(serviceTireData);
    } catch (err) {
        console.error('Error fetching tire service data:', err);
        res.status(500).send('Server error');
    }

})

// get all turning by driver id
router.get("/steering", async (req, res) => {
    const { userId, period } = req.query;
    const { startDate, endDate } = getDateRange(period);


    try {
        // Find the user and populate acceleration data
        const users = await User.find({
            $or: [
                { _id: userId },
                { vehicleOwnerId: userId }
            ]
        })
            .populate('steerings') // Assuming acceleration is a field to populate in the User model
            .exec();

        if (!users) {
            return res.status(404).send('User not found');
        }


        let allFilteredSteering = [];

        // Iterate through all users to filter acceleration data
        users.forEach(user => {
            if (user.steerings && Array.isArray(user.steerings) && user.steerings.length > 0) {

                // Filter acceleration data within the date range for each user
                const filteredIdleTimes = user.steerings.filter(steering => {
                    return steering.timestamp >= startDate && steering.timestamp <= endDate;
                });

                // Add the filtered data to the result array
                allFilteredSteering = allFilteredSteering.concat(filteredIdleTimes);
            }
        });

        if (allFilteredSteering.length === 0) {
            return res.status(404).send('No fuel data found for the given period');
        }

        // Respond with combined filtered data
        return res.status(200).json(allFilteredSteering);
    } catch (err) {
        console.error('Error fetching Idle Time data:', err);
        res.status(500).send('Server error');
    }

})

router.get("/braking", async (req, res) => {
    const { userId, period } = req.query;
    const { startDate, endDate } = getDateRange(period);

    try {
        // Find the user and populate brakes data
        const users = await User.find({
            $or: [
                { _id: userId },
                { vehicleOwnerId: userId }
            ]
        })
            .populate('brake') // Assuming acceleration is a field to populate in the User model
            .exec();

        if (!users) {
            return res.status(404).send('User not found');
        }


        let allFilteredBrakes = [];

        // Iterate through all users to filter acceleration data
        users.forEach(user => {
            if (user.steerings && Array.isArray(user.steerings) && user.steerings.length > 0) {

                // Filter acceleration data within the date range for each user
                const filteredBrake = user.brake.filter(brake => {
                    return brake.timestamp >= startDate && brake.timestamp <= endDate;
                });

                // Add the filtered data to the result array
                allFilteredBrakes = allFilteredBrakes.concat(filteredBrake);
            }
        });

        if (allFilteredBrakes.length === 0) {
            return res.status(404).send('No fuel data found for the given period');
        }

        // Respond with combined filtered data
        return res.status(200).json(allFilteredBrakes);
    } catch (err) {
        console.error('Error fetching braking data:', err);
        res.status(500).send('Server error');
    }
});


router.get("/trucks", async (req, res) => {
    const { userId, period } = req.query;
    const { startDate, endDate } = getDateRange(period);
    console.log('what')

    try {
        // Find the user and populate brakes data
        const user = await User.findById(userId).populate('truck').exec();
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Filter brakes data within the date range
        const filteredTrucks = user.truck.filter(truck => {
            return truck.timestamp >= startDate && truck.timestamp <= endDate;
        });

        res.status(200).json(filteredTrucks);
    } catch (err) {
        console.error('Error fetching service data:', err);
        res.status(500).send('Server error');
    }
});

router.get("/voucher", async (req, res) => {
    const { userId, period } = req.query;
    const { startDate, endDate } = getDateRange(period);


    try {
        // Find the user and populate brakes data
        const user = await User.findById(userId).populate('vouchers').exec();

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Filter brakes data within the date range
        const filteredTrucks = user.vouchers.filter(voucher => {
            return voucher.timestamp >= startDate && voucher.timestamp <= endDate;
        });

        // Respond with filtered data
        res.status(200).json(filteredTrucks);
    } catch (err) {
        console.error('Error fetching service data:', err);
        res.status(500).send('Server error');
    }
});

router.get("/load", async (req, res) => {
    const { userId, period } = req.query;
    const { startDate, endDate } = getDateRange(period);

    try {
        // Find all users with the specified vehicleOwnerId and populate tasks
        //const users = await User.find({ vehicleOwnerId: userId }).populate('task').exec();
        const users = await User.find({
            $or: [
                { _id: userId },
                { vehicleOwnerId: userId }
            ]
        })
            .populate('task') // Assuming acceleration is a field to populate in the User model
            .exec();

        if (!users || users.length === 0) {
            return res.status(404).send('Users not found');
        }

        // Now filter tasks for each user based on the createdAt field within the date range
        const filteredUsersWithTasks = users
            .map(user => {
                // Filter tasks based on the createdAt field
                const filteredTasks = user.task.filter(task => {
                    const taskDate = new Date(task.createdAt); // Assuming task has createdAt field
                    return taskDate >= new Date(startDate) && taskDate <= new Date(endDate);
                });

                // Return the user object with filtered tasks
                return {
                    ...user.toObject(),
                    tasks: filteredTasks  // Add filtered tasks to the user object
                };
            })
            .filter(user => user.tasks.length > 0);  // Filter out users with no tasks

        // console.log("Filtered driver data:", filteredUsersWithTasks);

        // Respond with the filtered users and their filtered tasks
        res.status(200).json(filteredUsersWithTasks);
    } catch (err) {
        console.error('Error fetching driver data:', err);
        res.status(500).send('Server error');
    }
});
router.get("/overLoad", async (req, res) => {
    const { userId, period } = req.query;
    const { startDate, endDate } = getDateRange(period);

    try {
        // Find all users with the specified vehicleOwnerId and populate tasks
        const users = await User.find({ vehicleOwnerId: userId }).populate('task').exec();

        if (!users || users.length === 0) {
            return res.status(404).send('Users not found');
        }

        // Accumulate all overloaded tasks into a single array
        const overloadedTasks = users.flatMap(user => {
            return user.task.filter(task => {
                console.log("debugging task",task)
                const taskDate = new Date(task.createdAt); // Assuming task has createdAt field
                return taskDate >= new Date(startDate) && taskDate <= new Date(endDate) && task.onload > task.loadCapacity;
            });
        });

        // Respond with the accumulated overloaded tasks
        res.status(200).json(overloadedTasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).send('Server error');
    }
});

router.get("/task", async (req, res) => {
    const { userId, period } = req.query;
    const { startDate, endDate } = getDateRange(period);
    console.log('what')

    try {
        // Find the user and populate brakes data
        const users = await User.find({
            $or: [
                { _id: userId },
                { vehicleOwnerId: userId }
            ]
        })
            .populate('task') // Assuming acceleration is a field to populate in the User model
            .exec();

        if (!users) {
            return res.status(404).send('User not found');
        }


        let allFilteredTask = [];

        // Iterate through all users to filter acceleration data
        users.forEach(user => {
            if (user.task && Array.isArray(user.task) && user.task.length > 0) {

                // Filter acceleration data within the date range for each user
                const filteredTask = user.task.filter(task => {
                    return task.timestamp >= startDate && task.timestamp <= endDate;
                });

                // Add the filtered data to the result array
                allFilteredTask = allFilteredTask.concat(filteredTask);
            }
        });

        if (allFilteredTask.length === 0) {
            return res.status(404).send('No fuel data found for the given period');
        }

        // Respond with combined filtered data
        return res.status(200).json(allFilteredTask);
    } catch (err) {
        console.error('Error fetching service data:', err);
        res.status(500).send('Server error');
    }
});

router.get("/breakDown", async (req, res) => {
    const { period, userId } = req.query;
    const { startDate, endDate } = getDateRange(period);

    try {
        // Find user by userId
        console.log("wozala", userId);
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        console.log("mothla sona", user.vehicleOwnerId);

        // Find all messages for the user's vehicleOwnerId
        const messages = await Message.find({
            chatId: { $regex: user.vehicleOwnerId } // Check if vehicleOwnerId is part of chatId
        });
        console.log("mothla sona message", messages);
        if (!messages || messages.length === 0) {
            return res.status(404).send('No messages found');
        }

        // Filter messages based on notes and the breakdown status within the given date range
        const filteredBreakDown = messages.map(message => {
            console.log("mothla sona two", message);
            // Filter notes in each message
            const filteredNotes = message.callLog.flatMap(callLog => {  // Use flatMap to flatten the results
                console.log("mothla sona callog", callLog);
                return callLog.notes.filter(note => {
                    console.log("mothla sona notes", note);
                    // Filter notes based on breakdown status and timestamp
                    const noteDate = new Date(note.timestamp);
                    console.log(startDate);
                    console.log(noteDate);
                    console.log(endDate);
                    return note.breakdown === true &&
                        noteDate >= new Date(startDate) && 
                        noteDate <= new Date(endDate);
                });
            });

            console.log("kulungile", filteredNotes);

            // Only return messages that have filtered notes
            if (filteredNotes.length > 0) {
                return {
                    ...message,
                    notes: filteredNotes // Include only the filtered notes
                };
            }
            return null; // Return null if no notes match the criteria
        }).filter(message => message !== null); // Remove messages that have no filtered notes

        if (filteredBreakDown.length === 0) {
            return res.status(404).send('No breakdown data found for the given period');
        }

        // Respond with the filtered breakdown data
        return res.status(200).json(filteredBreakDown);
    } catch (err) {
        console.error('Error fetching breakdown data:', err);
        res.status(500).send('Server error');
    }
});


router.get("/truckBreakDown", async (req, res) => {
    const { period, userId } = req.query;
    const { startDate, endDate } = getDateRange(period);

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

        // Initialize a map to count breakdowns by number plate
        const breakdownCounts = {};

        // Filter messages based on notes and the breakdown status within the given date range
        messages.forEach(message => {
            const filteredNotes = message.callLog.flatMap(callLog => {
                return callLog.notes.filter(note => {
                    const noteDate = new Date(note.timestamp);
                    return note.breakdown === true &&
                        noteDate >= new Date(startDate) && 
                        noteDate <= new Date(endDate);
                }).map(note => {
                    // Extract number plate from the note
                    const numberPlate = note.numberPlate; // Adjust according to your data structure
                    if (numberPlate) {
                        if (!breakdownCounts[numberPlate]) {
                            breakdownCounts[numberPlate] = 0;
                        }
                        breakdownCounts[numberPlate]++;
                    }
                    return note;
                });
            });

            console.log("kulungile", filteredNotes);
        });

        if (Object.keys(breakdownCounts).length === 0) {
            return res.status(404).send('No breakdown data found for the given period');
        }
        console.log("see breakdown",breakdownCounts)

        // Respond with the breakdown counts by number plate
        return res.status(200).json(breakdownCounts);
    } catch (err) {
        console.error('Error fetching breakdown data:', err);
        res.status(500).send('Server error');
    }
});


router.get("/installation", async (req, res) => {
    const { period } = req.query;
    const { startDate, endDate } = getDateRange(period);

    try {
        // Find all installations
        const installations = await Installation.find();
        if (!installations || installations.length === 0) {
            return res.status(404).send('No installations found');
        }

        // Filter installations based on the timestamp within the date range
        const filteredInstallations = installations.filter(installation => {

            const installationDate = new Date(installation.createdAt); // Assuming installation has a timestamp field

            return installationDate >= new Date(startDate) && installationDate <= new Date(endDate);
        });

        if (filteredInstallations.length === 0) {
            return res.status(404).send('No installation data found for the given period');
        }

        // Respond with the filtered installations
        return res.status(200).json(filteredInstallations);
    } catch (err) {
        console.error('Error fetching installation data:', err);
        res.status(500).send('Server error');
    }
});

router.get("/driverInstallation", async (req, res) => {
    const { period, userId } = req.query;
    const { startDate, endDate } = getDateRange(period);

    try {
        // Find all installations
        console.log("userId", userId)
        const installations = await Installation.find({ technician: userId });
        console.log("my dawg", installations)
        if (!installations || installations.length === 0) {
            return res.status(404).send('No installations found');
        }

        // Filter installations based on the timestamp within the date range
        const filteredInstallations = installations.filter(installation => {

            const installationDate = new Date(installation.createdAt); // Assuming installation has a timestamp field

            return installationDate >= new Date(startDate) && installationDate <= new Date(endDate);
        });

        if (filteredInstallations.length === 0) {
            return res.status(404).send('No installation data found for the given period');
        }

        // Respond with the filtered installations
        return res.status(200).json(filteredInstallations);
    } catch (err) {
        console.error('Error fetching installation data:', err);
        res.status(500).send('Server error');
    }
});

router.get("/installationType", async (req, res) => {
    const { period } = req.query;
    const { startDate, endDate } = getDateRange(period);

    try {
        // Find all installations
        const installations = await Installation.find();
        if (!installations || installations.length === 0) {
            return res.status(404).send('No installations found');
        }

        // Filter installations based on the timestamp within the date range
        const filteredInstallations = installations.filter(installation => {
            const installationDate = new Date(installation.createdAt); // Assuming installation has a createdAt field
            return installationDate >= new Date(startDate) && installationDate <= new Date(endDate);
        });

        if (filteredInstallations.length === 0) {
            return res.status(404).send('No installation data found for the given period');
        }

        // Flatten the items from each filtered installation into a single array
        const items = filteredInstallations.reduce((acc, installation) => {
            if (installation.items) {
                return acc.concat(installation.items);
            }
            return acc;
        }, []);

        // Respond with the flattened items array
        return res.status(200).json(items);
    } catch (err) {
        console.error('Error fetching installation data:', err);
        res.status(500).send('Server error');
    }
});

router.get("/driverInstallationType", async (req, res) => {
    const { period, userId } = req.query;
    const { startDate, endDate } = getDateRange(period);

    try {
        // Find all installations
        console.log("userId", userId)
        const installations = await Installation.find({ technician: userId });
        console.log("my dawg two", installations)

        if (!installations || installations.length === 0) {
            return res.status(404).send('No installations found');
        }

        // Filter installations based on the timestamp within the date range
        const filteredInstallations = installations.filter(installation => {
            const installationDate = new Date(installation.createdAt); // Assuming installation has a createdAt field
            return installationDate >= new Date(startDate) && installationDate <= new Date(endDate);
        });

        if (filteredInstallations.length === 0) {
            return res.status(404).send('No installation data found for the given period');
        }

        // Flatten the items from each filtered installation into a single array
        const items = filteredInstallations.reduce((acc, installation) => {
            if (installation.items) {
                return acc.concat(installation.items);
            }
            return acc;
        }, []);

        // Respond with the flattened items array
        return res.status(200).json(items);
    } catch (err) {
        console.error('Error fetching installation data:', err);
        res.status(500).send('Server error');
    }
});

router.get("/installationProvince", async (req, res) => {
    const { period } = req.query;
    const { startDate, endDate } = getDateRange(period);

    try {
        // Find all installations
        const installations = await Installation.find();
        if (!installations || installations.length === 0) {
            return res.status(404).send('No installations found');
        }

        // Filter installations based on the timestamp within the date range
        const filteredInstallations = installations.filter(installation => {
            const installationDate = new Date(installation.createdAt); // Assuming installation has a createdAt field
            return installationDate >= new Date(startDate) && installationDate <= new Date(endDate);
        });

        if (filteredInstallations.length === 0) {
            return res.status(404).send('No installation data found for the given period');
        }

        // Flatten the items from each filtered installation into a single array
        const provinceCounts = filteredInstallations.reduce((acc, installation) => {
            if (installation.address && installation.address.province) {
                const province = installation.address.province;
                acc[province] = (acc[province] || 0) + 1;
            }
            return acc;
        }, {});

        // Convert the object to an array of { name, count } objects
        const provinces = Object.entries(provinceCounts).map(([name, count]) => ({ name, count }));

        // Respond with the list of provinces and their counts
        return res.status(200).json(provinces);
    } catch (err) {
        console.error('Error fetching installation data:', err);
        res.status(500).send('Server error');
    }
});

router.get("/driverInstallationProvince", async (req, res) => {
    const { period, userId } = req.query;
    const { startDate, endDate } = getDateRange(period);

    try {
        // Find all installations
        console.log("userId", userId)
        const installations = await Installation.find({ technician: userId });
        console.log("my dawg three", installations)
        if (!installations || installations.length === 0) {
            return res.status(404).send('No installations found');
        }

        // Filter installations based on the timestamp within the date range
        const filteredInstallations = installations.filter(installation => {
            const installationDate = new Date(installation.createdAt); // Assuming installation has a createdAt field
            return installationDate >= new Date(startDate) && installationDate <= new Date(endDate);
        });

        if (filteredInstallations.length === 0) {
            return res.status(404).send('No installation data found for the given period');
        }

        // Flatten the items from each filtered installation into a single array
        const provinceCounts = filteredInstallations.reduce((acc, installation) => {
            console.log("we love", installation.address)
            if (installation.address && installation.address.admin_area_1) {
                const province = installation.address.admin_area_1;
                acc[province] = (acc[province] || 0) + 1;
            }
            return acc;
        }, {});

        console.log("province", provinceCounts)

        // Convert the object to an array of { name, count } objects
        const provinces = Object.entries(provinceCounts).map(([name, count]) => ({ name, count }));

        // Respond with the list of provinces and their counts
        return res.status(200).json(provinces);
    } catch (err) {
        console.error('Error fetching installation data:', err);
        res.status(500).send('Server error');
    }
});

router.get("/feedbackType", async (req, res) => {
    const { period } = req.query;
    const { startDate, endDate } = getDateRange(period);

    try {
        // Find all feedbacks
        const feedbacks = await Feedback.find();

        if (!feedbacks || feedbacks.length === 0) {
            return res.status(404).send('No feedback found');
        }

        // Filter feedbacks based on the timestamp within the date range
        const filteredFeedbacks = feedbacks.filter(feedback => {
            const feedbackDate = new Date(feedback.createdAt); // Assuming feedback has a createdAt field
            return feedbackDate >= new Date(startDate) && feedbackDate <= new Date(endDate);
        });

        if (filteredFeedbacks.length === 0) {
            return res.status(404).send('No feedback data found for the given period');
        }

        // Count the occurrences of each subject in the filtered feedbacks
        const subjectCount = filteredFeedbacks.reduce((acc, feedback) => {
            const subject = feedback.subject; // Assuming each feedback has a subject field
            if (subject) {
                acc[subject] = (acc[subject] || 0) + 1;
            }
            return acc;
        }, {});

        // Convert the subject count object into an array of objects for response
        const subjectArray = Object.keys(subjectCount).map(subject => ({
            name: subject,
            value: subjectCount[subject]
        }));

        console.log(subjectArray); // Log the subject count array

        // Respond with the subject count data
        return res.status(200).json(subjectArray);
    } catch (err) {
        console.error('Error fetching feedback data:', err);
        res.status(500).send('Server error');
    }
});

router.get("/feedbackStatus", async (req, res) => {
    const { period } = req.query;
    const { startDate, endDate } = getDateRange(period);

    try {
        // Find all feedbacks
        const feedbacks = await Feedback.find();

        if (!feedbacks || feedbacks.length === 0) {
            return res.status(404).send('No feedback found');
        }

        // Filter feedbacks based on the timestamp within the date range
        const filteredFeedbacks = feedbacks.filter(feedback => {
            const feedbackDate = new Date(feedback.createdAt); // Assuming feedback has a createdAt field
            return feedbackDate >= new Date(startDate) && feedbackDate <= new Date(endDate);
        });

        if (filteredFeedbacks.length === 0) {
            return res.status(404).send('No feedback data found for the given period');
        }

        // Count the occurrences of each subject in the filtered feedbacks
        const statusCount = filteredFeedbacks.reduce((acc, feedback) => {
            const status = feedback.status; // Assuming each feedback has a subject field
            if (status) {
                acc[status] = (acc[status] || 0) + 1;
            }
            return acc;
        }, {});

        // Convert the subject count object into an array of objects for response
        const statusArray = Object.keys(statusCount).map(status => ({
            name: status,
            value: statusCount[status]
        }));

        console.log(statusArray); // Log the subject count array

        // Respond with the subject count data
        return res.status(200).json(statusArray);
    } catch (err) {
        console.error('Error fetching feedback data:', err);
        res.status(500).send('Server error');
    }
});


router.get("/allAd", async (req, res) => {
    const { period } = req.query;
    const { startDate, endDate } = getDateRange(period);


    try {
        // Find all ads
        const ads = await Ad.find();


        if (!ads || ads.length === 0) {
            return res.status(404).send('No ads found');
        }

        // Filter ads based on the timestamp within the date range
        const filteredAds = ads.filter(ad => {
            const adDate = new Date(ad.createdAt); // Assuming ad has a createdAt field
            console.log(adDate)
            return adDate >= new Date(startDate) && adDate <= new Date(endDate);
        });

        console.log("matla sona", filteredAds)

        // Get the count of filtered ads
        const adCount = filteredAds.length;

        if (adCount === 0) {
            return res.status(404).send('No ad data found for the given period');
        }

        // Respond with the ad count
        return res.status(200).json({ adCount });
    } catch (err) {
        console.error('Error fetching ad data:', err);
        res.status(500).send('Server error');
    }
});

router.get("/adCost", async (req, res) => {
    const { period } = req.query;
    const { startDate, endDate } = getDateRange(period);

    try {
        // Find all ads
        const ads = await Ad.find();

        if (!ads || ads.length === 0) {
            return res.status(404).send('No ads found');
        }

        // Filter ads based on the timestamp within the date range
        const filteredAds = ads.filter(ad => {
            const adDate = new Date(ad.createdAt); // Assuming ad has a createdAt field
            return adDate >= new Date(startDate) && adDate <= new Date(endDate);
        });

        if (filteredAds.length === 0) {
            return res.status(404).send('No ad data found for the given period');
        }

        // Calculate the total amount of filtered ads
        const totalAmount = filteredAds.reduce((sum, ad) => sum + ad.totalAmount, 0);

        // Respond with the total amount
        return res.status(200).json({ totalAmount });
    } catch (err) {
        console.error('Error fetching ad data:', err);
        res.status(500).send('Server error');
    }
});


router.get("/activeAd", async (req, res) => {
    const { period } = req.query;
    const { startDate, endDate } = getDateRange(period);

    try {
        // Find all ads
        const ads = await Ad.find();

        if (!ads || ads.length === 0) {
            return res.status(404).send('No ads found');
        }

        // Filter ads based on the timestamp within the date range and active status
        const filteredAds = ads.filter(ad => {
            const adDate = new Date(ad.createdAt); // Assuming ad has a createdAt field
            return adDate >= new Date(startDate) && adDate <= new Date(endDate) && ad.active === true;
        });

        if (filteredAds.length === 0) {
            return res.status(404).send('No active ads found for the given period');
        }

        // Get the count of active ads
        const activeAdCount = filteredAds.length;

        // Respond with the active ad count
        return res.status(200).json({ activeAdCount });
    } catch (err) {
        console.error('Error fetching ad data:', err);
        res.status(500).send('Server error');
    }
});

router.get("/feedbackRating", async (req, res) => {
    const { period } = req.query;
    const { startDate, endDate } = getDateRange(period);

    try {
        // Find all feedbacks
        const feedbacks = await Feedback.find();

        if (!feedbacks || feedbacks.length === 0) {
            return res.status(404).send('No feedback found');
        }

        // Filter feedbacks based on the timestamp within the date range
        const filteredFeedbacks = feedbacks.filter(feedback => {
            const feedbackDate = new Date(feedback.createdAt); // Assuming feedback has a createdAt field
            return feedbackDate >= new Date(startDate) && feedbackDate <= new Date(endDate);
        });

        if (filteredFeedbacks.length === 0) {
            return res.status(404).send('No feedback data found for the given period');
        }

        // Initialize counts for each rating category
        const ratingCounts = {
            overallExperience: 0,
            usability: 0,
            performance: 0,
            design: 0,
            features: 0,
            support: 0
        };

        // Aggregate counts for each rating category
        filteredFeedbacks.forEach(feedback => {
            if (feedback.overallExperience) ratingCounts.overallExperience += 1;
            if (feedback.usability) ratingCounts.usability += 1;
            if (feedback.performance) ratingCounts.performance += 1;
            if (feedback.design) ratingCounts.design += 1;
            if (feedback.features) ratingCounts.features += 1;
            if (feedback.support) ratingCounts.support += 1;
        });

        // Convert the counts into an array of objects for response
        const ratingArray = Object.keys(ratingCounts).map(key => ({
            name: key,
            value: ratingCounts[key]
        }));

        console.log(ratingArray); // Log the rating count array for debugging

        // Respond with the rating count data
        return res.status(200).json(ratingArray);
    } catch (err) {
        console.error('Error fetching feedback data:', err);
        res.status(500).send('Server error');
    }
});



module.exports = router;