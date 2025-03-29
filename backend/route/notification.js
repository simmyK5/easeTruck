const express = require('express');
const cors = require('cors');
const bcrypt = require("bcryptjs")
const router = express();
const bodyParser = require('body-parser');
router.use(cors());
router.use(bodyParser.json());
const Notification = require('../model/notification');
const User = require('../model/user');

router.get('/completedNotification', async (req, res) => {
    const { userId } = req.query;

    try {
        // Find the user and populate tasks data
        const user = await User.findOne({
            $or: [
                { _id: userId }
            ]
        }).populate({
            path: 'notification',
            populate: {
                path: 'task', // Assuming 'task' is the reference field in the notification schema
                select: 'status' // Select only the status field
            }
        }).exec();

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Extract the populated notifications and filter by completed tasks
        const notifications = user.notification.filter(notification => notification.task[0].status == 'Completed');

        
        // Respond with the filtered notifications
        res.status(200).json(notifications);

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/completedNotification/preview', async (req, res) => {
    const { userId } = req.query;

    try {
        // Find the user and populate tasks data
        const user = await User.findOne({
            $or: [
                { _id: userId }
            ]
        }).populate({
            path: 'notification',
            populate: {
                path: 'task', // Assuming 'task' is the reference field in the notification schema
                select: 'status' // Select only the status field
            }
        }).exec();

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Extract the populated notifications and filter by completed tasks
        //const notifications = user.notification.filter(notification => notification.task[0].status == 'Completed');
       // let notifications = user.notification.filter(notification => notification.task && notification.task[0].status == 'Completed');
        let notifications = user.notification.filter(notification => notification.task && notification.task[0].status == 'Completed' &&
            notification.read === false);

        // Sort the notifications by creation date in descending order and limit to the latest 5
        notifications = notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

        // Respond with the filtered notifications
        res.status(200).json(notifications);

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/newTaskNotification', async (req, res) => {
    const { userId } = req.query;

    try {
        // Find the user and populate tasks data
        const user = await User.findOne({
            $or: [
                { _id: userId }
            ]
        }).populate({
            path: 'notification',
            populate: {
                path: 'task', // Assuming 'task' is the reference field in the notification schema
                select: 'status' // Select only the status field
            }
        }).exec();

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Extract the populated notifications and filter by completed tasks
        const notifications = user.notification.filter(notification => notification.task[0].status == 'Not Started');
        // Respond with the filtered notifications
        res.status(200).json(notifications);

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/newTaskNotification/preview', async (req, res) => {
    const { userId } = req.query;

    try {
        // Find the user and populate tasks data
        const user = await User.findOne({
            $or: [
                { _id: userId }
            ]
        }).populate({
            path: 'notification',
            populate: {
                path: 'task', // Assuming 'task' is the reference field in the notification schema
                select: 'status' // Select only the status field
            }
        }).exec();

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Extract the populated notifications and filter by completed tasks
        //const notifications = user.notification.filter(notification => notification.task[0].status == 'Completed');
       // let notifications = user.notification.filter(notification => notification.task && notification.task[0].status == 'Not Started');
        let notifications = user.notification.filter(notification => notification.task && notification.task[0].status == 'Not Started'&&
            notification.read === false);

        // Sort the notifications by creation date in descending order and limit to the latest 5
        notifications = notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

        // Respond with the filtered notifications
        res.status(200).json(notifications);

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/voucherNotification', async (req, res) => {
    const { userId } = req.query;

    try {
        // Find the user and populate tasks data
        const user = await User.findOne({
            $or: [
                { vehicleOwnerId: userId }
            ]
        }).populate({
            path: 'notification',
            populate: {
                path: 'vouchers', // Assuming 'task' is the reference field in the notification schema
                select: 'isRedeemed' // Select only the status field
            }
        }).exec();

        if (!user) {
            return res.status(404).send('User not found');
        }
        console.log("can you stand ")
        console.log(user)
        

        let notifications = [];
        if (user.notification) {
            // Extract the populated notifications and filter by unredeemed vouchers
            notifications = user.notification.filter(notification => 
                notification.vouchers && notification.vouchers.length > 0 && notification.vouchers[0].isRedeemed == false
            );
        }

        // Respond with the filtered notifications
        console.log("shona kwelanga")
        console.log(notifications);
        res.status(200).json(notifications);

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/voucherNotification/preview', async (req, res) => {
    const { userId } = req.query;

    try {
        // Find the user and populate tasks data
        const user = await User.findOne({
            $or: [
                { vehicleOwnerId: userId }
            ]
        }).populate({
            path: 'notification',
            populate: {
                path: 'vouchers', // Assuming 'task' is the reference field in the notification schema
                select: 'isRedeemed' // Select only the status field
            }
        }).exec();


        if (!user) {
            return res.status(404).send('User not found');
        }

        // Extract the populated notifications and filter by completed tasks
       //console.log("see something")
       
       // let notifications = user.notification.filter(notification =>  notification.vouchers && notification.vouchers.length > 0 && notification.vouchers[0].isRedeemed == false)
            let notifications = user.notification.filter(notification => 
                notification.vouchers && notification.vouchers.length > 0 && notification.vouchers[0].isRedeemed == false&&
                notification.read === false)

        // Sort the notifications by creation date in descending order and limit to the latest 5
        notifications = notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        console.log("see something")
        console.log(notifications)

        // Respond with the filtered notifications
        res.status(200).json(notifications);

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.put('/notifications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { read, userId } = req.body;

        const notification = await Notification.findById(id);
        if (!notification) {
            return res.status(404).send('Notification not found');
        }

            if (
                (notification.vehicleOwnerId && notification.vehicleOwnerId.toString() !== userId) &&
                (notification.driverId && notification.driverId.toString() !== userId)
            ) {
                return res.status(403).send('Not authorized to update this notification');
            }
        console.log("me and you lovie")
       
        console.log( notification.read)

        notification.read = read;
        await notification.save();

        res.status(200).json(notification);
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.delete("/:id", async (req, res) => {
    try {
      const notification = await Notification.findById(req.params.id)
      if (notification._id) {
        await notification.deleteOne()
        res.status(200).json("Notification deleted")
      } else {
        res.status(403).json("Don't have permissions to delete this notification")
      }
  
    } catch (error) {
  
      res.status(500).json(error)
    }
  
  })




module.exports = router;