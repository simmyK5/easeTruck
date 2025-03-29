const express = require('express');
const cors = require('cors');
const bcrypt = require("bcryptjs")
const router = express();
const bodyParser = require('body-parser');
router.use(cors());
router.use(bodyParser.json());
const Truck = require('../model/truck');
const User = require('../model/user');
const ServiceSummary = require('../model/service');

//create truck

router.post("/", async (req, res) => {
  console.log(req.body)
  try {

    const user = await User.findOne({ _id: req.body.vehicleOwner });
    console.log(user)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newTruck = new Truck(
      {
        make: req.body.make,
        model: req.body.model,
        year: req.body.year,
        numberPlate: req.body.numberPlate,
        status: req.body.status,
        driver: req.body.driverId,
        serialNumber: req.body.serialNumber,
        vehicleOwner: req.body.vehicleOwner,
      }
    );

    const savedTruck = await newTruck.save();
    user.truck.push(savedTruck._id);
    await user.save();
    res.status(200).json(savedTruck)
  } catch (error) {
    res.status(401).json(error)
  }
})

//Update truck
router.put("/:id", async (req, res) => {
  try {
    console.log("see id", req.params.id)
    console.log("see body", req.body)
    const updatedItem = await Truck.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (error) {
    res.status(400).send(error);
  }
});

//delete truck
router.delete("/:id", async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id)
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

// Get all trucks
router.get('/trucks', async (req, res) => {
  try {
    const trucks = await Truck.find();
    res.json(trucks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/numberPlate', async (req, res) => {
  const { searchNumberPlate, userId } = req.query;

  if (!searchNumberPlate || !userId) {
    return res.status(400).send('Missing required parameters');
  }

  try {
    console.log('Search Number Plate:', searchNumberPlate);
    console.log('User ID:', userId);

    // Validate userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Find trucks by number plate and either vehicle owner ID or driver ID
    const numberPlates = await Truck.find({
      numberPlate: new RegExp(searchNumberPlate, 'i'),
      $or: [
        { vehicleOwner: userId },
        { driver: userId }
      ]
    }).limit(10); // Limit to 10 results for performance

    console.log('Number Plates:', numberPlates);

    res.json(numberPlates);
  } catch (error) {
    console.error('Error fetching number plates:', error);
    res.status(500).send('Server error');
  }
});


/*router.get('/numberPlate', async (req, res) => {
 
  const { searchNumberPlate,userId } = req.query;
  console.log(searchNumberPlate)
  console.log(userId)
  
  const numberPlates = await Truck.find({
    numberPlate: new RegExp(searchNumberPlate, 'i'),
    or [vehicleOwner: userId,driver:userId]
  }).limit(10); // Limit to 10 results for performance
  console.log(numberPlates)// Limit to 10 results for performance
  res.json(numberPlates);
});*/

router.get("/:userid", async (req, res) => {
  const currentVehicleOwner = req.params.userid
  console.log(currentVehicleOwner)

  try {
    const trucks = await Truck.find({ vehicleOwner: currentVehicleOwner });
    console.log("what happening")
    console.log(trucks)
    res.json(trucks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

router.get("/getTrucks/:truckId", async (req, res) => {
  const truckId = req.params.truckId

  try {
    const trucks = await Truck.findOne({ _id: truckId }).exec();
    console.log("FUTHI")
    console.log(trucks)
    res.json(trucks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

router.get('/serviceSummaries/:userid', async (req, res) => {
  const currentVehicleOwner = req.params.userid;
  console.log("Fetching service summaries for Vehicle Owner ID:", currentVehicleOwner);

  try {
    // Find all trucks for the vehicle owner and populate the serviceDue field
    const trucks = await Truck.find({ vehicleOwner: currentVehicleOwner })
      .populate({
        path: 'serviceDue',
      })
      .exec();

    // Handle case where no trucks are found
    if (!trucks || trucks.length === 0) {
      console.log("No trucks found for Vehicle Owner ID:", currentVehicleOwner);
      return res.status(404).json({ message: 'No trucks found for this vehicle owner' });
    }

    console.log("Trucks with service information:", trucks);

    // Build the service details array
    const serviceDetails = [];
    trucks.forEach(truck => {
      truck.serviceDue.forEach(service => {
        serviceDetails.push({
          id: service._id,
          lastServiceDate: new Date(service.lastServiceDate).toLocaleDateString(), // Ensure valid date handling
          nextServiceDate: new Date(service.nextServiceDate).toLocaleDateString(),
          mileage: service.mileage,
          truck: service.truck,
        });
      });
    });

    console.log('See service details:', serviceDetails);
    return res.json(serviceDetails);
  } catch (err) {
    console.error('Error fetching service summaries:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});






module.exports = router;