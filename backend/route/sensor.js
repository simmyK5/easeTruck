const express = require('express');
const Message = require('../model/message');
const User = require('../model/user');
const Acceleration = require('../model/acceleration');
const Brake = require('../model/brake');
const Fuel = require('../model/fuel');
const GlassBreak = require('../model/glassBreak');
const IdleTime = require('../model/idleTime');
const People = require('../model/people');
const Puncher = require('../model/puncher');
const Steering = require('../model/steering');
const Truck = require('../model/truck');
const TireService = require('../model/tireService');
const ServiceDue = require('../model/service');
const Weapon = require('../model/weapon');
const HighSpeed = require('../model/highSpeed');
const cors = require('cors');
const bcrypt = require("bcryptjs")
const router = express();
const bodyParser = require('body-parser');
const { contentSecurityPolicy } = require('helmet');
router.use(cors());
router.use(bodyParser.json());


router.post('/uploads/uploads', async (req, res) => {
    if (!req.files || !req.files.voice) {
      return res.status(400).send('No file uploaded.');
    }
  
    try {
      const uploadedFile = req.files.voice;
      const timestamp = Date.now(); 
      const fileName = `${uploadedFile.name}`; 
      const uploadPath = path.join(__dirname, 'uploads', fileName); 
  
      // Move the file to the uploads directory
      await uploadedFile.mv(uploadPath);
  
      // Send success response
      res.send(`File uploaded successfully as ${fileName}`);
    } catch (error) {
      res.status(500).send('Error during file upload.');
    }
  });

// Fetch old messages of a conversation between two users
router.post('/puncher', async (req, res) => {
  try {
    const puncher = new Puncher(req.body);
    await puncher.save();

    const io = req.app.get('io');
    if (!io) {
      console.warn('Socket.io instance not found on app');
      return res.status(500).send({ error: 'Socket instance not available' });
    }
    // Emit admin notification
    io.emit('adminNotification', {
      title: 'Puncher Detected',
      message: 'A new puncher audio event was recorded.',
    });

    res.status(201).send(puncher);
  } catch (err) {
    console.error('Error processing puncher route:', err);
    res.status(500).send({ error: err.message });
  }
});



router.post('/glassBreak', async (req, res) => {
    try {
        const glassBreak = new GlassBreak(req.body);
        await glassBreak.save();

        req.app.get('io').emit('audioUploaded', {
            type: 'glassBreak',
            id: glassBreak._id,
            fileUrl: glassBreak.recordUrl,
        });

        res.status(201).send(glassBreak);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});
router.post('/people', async (req, res) => {
    try {
        const people = new People(req.body);
        await people.save();

        req.app.get('io').emit('audioUploaded', {
            type: 'people',
            id: people._id,
            fileUrl: people.recordUrl,
        });

        res.status(201).send(people);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});
router.post('/weapon', async (req, res) => {
    try {
        const weapon = new Weapon(req.body);
        await weapon.save();

        req.app.get('io').emit('audioUploaded', {
            type: 'weapon',
            id: weapon._id,
            fileUrl: weapon.recordUrl,
        });

        res.status(201).send(weapon);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

router.post('/gpsDeviceOne', async (req, res) => {
    try {
        const acceleration = new Acceleration(req.body);
        await acceleration.save();
        res.status(201).send(acceleration);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

router.post('/gpsDeviceTwo', async (req, res) => {
    try {
        const acceleration = new Acceleration(req.body);
        await acceleration.save();
        res.status(201).send(acceleration);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

router.post('/acceleration', async (req, res) => {
    try {
        const acceleration = new Acceleration(req.body);
        await acceleration.save();
        res.status(201).send(acceleration);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

router.post('/brake', async (req, res) => {
    try {
        const brake = new Brake(req.body);
        await brake.save();
        res.status(201).send(brake);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});
router.post('/fuel', async (req, res) => {
    try {
        const fuel = new Fuel(req.body);
        await fuel.save();
        res.status(201).send(fuel);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});
router.post('/idleTime', async (req, res) => {
    try {
        const idleTime = new IdleTime(req.body);
        await idleTime.save();
        res.status(201).send(idleTime);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

router.post('/steering', async (req, res) => {
    try {
        const steering = new Steering(req.body);
        await steering.save();
        res.status(201).send(steering);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

router.post('/service', async (req, res) => {
    try {
        const service = new ServiceDue(req.body);
        await service.save();

        // Update the truck to include the new service ID
       await Truck.findOneAndUpdate(
            { serialNumber: req.body.serialNumber }, // Filter condition
            { $push: { serviceDue: service._id } },  // Update operation
            { new: true }                            // Return the updated document
          );

        res.status(201).send(service);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

router.post('/highSpeed', async (req, res) => {
    try {
        const highSpeed = new HighSpeed(req.body);
        await highSpeed.save();
        res.status(201).send(highSpeed);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});





module.exports = router;
