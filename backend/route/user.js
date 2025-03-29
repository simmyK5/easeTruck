const User = require('../model/user');
//const { expressjwt: jwt } = require('express-jwt');
const express = require('express');
const cors = require('cors');
const bcrypt = require("bcryptjs")
const router = express();
const bodyParser = require('body-parser');
const { contentSecurityPolicy } = require('helmet');
router.use(cors());
router.use(bodyParser.json());
const axios = require('axios');
const { jwt } = require('jose')

//create user

router.post("/", async (req, res) => {
  console.log("we are here now")
  console.log(req.body)
  const { firstName, lastName, email, userRole, vehicleOwnerId } = req.body;

  const newUser = new User({ firstName, lastName, email: email.toLowerCase(), userRole, vehicleOwnerId });
  try {
    console.log(newUser)
    const savedUser = await newUser.save()
    res.status(200).json(savedUser)
  } catch (error) {
    res.status(401).json(error)
  }
})



//Update user

router.put("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user.userId === req.body.userId) {
      await user.updateOne({ $set: req.body });
      res.status(200).json("the user has been updated");
    } else {
      res.status(403).json("you can update only your users");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/searchEmail/:email", async (req, res) => {
  try {
    // Extract the email from the request params
    const email = req.params.email;

    // Extract update data from the request body
    const updateData = req.body;

    // Find and update the user with the specified email
    const user = await User.findOneAndUpdate(
      { email: email }, // Filter to find the user by email
      updateData,       // Data to update
      { new: true }     // Return the updated document
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with the updated user data
    res.status(200).json(user);
  } catch (err) {
    // Handle errors
    res.status(500).json({ error: err.message });
  }
});


//delete user
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (user._id) {
      await user.deleteOne()
      res.status(200).json("User deleted")
    } else {
      res.status(403).json("Don't have permissions to delete this user")
    }

  } catch (error) {

    res.status(500).json(error)
  }

})

router.get('/truckDrivers/:vehicleOwnerId', async (req, res) => {
  try {
    console.log("fun times", req.params.vehicleOwnerId);
    
    const vehicleOwner = req.params.vehicleOwnerId;
    const query = req.query.query || ''; 

    console.log("query", query); 

    const drivers = await User.find({
      vehicleOwnerId: vehicleOwner,
      userRole: 'driver',
      $or: [
        { firstName: new RegExp(query, 'i') },
        { lastName: new RegExp(query, 'i') }
      ]
    }).limit(10); 

    res.json(drivers.length > 0 ? drivers : []);
  } catch (error) {
    console.error("Error fetching truck drivers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


//get all Mechanic
router.get("/mechanics/:id", async (req, res) => {
  console.log(req.params.id)
  try {
    const mechanic = await User.find({ userRole: "mechanic" });
    res.json(mechanic);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


//get all technicians
router.get("/technicians", async (req, res) => {
  try {
    const technician = await User.find({ userRole: "technician" });
    if (technician.length === 0) {
      return res.status(404).json({ message: "No technician found" });
    }
    res.json(technician);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/technician', async (req, res) => {
  console.log("do we enter here")
  const { query } = req.query;
  const technicians = await User.find({
    $or: [
      { firstName: new RegExp(query, 'i') },
      { lastName: new RegExp(query, 'i') }
    ]
  }).limit(10); // Limit to 10 results for performance
  res.json(technicians);
});

//get all admin
router.get("/admins", async (req, res) => {
  //console.log(req.params.id)
  console.log("admins")
  try {
    const technician = await User.find({ userRole: "admin" });
    console.log(technician)
    res.json(technician);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//Add admin
router.post("/admin", async (req, res) => {
  const { firstName, lastName, email } = req.body;

  const newUser = new User({ firstName, lastName, email: email.toLowerCase(), userRole: 'admin' });
  try {
    console.log(newUser)
    const savedUser = await newUser.save()
    res.status(200).json(savedUser)
  } catch (error) {
    res.status(401).json(error)
  }
})


//get all profiles for Vehicle Owner
router.get("/profiles", async (req, res) => {
  try {
    const profile = await User.find({ userRole: "Driver" });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get all admin
router.get("/admins", async (req, res) => {
  console.log("this is what we fetcin")

  try {
    const users = await User.find({ userRole: "Admin" });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})


// get all drivers by id
router.get("/drivers", async (req, res) => {
  console.log("this is what we fetcin")

  try {
    const users = await User.find({ userRole: "Driver" });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

router.get("/ownerDrivers/:vehicleOwnerId", async (req, res) => {
  console.log("Fetching drivers for vehicle owner:", req.params.vehicleOwnerId);
  const currentVehicleOwner = req.params.vehicleOwnerId;

  try {
    // Fetch users with populated subscription data
    const users = await User.find({ userRole: "driver", vehicleOwnerId: currentVehicleOwner })
      .populate('subscription') // Assuming subscription is a reference to another collection
      .exec();

    if (!users || users.length === 0) {
      return res.status(404).send('No drivers found for the given vehicle owner');
    }

    // Process each user to find their latest subscription
    const usersWithLatestSubscription = users.map(user => {
      const latestSubscription = user.subscription.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      return {
        planName: latestSubscription ? latestSubscription.planName : null, // Assuming 'planName' field exists in the subscription model
        status: latestSubscription ? latestSubscription.status : null,
        expirationDate: latestSubscription ? latestSubscription.expirationDate : null,
        subscriptionId:latestSubscription ? latestSubscription.subscriptionId : null,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        driverPool: user.driverPool,
        _id: user._id
      };
    });

    console.log("Processed driver data:", usersWithLatestSubscription);

    res.status(200).json(usersWithLatestSubscription);
  } catch (err) {
    console.error('Error fetching drivers and subscriptions:', err);
    res.status(500).send('Server error');
  }
});

// get all drivers by id

/*router.get("/ownerDrivers/:vehicleOwnerId", async (req, res) => {
  console.log("this is what we fetching");
  console.log(req.params);
  const currentVehicleOwner = req.params.vehicleOwnerId;

  try {
    // Fetch user with populated subscription data
    const users = await User.find({ userRole: "driver", vehicleOwnerId: currentVehicleOwner })
      .populate('subscription') // Assuming subscription is a reference to another collection
      .exec();

      console.log(users)
    if (!users || users.length === 0) {
      return res.status(404).send('User not found');
    }

    // Find the latest subscription (assuming 'createdAt' or 'updatedAt' exists in your subscription model)
    const latestSubscription = users[0].subscription.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    console.log(latestSubscription)
    

    if (!latestSubscription) {
      return res.status(404).send('Subscription not found');
    }

    // Send the response with relevant fields
    const responseData = {
      planName: latestSubscription.planName, // Assuming 'plan' field exists in the subscription model
      status: latestSubscription.status,
      expirationDate: latestSubscription.expirationDate,
      firstName: users[0].firstName,
      lastName: users[0].lastName,
      email: users[0].email,
      _id:users[0]._id
    };
  console.log("we trying",responseData)

    res.status(200).json(responseData);
  } catch (err) {
    console.error('Error fetching subscription data:', err);
    res.status(500).send('Server error');
  }
});*/


/*router.get("/ownerDrivers/:vehicleOwnerId", async (req, res) => {
  console.log("this is what we fetcin")
  console.log(req.params)
  const currentVehicleOwner= req.params.vehicleOwnerId

  try {
    const users = await User.find({ userRole: "driver",vehicleOwnerId:currentVehicleOwner});
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})*/


// get all users
router.get("/users", async (req, res) => {

  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

// get all users by id
router.get("/:driver", async (req, res) => {
  console.log("question")
  console.log(req.params.driver)
  try {
    const users = await User.findOne({ _id: req.params.driver });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

router.get('/users/:email', async (req, res) => {
  try {

    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.get('/driverSubUsers/:email', async (req, res) => {
  try {
    console.log("see drivers", req.query)
    const email = req.params.email;

    // Find the user by email
    let user = await User.findOne({ email });

    // If user does not exist, create a new one
    if (!user) {
      user = new User({
        email,
        firstName: req.query.firstName,
        lastName: req.query.lastName,
        userRole: req.query.userRole,
        isLive: req.query.isLive,
        vehicleOwnerId: req.query.vehicleOwnerId ,
      });

      // Save the new user to the database
      await user.save();
    }

    // Return the found or newly created user
    res.status(200).send(user);
  } catch (err) {
    console.error('Error fetching or creating user:', err);
    res.status(500).send('Server error');
  }
});


// get all drivers by vehicle owner id
router.get("/driver/:userid", async (req, res) => {

  try {
    const currentUser = await User.findOne({ userid: req.params.userid });
    const drivers = await Task.find({ vehicleOwnerId: currentUser._id });
    res.status(200).json(drivers)
  } catch (error) {
    res.status(500).json(error)
  }

})


router.get("/getVoucher/:id", async (req, res) => {
  console.log(req.params)
  try {
    const user = await User.findById(req.params.id).populate('vouchers').exec();
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
});


// get all drivers whose profile is live
router.get("/drivers/live", async (req, res) => {
  try {
    const isLiveDrivers = await User.find({ isLive: true });
    res.json(isLiveDrivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/pool/:id", async (req, res) => {

  try {

    const user = await User.findById(req.params.userId);
    if (user.userId) {
      console.log("here")
      req.body.VehicleOwnerId = user.userId
      await user.updateOne({ $set: req.body });
      res.status(200).json("the user has been updated");
    } else {
      res.status(403).json("you can update only your users");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/driverPool/:id", async (req, res) => {
  console.log("smoko", req.params.id);

  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Set VehicleOwnerId directly on the user object
      user.vehicleOwnerId = ""; 
      user.isLive = true;
      user.driverPool = false;

      console.log("Updating user:", user);

      // Save the updated user
      await user.save();

      res.status(200).json("The user has been updated");
    } else {
      res.status(403).json("You can update only your users");
    }
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json(err);
  }
});


/*router.put("/driverPool/:id", async (req, res) => {
  console.log("smoko",req.params.id)
  try {
    const user = await User.findById(req.params.id);
   
    if (user) {
      req.body.VehicleOwnerId = "";
      req.body.isLive = false
      req.body.driverPool = false
console.log("do we even update")
      await user.updateOne({ $set: req.body });
      res.status(200).json("the user has been updated");
    } else {
      res.status(403).json("you can update only your users");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});*/

router.post('/termsAndCondition', async (req, res) => {
  try {
    const { email, checked } = req.body;

    console.log("Received email:", email);

    const user = await User.findOne({ email }); // Retrieve the user first

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the termsAndConditions status
    const updatedUser = await User.findOneAndUpdate(
      { email },  // Search by email
      {
        termsAndConditions: checked, // Update the termsAndConditions field
      },
      { new: true }  // Return the updated document
    );

    console.log('Updated User:', updatedUser);
    // Return the updated user document in the response
    res.json(updatedUser);

  } catch (error) {
    console.error('Error in /termsAndCondition route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;