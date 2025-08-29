const jwt = require('jsonwebtoken');
const express = require('express');
const cors = require('cors');
const User = require('../model/user');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Subscription = require('../model/subscription');
const { MongoClient } = require('mongodb');
const fileUpload = require('express-fileupload');
const path = require('path');
require('dotenv').config();
const axios = require('axios');



const saltRounds = 10;  // or any other salt rounds number

router.use(cors());
router.use(fileUpload());
router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/*const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);
  console.log("see soething")
  console.log(process.env.JWT_SECRET)

  /*jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    console.log("see erroe")
    console.log(err)
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
  
 jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] },(err, user) => {
    console.log("see erroe")
    console.log(err)
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
  
  //jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });


};*/
const authenticateTokenService = async (token) => {
  try {
    const response = await axios.post('https://auth-service.com/verify', { token });
    return response.data;  // Returns user data if the token is valid
  } catch (err) {
    throw new Error('Invalid token');
  }
};
router.post("/register", async (req, res) => {
  const { email, password, firstName = '', lastName = '' } = req.body;

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    // If user already exists, don't try to re-register — just respond.
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" }); // 409 Conflict
    }

    // Hash the password and save new user
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      isLive: false,
      driverPool: false,
      termsAndConditions: false,
      vehicleOwnerId: '',
      userRole: ''
    });

    await newUser.save();

    // Create JWT token
    const token = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).send('Server error');
  }
});




// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).send('User not found');

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send('Wrong password');

    const payload = {
      user: {
        id: user.id,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
// Get user by email
router.get('/users/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).populate('subscription').exec();

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Filter subscriptions data within the date range and active status
    // const filteredUser = user.subscription ? user.subscription.filter(subscription => subscription && subscription.status === 'ACTIVE') : [];
    const activeSubscription = user.subscription.find(subscription => subscription && subscription.status === 'ACTIVE');

    // Include the user role in the response
    const userWithSubscription = {
      ...user.toObject(),
      subscriptionId: activeSubscription ? activeSubscription._id : 'No active subscription',
      paypalSubscriptionId: activeSubscription ? activeSubscription.subscriptionId : 'No active paypal subscription'
    };
    delete userWithSubscription.password;
    console.log(userWithSubscription)

    res.status(200).json(userWithSubscription);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

router.get('/userExists/:email', async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  res.json({ exists: !!user });
});


//get sunscription of user of 
router.get("/subscription/:email", async (req, res) => {
  try {
    console.log(req.params.email)
    console.log("save me")
    // Find the user and populate acceleration data
    ///const user = await User.findOne({ email: req.params.email }).populate('subscription').exec();
    const user = await User.findOne({ email: req.params.email })
    console.log(user)

    if (!user) {
      return res.status(404).send('User not found');
    }
    // Filter acceleration data within the date range
    const filteredSubscription = user.subscription.filter(subscription => {
      return subscription && subscription.status === "ACTIVE";
    });

    // Respond with filtered data

    res.status(200).json(filteredSubscription);
  } catch (err) {
    console.error('Error fetching acceleration data:', err);
    res.status(500).send('Server error');
  }

})


router.put("/users/:email", async (req, res) => {
  try {
    /* console.log("Updating profile for:", req.params.email);
     console.log("Received body:", req.body);
     console.log("Received files:", req.files);*/

    let updateData = { ...req.body };

    // Handle file upload
    if (req.files && req.files.cv) {
      const cvFile = req.files.cv;
      const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '');
      const fileName = `${timestamp}_${cvFile.name}`;
      const uploadPath = path.join(__dirname, 'uploads', fileName);


      // Move the file to the uploads directory
      await cvFile.mv(uploadPath);

      // Save file URL in database
      updateData.cvUrl = `/uploads/${fileName}`;
    }

    // Update the user with new data
    const updatedUser = await User.findOneAndUpdate(
      { email: req.params.email },
      updateData,
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(400).send("Profile update failed.");
  }
});



async function getAccessToken() {
  const clientID = process.env.AUTH0_CLIENT_ID
  const clientSecret = process.env.AUTH0_CLIENT_SECRET
  const audience = `https://${process.env.AUTH0_DOMAIN}/api/v2/`
  const tokenUrl = `https://${process.env.AUTH0_DOMAIN}/oauth/token`

  console.log("clientID", clientID)
  console.log("clientSecret", clientSecret)
  console.log("audience", audience)
  console.log("tokenUrl", tokenUrl)

  try {
    const response = await axios.post(tokenUrl, {
      client_id: clientID,
      client_secret: clientSecret,
      audience: audience,
      grant_type: 'client_credentials',
    });

    return response.data.access_token;
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error(`Error: ${error.response.status} - ${error.response.data}`);
    } else if (error.request) {
      // No response was received
      console.error("No response received:", error.request);
    } else {
      // Something else caused the error
      console.error("Error", error.message);
    }
    throw error;  // Re-throw the error after logging it
  }

}


router.put("/updateAutho", async (req, res) => {
  try {
    console.log("ngihappy", req.params);
    console.log("ngihappy body", req.body);

    const { email, userId } = req.body;

    // Check if email and userId are present in the request body
    if (!email || !userId) {
      return res.status(400).json({ message: "Missing email or userId" });
    }

    // Get the Access Token from Auth0
    const accessToken = await getAccessToken();

    // Make the PATCH request to update the user's email in Auth0
    const response = await axios.patch(`https://${process.env.AUTH0_DOMAIN}/api/v2/users/${userId}`, {
      email: email,
      email_verified: false  // Trigger email verification process
    }, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    // If the request is successful, return the response data to the client
    return res.status(200).json(response.data);

  } catch (error) {
    // Handle errors
    if (error.response) {
      // Server responded with a status other than 2xx
      console.error(`Error: ${error.response.status} - ${error.response.data}`);
      return res.status(error.response.status).json({ message: error.response.data });
    } else if (error.request) {
      // No response was received
      console.error("No response received:", error.request);
      return res.status(500).json({ message: "No response received from Auth0" });
    } else {
      // Something else caused the error
      console.error("Error", error.message);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
});





router.get('/check-status/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }).populate('subscription').exec();

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Filter subscriptions data within the date range and active status
    // const filteredUser = user.subscription ? user.subscription.filter(subscription => subscription && subscription.status === 'ACTIVE') : [];
    const activeSubscription = user.subscription.find(subscription => subscription && subscription.status === 'ACTIVE');

    // Include the user role in the response
    const userWithRole = {
      email: user.email,
      role: user.userRole, // Assuming the role field exists in the User schema
      termsAndConditions: user.termsAndConditions,
      subscriptionStatus: activeSubscription ? activeSubscription.status : 'No active subscription',
      subscriptionId: activeSubscription ? activeSubscription._id : 'No active subscription',
      paypalSubscriptionId: activeSubscription ? activeSubscription.subscriptionId : 'No active paypal subscription'
    };
    console.log(userWithRole)

    res.status(200).json(userWithRole);
  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/user-role/:email', async (req, res) => {
  const { email } = req.params;
  console.log("yinin bo", email)

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log("yazini maa",user)

    // Return the user role
    res.json({ role: user.userRole, name: user.firstName });
  } catch (error) {
    console.error('Error fetching user role:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const uri = `mongodb://127.0.0.1:27017/VehicleOwner`; // MongoDB URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

router.post('/get-user-role', async (req, res) => {
  const { email } = req.body;

  try {
    await client.connect();
    const database = client.db('VehicleOwner');
    const usersCollection = database.collection('users');
    const subscriptionsCollection = database.collection('subscriptions');

    // Find the user by email
    const userRecord = await usersCollection.findOne({ email });

    if (!userRecord) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the user's subscription
    const subscriptionRecord = await subscriptionsCollection.findOne({ user: userRecord._id });

    if (!subscriptionRecord || subscriptionRecord.status !== "ACTIVE") {
      return res.status(404).json({ error: "Active subscription not found" });
    }

    const subscriptionPlan = subscriptionRecord.planName;

    // Assign roles based on the subscription plan
    let roles = [];

    switch (subscriptionPlan) {
      case 'vehicleOwner':
        roles = ['vehicleOwner'];
        break;
      case 'mechanic':
        roles = ['mechanic'];
        break;
      case 'driver':
        roles = ['driver'];
        break;
      case 'freeplanVehicleOwner':
        roles = ['freeplanVehicleOwner'];
        break;
      case 'freePlanMechanic':
        roles = ['freePlanMechanic'];
        break;
      case 'freePlanDriver':
        roles = ['freePlanDriver'];
        break;
      default:
        roles = ['guest']; // Default role if no matching subscription plan
        break;
    }

    return res.json({ roles });
  } catch (err) {
    console.error('Error fetching subscription plan:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
})



module.exports = router;
