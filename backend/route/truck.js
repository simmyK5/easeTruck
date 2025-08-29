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
  console.log("fela", currentVehicleOwner)

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

router.get("/getDriver/:serialNumber", async (req, res) => {
  const serialNumber = req.params.serialNumber

  try {
    //const trucks = await Truck.findOne({ serialNumber: serialNumber }).exec();
    const trucks = await Truck.find({ serialNumber: serialNumber })
      .populate({
        path: 'driver',
      })
      .exec();
    console.log("FUTHI")
    console.log(trucks)

    let allFilteredTrucks = [];

    // Iterate through all users to filter acceleration data
    trucks.forEach(truck => {
      if (truck.driver && Array.isArray(truck.drive) && truck.drive > 0) {

        // Add the filtered data to the result array
        allFilteredTrucks = truck.driver
      }
    });
    return res.status(200).json(allFilteredTrucks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})


// GET /backend/truck/getDriversByOwner?vehicleOwnerId=...
/*router.get("/getDriversByOwner", async (req, res) => {
  try {
    const drivers = await Truck.find({ vehicleOwnerId: req.query.vehicleOwnerId });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get drivers' });
  }
});*/


router.get("/getDriversByOwner/:vehicleOwnerId", async (req, res) => {
  const vehicleOwnerId = req.params.vehicleOwnerId;

  try {
    const trucks = await Truck.find({ vehicleOwner: vehicleOwnerId })
      .populate('driver')
      .exec();

    const result = [];

    trucks.forEach(truck => {
      if (truck.driver) {
        result.push({
          driver: truck.driver,
          serialNumber: truck.serialNumber
        });
      }
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching drivers and serials:", err);
    res.status(500).json({ message: err.message });
  }
});



/*router.get('/serviceSummaries/:userid', async (req, res) => {
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
});*/

router.get('/serviceSummaries/:userId', async (req, res) => {


  try {
    // Fetch trucks without trying to limit/populate serviceDue
    const trucks = await Truck.find({ vehicleOwner: req.params.userId }).populate(["driver", "vehicleOwner", "serviceDue"]).exec();

    if (!trucks || trucks.length === 0) {
      return res.status(404).send("User not found or no trucks available");
    }

    const dueTrucks = [];

    for (const truck of trucks) {
      const { numberPlate, make, model, year, driver, vehicleOwner } = truck;

      if (
        (!vehicleOwner?.firstName || !vehicleOwner?.lastName) &&
        (!driver?.firstName || !driver?.lastName)
      ) {
        console.log(`Missing user data for truck ${truck._id}`);
        continue;
      }

      const serviceDueArray = truck.serviceDue || [];


      for (const service of serviceDueArray) {
        console.log("sandi ", service.mileage)
        dueTrucks.push({
          numberPlate,
          make,
          model,
          year,
          mileage: service.mileage,
          id: service._id,
          driverName: `${driver?.firstName || ''} ${driver?.lastName || ''}`.trim(),
        });
      }
    }


    if (dueTrucks.length === 0) {
      return res.status(204).send(); // No content
    }

    res.status(200).json(dueTrucks);

  } catch (err) {
    console.error("Error fetching service data:", err);
    res.status(500).send("Server error");
  }
});






module.exports = router;