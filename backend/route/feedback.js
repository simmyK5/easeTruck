
const User = require('../model/user');
const Feedback = require('../model/feedback');

//const multer = require("multer")
const fileUpload = require('express-fileupload');
const express = require('express');
const cors = require('cors');
const bcrypt = require("bcryptjs")
const router = express();
const bodyParser = require('body-parser');
router.use(cors());
router.use(bodyParser.json())

//router.use(multer().array())
///router.use(bodyParser.json());
//router.use(fileUpload());


//create feedback

router.post("/", async (req, res) => {
    const { fullname,
        email,
        subject,
        description,
        overallExperience,
        overallExperienceInfo,
        usability,
        usabilityInfo,
        performance,
        performanceInfo,
        design,
        designInfo,
        features,
        featuresInfo,
        support,
        supportInfo } = req.body;

    const status = "New";

    console.log(req.body)

    const newFeedback = new Feedback({
        fullname,
        email,
        subject,
        description,
        overallExperience,
        overallExperienceInfo,
        usability,
        usabilityInfo,
        performance,
        performanceInfo,
        design,
        designInfo,
        features,
        featuresInfo,
        support,
        supportInfo,
        status
    });
    //console.log(newFeedback)
    try {
        //console.log(" we here")
        const savedFeedback = await newFeedback.save()
        res.status(200).json(savedFeedback)
    } catch (error) {
        res.status(401).json(error)
    }
})

    ;

//Update task
router.put("/:id", async (req, res) => {
    try {
        const { fullname,
            email,
            subject,
            description,
            status } = req.body;

        const update = {
            ...(fullname && { fullname }),
            ...(email && { email }),
            ...(subject && { subject }),
            ...(description && { description }),
            ...(status && { status })

        };
        const updatedItem = await Feedback.findByIdAndUpdate(req.params.id, update, { new: true });
        res.json(updatedItem);
    } catch (error) {
        res.status(400).send(error);
    }
});


// get all tasks
router.get("/adminFeedback", async (req, res) => {

    try {
        const feedbacks = await Feedback.find();
        res.status(200).json(feedbacks)
    } catch (error) {
        res.status(500).json(error)
    }

})

/*router.get('/randomTestimonials', async (req, res) => {
    try {
        const randomFeedback = await Feedback.aggregate([{ $sample: { size: 10 } }]);
        res.json(randomFeedback);
    } catch (error) {
        console.error('Error fetching random images:', error);
        res.status(500).json({ error: error.message });
    }

})*/

router.get('/randomTestimonials', async (req, res) => {
  console.log("Fetching random active testimonials...");

  try {
    const randomFeedback = await Feedback.aggregate([
      {
        $match: {
            subject:'Compliment'
        }
      },
      { $sample: { size: 10 } } // Randomly pick 5 ads
    ]);

    res.json(randomFeedback);
  } catch (error) {
    console.error('Error fetching random images:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id)
        if (feedback._id) {
            await feedback.deleteOne()
            res.status(200).json("Feedback deleted")
        } else {
            res.status(403).json("Don't have permissions to delete this feedback")
        }

    } catch (error) {

        res.status(500).json(error)
    }
})




module.exports = router;