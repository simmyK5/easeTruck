const cron = require("node-cron");
const axios = require("axios");
const Truck = require('../model/truck');
require("dotenv").config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
require("dotenv").config();
const mailjet = require('node-mailjet')
const client = mailjet.apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET);

const MILEAGE_THRESHOLDS = [25000, 30000, 35000]; // Add more if needed


// Function to send reminder email using Mailjet
const sendReminderEmail = async (to, subject, body) => {
    const request = client.post('send', { 'version': 'v3.1' }).request({
        Messages: [
            {
                From: {
                    Email: process.env.MAILJET_FROM_EMAIL, // Your email from Mailjet account
                },
                To: [
                    {
                        Email: to,
                    },
                ],
                Subject: subject,
                HTMLPart: body, // HTML content of the email
            },
        ],
    });

    try {
        const response = await request;
        // console.log("Email sent:", response.body);
        console.log("Email sent:", JSON.stringify(response.body, null, 2));

    } catch (error) {
        console.error("Error sending email:", error);
    }
};

// Function to load the email template & send reminder
const sendSubscriptionReminder = async (vehicleOwner, driver, currentKm) => {
    console.log("User Data:", vehicleOwner);
    console.log("driver Data:", driver);
    console.log("User Data:", currentKm);

    const templatePath = path.join(__dirname, "mileageNotifcation.ejs");
    const template = fs.readFileSync(templatePath, "utf-8");
    const emailBody = ejs.render(template, {
        firstName: vehicleOwner.firstName,
        lastName: vehicleOwner.lastName,
        driverFirstName: driver.firstName,
        driverLastName: driver.lastName,
        currentKm: currentKm,
    });

    try {
        await sendReminderEmail(user.email + driver.email, "Service Due Reminder", emailBody);
    } catch (error) {
        console.error(`Failed to send email to ${user.email} and ${driver.email}:`, error.message);
    }
};

// Function for 40-day subscription check & sending reminder emails
const mileageNotification = () => {
    cron.schedule('* * * * *', async () => {
      console.log("Checking mileage for service reminders...");
  
      try {
        const trucks = await Truck.find({}).populate({
          path: 'serviceDue',
          options: { sort: { createdAt: -1 } }
        });
  
        for (const truck of trucks) {
          const { mileage, _id, vehicleOwner, driver } = truck;
  
          if (!mileage) continue;
  
          // Round mileage to nearest 100 to handle slight odometer drift
          const roundedMileage = Math.round(mileage / 100) * 100;
  
          // Check if mileage matches one of the thresholds
          const matchThreshold = MILEAGE_THRESHOLDS.find(threshold => threshold === roundedMileage);
          if (!matchThreshold) continue;
  
  
          // Skip if missing user data
          if (
            (!vehicleOwner?.firstName || !vehicleOwner?.lastName) &&
            (!driver?.firstName || !driver?.lastName)
          ) {
            console.log(`Missing user data for truck ${_id}`);
            continue;
          }
  
          await sendSubscriptionReminder(vehicleOwner, driver, mileage);
          console.log(`Reminder sent for truck ${_id} at ${mileage} km`);
        }
      } catch (err) {
        console.error('Mileage check failed:', err);
      }
    });
  };

module.exports = mileageNotification;

