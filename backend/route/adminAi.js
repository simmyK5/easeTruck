const express = require('express');
const path = require('path');
const AdminAi = require('../model/adminAi');
const User = require('../model/user');
const fs = require('fs');
const { v4: uuid } = require('uuid');
require('dotenv').config();
const twilio = require('twilio');

const router = express.Router(); // Just router, no use(cors()), etc here
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);
const axios = require('axios');

// ------------------------------
// ✅ 2) STATIC (OPTIONAL)
// ------------------------------
router.use('/uploadCallInfo', express.static(path.join(__dirname, 'adminCall')));

// ------------------------------
// ✅ 3) INCOMING CALL HANDLER
// ------------------------------
router.post('/incoming', (req, res) => {
    const twiml = new twilio.twiml.VoiceResponse();

    // Start recording immediately
    twiml.start().record();

    twiml.say('Thank you for calling EaseTruck!');

    const gather = twiml.gather({
        numDigits: 1,
        action: '/handle-choice',
        method: 'POST'
    });
    gather.say('Press 1 if you have a problem with the app. Press 2 to enquire about our products.');

    // If no input, fallback
    twiml.say('No input received. Goodbye!');

    res.type('text/xml').send(twiml.toString());
});

// ------------------------------
// ✅ 4) HANDLE MENU OPTION
// ------------------------------
router.post('/handle-choice', (req, res) => {
    const digit = req.body.Digits;
    const twiml = new twilio.twiml.VoiceResponse();

    if (digit === '1') {
        const gather = twiml.gather({
            input: 'speech dtmf',
            action: '/get-caller-info?reason=support',
            method: 'POST'
        });
        gather.say('You chose problems with the app. Please say or enter your full name, surname, and phone number.');
    } else if (digit === '2') {
        const gather = twiml.gather({
            input: 'speech dtmf',
            action: '/get-caller-info?reason=enquiry',
            method: 'POST'
        });
        gather.say('You chose to enquire about our products. Please say or enter your full name, surname, and phone number.');
    } else {
        twiml.say('Invalid option. Goodbye!');
    }

    res.type('text/xml').send(twiml.toString());
});

// ------------------------------
// ✅ 5) COLLECT CALLER INFO
// ------------------------------
// =======================
// ✅ Multi-step Q&A flow
// =======================

router.post('/get-caller-info', (req, res) => {
    const reason = req.query.reason;
    const step = parseInt(req.query.step) || 1;
    const previousAnswers = req.query.answers ? JSON.parse(req.query.answers) : [];

    const userInput = req.body.SpeechResult || req.body.Digits || '';
    if (step > 1) {
        previousAnswers.push(userInput);
    }

    const twiml = new twilio.twiml.VoiceResponse();

    // === PROBLEMS WITH APP ===
    if (reason === 'support') {
        switch (step) {
            case 1:
                twiml.say('You chose option one which is problems with the app.');
                twiml.gather({
                    input: 'speech',
                    action: `/get-caller-info?reason=support&step=2&answers=${encodeURIComponent(JSON.stringify(previousAnswers))}`,
                    method: 'POST'
                }).say('Could you please describe the problem you are experiencing?');
                break;

            case 2:
                twiml.gather({
                    input: 'speech',
                    action: `/get-caller-info?reason=support&step=3&answers=${encodeURIComponent(JSON.stringify(previousAnswers))}`,
                    method: 'POST'
                }).say('When did this issue start happening?');
                break;

            case 3:
                twiml.gather({
                    input: 'speech',
                    action: `/get-caller-info?reason=support&step=4&answers=${encodeURIComponent(JSON.stringify(previousAnswers))}`,
                    method: 'POST'
                }).say('Were there any changes made recently to your subscription, driver or device?');
                break;

            case 4:
                twiml.gather({
                    input: 'speech',
                    action: `/get-caller-info?reason=support&step=5&answers=${encodeURIComponent(JSON.stringify(previousAnswers))}`,
                    method: 'POST'
                }).say('What exactly are you trying to do, and what happens instead?');
                break;

            case 5:
                twiml.gather({
                    input: 'speech',
                    action: `/get-caller-info?reason=support&step=6&answers=${encodeURIComponent(JSON.stringify(previousAnswers))}`,
                    method: 'POST'
                }).say('Have you tried restarting your device?');
                break;

            case 6:
                twiml.gather({
                    input: 'speech',
                    action: `/get-caller-info?reason=support&step=7&answers=${encodeURIComponent(JSON.stringify(previousAnswers))}`,
                    method: 'POST'
                }).say('Can you check your internet connection? Are other websites loading?');
                break;

            case 7:
                twiml.gather({
                    input: 'speech',
                    action: `/get-caller-info?reason=support&step=8&answers=${encodeURIComponent(JSON.stringify(previousAnswers))}`,
                    method: 'POST'
                }).say('Could you try accessing it from a different browser or device to see if the issue persists?');
                break;

            case 8:
                twiml.gather({
                    input: 'speech',
                    action: `/get-caller-info?reason=support&step=9&answers=${encodeURIComponent(JSON.stringify(previousAnswers))}`,
                    method: 'POST'
                }).say('Can you go step by step and tell me what you did starting from when you logged in?');
                break;

            default:
                // Final: thank you + record issue summary
                twiml.say('Great! Our support team will look into the issue and if there are any details missing, they will reach out.');
                twiml.say('Is there anything else I can help you with today?');
                twiml.record({
                    action: `/uploadCall?reason=support&callerInfo=${encodeURIComponent(JSON.stringify(previousAnswers))}`,
                    maxLength: 300
                });
                break;
        }

        // === ENQUIRY FLOW ===
    } else if (reason === 'enquiry') {
        if (step === 1) {
            twiml.say('You chose to enquire about our products.');
            twiml.say('Our product is a tracking live stream device that improves vehicle security and monitors drivers.');
            twiml.say('We also offer a platform for selling your trucks, heads and trailers for easy marketing.');
            twiml.say('For more information, please visit easetruck.co.za.');
            const gather = twiml.gather({
                numDigits: 1,
                action: `/get-caller-info?reason=enquiry&step=2&answers=${encodeURIComponent(JSON.stringify(previousAnswers))}`,
                method: 'POST'
            });
            gather.say('Please listen closely to the options to direct your call.');
            gather.say('Press 1 for more details about subscription, Press 2 for more details about installments and payment.');

        } else if (step === 2) {
            const digit = req.body.Digits;
            previousAnswers.push(digit);

            if (digit === '1') {
                // Subscription path
                twiml.say('We have 3 different subscriptions: vehicle owner subscription with more features, driver subscription, and ad publisher subscription.');
                twiml.say('A consultant will call you back. For more information visit easetruck.co.za.');
                const gather = twiml.gather({
                    input: 'speech',
                    action: `/get-caller-info?reason=enquiry&step=3&answers=${encodeURIComponent(JSON.stringify(previousAnswers))}`,
                    method: 'POST'
                });
                gather.say('What exactly would you like to know?');
            } else if (digit === '2') {
                // Installments path
                twiml.say('We have 2 different installment plans. One option is to pay for the devices fully and then pay a very low monthly subscription.');
                twiml.say('The second option is to pay the device and monthly installment as one package.');
                twiml.say('For more information visit easetruck.co.za.');
                const gather = twiml.gather({
                    input: 'speech',
                    action: `/get-caller-info?reason=enquiry&step=3&answers=${encodeURIComponent(JSON.stringify(previousAnswers))}`,
                    method: 'POST'
                });
                gather.say('What exactly would you like to know?');
            } else {
                twiml.say('Invalid option. Goodbye!');
            }
        } else {
            // Final for enquiry
            twiml.say('Great! A consultant will reach out to you ASAP. Is there anything else I can help you with today?');
            twiml.record({
                action: `/uploadCall?reason=enquiry&callerInfo=${encodeURIComponent(JSON.stringify(previousAnswers))}`,
                maxLength: 300
            });
        }
    }

    res.type('text/xml').send(twiml.toString());
});


// ------------------------------
// ✅ 6) FINAL SAVE + AI SUMMARY
// ------------------------------
router.post('/uploadCall', async (req, res) => {
    const recordingUrl = req.body.RecordingUrl;
    const reason = req.query.reason;
    const callerInfo = req.query.callerInfo || '';

    // Example: generate summary (mocked)
    const callSummary = await getSummary(recordingUrl);

    // Parse caller input
    const [customerName, customerSurname, customerNo] = callerInfo.split(' ');

    // Save to DB (replace AdminAi with your DB model)
    const adminAi = new AdminAi({
        reason,
        customerName: customerName || '',
        customerSurname: customerSurname || '',
        customerNo: customerNo || '',
        recordUrl: recordingUrl,
        callSummary,
        isClosed: false
    });
    await adminAi.save();

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Thank you. Goodbye!');

    res.type('text/xml').send(twiml.toString());
});

// ------------------------------
// ✅ 7) MOCK AI SUMMARY
// ------------------------------
async function getSummary(url) {
    return `This is a summary for: ${url}`;
}

router.put("/updateAdmin", async (req, res) => {

    console.log('Request Body:', req.body);
    const { userId, callId } = req.query;

    try {
        const updatedItem = await AdminAi.findByIdAndUpdate(callId, { $set: { consultant: userId } }, { new: true });
        res.json(updatedItem);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/getLeadInfo", async (req, res) => {
    try {
        const leadInfo = await AdminAi.find({ reason: "enquiry", isMoved: false })
        console.log("working hard", leadInfo)

        return res.status(200).json(leadInfo);
    } catch (err) {
        console.error("Error fetching lead Information:", err);
        res.status(500).json({ message: err.message });
    }
});

router.get("/getSupport", async (req, res) => {
    try {
        const support = await AdminAi.find({ reason: "support", isClosed: false })
        console.log("working hard", support)
        return res.status(200).json(support);
    } catch (err) {
        console.error("Error fetching support information:", err);
        res.status(500).json({ message: err.message });
    }
});

router.put("/updateIsMoved", async (req, res) => {
    const { id, isMoved } = req.body;
    await AdminAi.findByIdAndUpdate(id, { isMoved });
    res.json({ success: true });
});


router.post('/exportToHubSpot', async (req, res) => {
    const { rows,exportedBy } = req.body;

    try {
        for (const row of rows) {
            console.log("woza baba one", row)
            const hubRes = await axios.post(
                'https://api.hubapi.com/crm/v3/objects/contacts',
                {
                    "properties": {
                        "firstname": row.customerName || '',
                        "lastname": row.customerSurname || '',
                        "phone": row.customerNo || '',
                    }

                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Update isMoved in your DB
            await AdminAi.findByIdAndUpdate(row._id, {
                isMoved: true,
                exportedBy: exportedBy,
                exportedWhen: new Date(),
            });
        }

        res.json({ success: true, message: 'All rows exported and updated.' });
    } catch (err) {
        console.error(err.response?.data || err);
        res.status(500).json({ error: 'Export failed.' });
    }
});


/*
router.post('/exportToHubSpot', async (req, res) => {
    const { rows, exportedBy } = req.body;

    try {
        for (const row of rows) {
             console.log("woza baba one",row)
            const hubRes = await axios.post(
                'https://api.hubapi.com/crm/v3/objects/contacts',
                {
                    properties: {
                        firstname: row.customerName || '',
                        lastname: row.customerSurname || '',
                        phone: row.customerNo || '',
                    },
                    
  "properties": {
    "email": "example@hubspot.com",
    "firstname": "Jane",
    "lastname": "Doe",
    "phone": "+18884827768",
    "company": "HubSpot",
    "website": "hubspot.com",
    "lifecyclestage": "marketingqualifiedlead"
  }

                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Update isMoved in your DB
            await AdminAi.findByIdAndUpdate(row._id, {
                isMoved: true,
                exportedBy,
                exportedWhen: new Date(),
            });
        }

        res.json({ success: true, message: 'All rows exported and updated.' });
    } catch (err) {
        console.error(err.response?.data || err);
        res.status(500).json({ error: 'Export failed.' });
    }
});*/


module.exports = router;
