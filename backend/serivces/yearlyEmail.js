const cron = require("node-cron");
const axios = require("axios");
const Subscription = require('../model/subscription');
require("dotenv").config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
require("dotenv").config();
const mailjet = require('node-mailjet')
const client = mailjet.apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET);


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
const sendSubscriptionReminder = async (user, startDate) => {
    console.log("User Data:", user);
    console.log("Start Date:", startDate);

    const templatePath = path.join(__dirname, "yearlyEmail.ejs");
    const template = fs.readFileSync(templatePath, "utf-8");
    const emailBody = ejs.render(template, {
        firstName: user.firstName,
        lastName: user.lastName,
        startDate: startDate.toDateString(),
    });

    try {
        await sendReminderEmail(user.email, "Yearly Price Increase Reminder", emailBody);
        console.log(`Price Increase Email Sent to ${user.email}`);
    } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error.message);
    }
};

// Function for 40-day subscription check & sending reminder emails
const yearlyEmail = () => {
      //cron.schedule("*/1 * * * *", async () => {
        //runs first of october at 9
        cron.schedule('0 9 1 10 *', async () => {
        console.log("Running subscription check...");

        try {
            const today = new Date();
            const fortyDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 40);

            console.log("Checking for subscriptions that started on:", fortyDaysAgo.toISOString());

            const subscriptions = await Subscription.find({}).populate("user").exec();


            console.log(`Found ${subscriptions.length} subscriptions`);

            if (subscriptions.length === 0) return console.log("No notifications needed.");

            for (const sub of subscriptions) {
                if (!sub.user || !sub.user.firstName || !sub.user.lastName) {
                    console.log("Skipping subscription due to missing user data:", sub._id);
                    continue;
                }
                await sendSubscriptionReminder(sub.user, sub.startDate);
            }

            console.log("Subscription reminders sent!");
        } catch (err) {
            console.error("Error fetching subscriptions:", err.message);
        }
    });
};

module.exports = yearlyEmail;

