const express = require('express');
const paypal = require('@paypal/checkout-server-sdk');
const fileUpload = require('express-fileupload');
const path = require('path');
const Ad = require('../model/ad');
const User = require('../model/user');
const cors = require('cors');


require('dotenv').config();

const router = express();

console.log("see process",process.env.EASETRUCK)
router.use(cors({
  origin: 'https://agreeable-coast-0b6c27e10.6.azurestaticapps.net'
}));
router.use(express.json());
router.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }  // Limit the file size if necessary
}));



//const uploadFolder = path.join(__dirname, 'uploads');
//router.use('/uploads', express.static(uploadFolder));

router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

let environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
let client = new paypal.core.PayPalHttpClient(environment);

router.post('/create-order', async (req, res) => {
  console.log(req.body)
  try {
    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: req.body.totalAmount
        }
      }] ,application_context: {
        brand_name: "Your Brand",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        payment_method: {
            payer_selected: "PAYPAL",
            payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED"
        }
    }
    });

    const response = await client.execute(request);
    console.log(response)
    res.json(response.result);
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/capture-order', async (req, res) => {
  try {
    const uploadedFile = req.files.imagePath ; // Access the file sent via form data
    const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '');

    // Check if a file is uploaded
    if (uploadedFile) {
      // Proceed to move the file

      // Define the upload path
      //const uploadPath = path.join(__dirname, 'uploads', Date.now() + uploadedFile.name);
      const fileName = `${timestamp}_${uploadedFile.name}`;
      const uploadPath = path.join(__dirname, 'uploads', fileName);
      

      // Move the file to the uploads directory
      await uploadedFile.mv(uploadPath);  

      // Now that the file is uploaded, save the image path
      //const imagePath = uploadPath;
      //const imagePath = ;
      //imagePath: `/uploads/${image.name}`,
      
      // Proceed with capturing the order from PayPal
      const request = new paypal.orders.OrdersCaptureRequest(req.body.orderID);
      request.requestBody({});

      const response = await client.execute(request);

      // Find the user based on PayPal response email
      const user = await User.findOne({ email: response.result.payer.email_address });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Extract other necessary details from the request body or PayPal response
      const totalAmount = req.body.totalAmount;

      // Create a new ad order
      const newOrder = new Ad({
        userId: user._id,
        totalAmount: totalAmount,
        paymentId: response.result.id,
        paymentStatus: response.result.status,
        email: user.email,
        title: req.body.adName,
        content: req.body.adDescription,
        linkUrl: req.body.adLink,
        startDate: req.body.adStartDate,
        endDate: req.body.adEndDate,
        active:  req.body.adActive,
        adType:  req.body.adType,
        //imagePath: `/uploads/${Date.now()}${uploadedFile.name}`  // Save the image path
        imagePath: `/uploads/${fileName}`  // Save the image path
      });

      // Save the new order to the database
      const savedOrder = await newOrder.save();
      user.ad.push(savedOrder._id);
      await user.save();

      // Respond with the saved order
      res.json(savedOrder);
    } else {
      console.error("No file uploaded or 'mv' method is missing.");
      return res.status(400).json({ success: false, message: "No file uploaded or incorrect file format" });
    }
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    res.status(500).json({ error: error.message });
  }
});


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

router.get('/adminAds', async (req, res) => {
  console.log(req.query)
  const { period } = req.query;
    const { startDate, endDate } = getDateRange(period);

    console.log("we see money",startDate)
    console.log("we see god",endDate)
    try {
        const ads = await Ad.find();

        // Filter feedbacks based on the timestamp within the date range
        const filteredAd = ads.filter(ad => {
          const adDate = new Date(ad.createdAt); // Assuming feedback has a createdAt field
          return adDate >= new Date(startDate) && adDate <= new Date(endDate);
      });

        //res.json(ads);
        return res.status(200).json(filteredAd);
    } catch (err) {
      console.error('Error fetching Ad data:', err);
      res.status(500).send('Server error');
    }
});

router.get('/ads', async (req, res) => {
  const { currentDate } = req.query; // Get current date from request query
  const currentDateObj = new Date(currentDate); // Convert to Date object
  console.log("check current date",currentDateObj)

  try {
      const ads = await Ad.find();

      // Filter ads based on startDate and endDate
      const filteredAds = ads.filter(ad => {
          const adStartDate = new Date(ad.startDate); // Assuming startDate exists
          const adEndDate = new Date(ad.endDate); // Assuming endDate exists
          console.log(`Ad Start: ${adStartDate}, Ad End: ${adEndDate}, Current Date: ${currentDateObj}`);

          return adStartDate <= currentDateObj && adEndDate >= currentDateObj;
      });
console.log("see filterd ads",filteredAds)
      return res.status(200).json(filteredAds);
  } catch (err) {
      console.error('Error fetching Ad data:', err);
      res.status(500).send('Server error');
  }
});



/*router.get('/randomAd', async (req, res) => {
  console.log("me and you")
  try {
    const randomImages = await Ad.aggregate([{ $sample: { size: 5 } }]);
    res.json(randomImages);
  } catch (error) {
    console.error('Error fetching random images:', error);
    res.status(500).json({ error: error.message });
  }
});*/

router.get('/randomAd', async (req, res) => {
  console.log("Fetching random active ads...");

  const currentDate = new Date(); // Get today's date

  try {
    const randomImages = await Ad.aggregate([
      {
        $match: {
          startDate: { $lte: currentDate }, // startDate is on or before today
          endDate: { $gte: currentDate }    // endDate is on or after today
        }
      },
      { $sample: { size: 5 } } // Randomly pick 5 ads
    ]);

    res.json(randomImages);
  } catch (error) {
    console.error('Error fetching random images:', error);
    res.status(500).json({ error: error.message });
  }
});



router.delete("/:id", async (req, res) => {
  try {
      const ad = await Ad.findById(req.params.id)
      if (ad._id) {
          await ad.deleteOne()
          res.status(200).json("Feedback deleted")
      } else {
          res.status(403).json("Don't have permissions to delete this feedback")
      }

  } catch (error) {

      res.status(500).json(error)
  }
})


module.exports = router;
