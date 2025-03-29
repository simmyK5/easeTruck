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

    const templatePath = path.join(__dirname, "forthyDayEmailTemplate.ejs");
    const template = fs.readFileSync(templatePath, "utf-8");
    const emailBody = ejs.render(template, {
        firstName: user.firstName,
        lastName: user.lastName,
        startDate: startDate.toDateString(),
    });

    try {
        await sendReminderEmail(user.email, "Subscription Expiry Reminder", emailBody);
        console.log(`Reminder Email Sent to ${user.email}`);
    } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error.message);
    }
};

// Function for 40-day subscription check & sending reminder emails
const fourthyDayEmail = () => {
    //  cron.schedule("*/1 * * * *", async () => {
        cron.schedule('0 7 * * *', async () => {
        console.log("Running subscription check...");

        try {
            const today = new Date();
            const fortyDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 40);

            console.log("Checking for subscriptions that started on:", fortyDaysAgo.toISOString());

            const subscriptions = await Subscription.find({
                status: { $in: ["ACTIVE", "EXPIRED"] },
                startDate: {
                    $gte: fortyDaysAgo,
                    $lt: new Date(fortyDaysAgo.getTime() + 86400000),
                },
            }).populate("user").exec();

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



/*
const getAccessToken = async () => {
    const response = await fetch(`https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.AZURE_CLIENT_ID,
            client_secret: process.env.AZURE_CLIENT_SECRET,
            scope: "https://graph.microsoft.com/.default",
            grant_type: "client_credentials",
        }),
    });

    const data = await response.json();
    return data.access_token;
};


// 🔹 Send Email via Microsoft Graph API
const sendEmail = async (to, subject, body) => {

    const accessToken = await getAccessToken();
    console.log("see access token", accessToken)
    const client = Client.init({ authProvider: (done) => done(null, accessToken) });

    try {
        await client.api(`/users/${process.env.AZURE_EMAIL_FROM}/sendMail`).post({
            message: {
                subject,
                body: { contentType: "HTML", content: body },
                toRecipients: [{ emailAddress: { address: to } }],
            },
        });
    } catch (error) {
        console.error("Error sending email:", error);
        // You can add additional error handling here if needed (e.g., logging to an external service or user notification).
    }

    console.log(`Email sent to ${to}`);
};

// 🔹 Load Email Template & Send Reminder
const sendSubscriptionReminder = async (user, startDate) => {
    console.log("umzileni", user)
    console.log("umzileni startDate", startDate)
    const templatePath = path.join(__dirname, "forthyDayEmailTemplate.ejs");
    console.log("umzileni path", templatePath)
    const template = fs.readFileSync(templatePath, "utf-8");
    const emailBody = ejs.render(template, {
        firstName: user.firstName,
        lastName: user.lastName,
        startDate: startDate.toDateString(),
    });

    try {
        await sendEmail(user.email, "Subscription Expiry Reminder", emailBody);
        console.log(`Email sent successfully to ${user.email}`);
    } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error.message);
    }


    //await sendEmail(user.email, "Subscription Expiry Reminder", emailBody);
};

// 🔹 40-Day Subscription Check & Email Job
const fourthyDayEmail = () => {
 
        console.log("Running subscription check...");

        try {

            const today = new Date();
            const fortyDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 40);

            console.log("Checking for subscriptions that started on:", fortyDaysAgo.toISOString());

            const subscriptions = await Subscription.find({
                status: { $in: ["ACTIVE", "EXPIRED"] },
                startDate: {
                    $gte: fortyDaysAgo,
                    $lt: new Date(fortyDaysAgo.getTime() + 86400000),
                },
            }).populate("user").exec();

            console.log(" Found subscriptions:", subscriptions.length);

            if (subscriptions.length === 0) return console.log("No notifications needed.");

            for (const sub of subscriptions) {
                console.log("so lana")
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
};*/

module.exports = fourthyDayEmail;
