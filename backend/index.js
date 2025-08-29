const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fileUpload = require("express-fileupload"); 

// Routes
const userRoute = require("./route/user");
const taskRoute = require("./route/task");
const authRoute = require("./route/auth");
const truckRoute = require("./route/truck");
const adRoute = require("./route/ad");
const subscription = require("./route/subscription");
const installation = require("./route/installation");
const messageRoute = require("./route/message");
const voucher = require("./route/voucher");
const dashboard = require("./route/dashboard");
const notification = require("./route/notification");
const recentActivity = require("./route/recentActivity");
const feedback = require("./route/feedback");
const noteRoute = require("./route/note");
const sensorRoute = require("./route/sensor");
const emailTrail = require("./route/emailTrail");
const claimVoucher = require("./route/claimVoucher");
const adminAi = require("./route/adminAi");

// Services
const socketHandler = require("./socket/socketHandler");
const scheduleVoucherGeneration = require("./services/scheduleVoucherGeneration");
const voucherNotification = require("./services/voucherNotification");
const subscriptionDetails = require("./services/subscriptionDetails");
const fourthyDayEmail = require("./services/fourthyDayEmail");
const yearlyEmail = require("./services/yearlyEmail");
// const mileageNotifcation = require("./serivces/mileageNotifcation");

dotenv.config();

// Middleware Setup
app.use(helmet());

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "*"],
    styleSrc: ["'self'", "'unsafe-inline'", "*"],
    imgSrc: ["'self'", "data:", "https://www.paypalobjects.com", "*"],
    connectSrc: ["'self'", "https://api.emailjs.com", "http://localhost:8800", "http://localhost:3000", "ws://localhost:8800", "https://dev-28osh5shw2xy15j3.us.auth0.com"],
    fontSrc: ["'self'", "*"],
    objectSrc: ["'none'"],
    formAction: ["'self'", "https://sandbox.payfast.co.za"],
    frameAncestors: ["'self'", "http://localhost:3000"],
    upgradeInsecureRequests: [],
  },
}));

app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
}));

app.use(express.json());      // body parser for JSON
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({          // file upload middleware
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
}));

app.use(morgan("common"));

// Static Files
app.use("/uploadFile", express.static(path.join(__dirname, "uploads")));
app.use("/uploadCallInfo", express.static(path.join(__dirname, "adminCall")));
app.use('/uploadFile/uploads', express.static(path.join(__dirname, 'route', 'uploads')));
app.use("/uploadSensor", express.static(path.join(__dirname, "uploads")));

// Protect AWS Metadata
app.use((req, res, next) => {
  if (req.url.startsWith("/latest/meta-data/")) {
    return res.status(403).send("Access to metadata is denied");
  }
  next();
});

// MongoDB Connection
try {
  mongoose.connect(process.env.MONGO_URL);
  console.log("MongoDB connected");
} catch (err) {
  console.error(err.message);
}

// Socket.io Setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  },
});

app.set('io', io);
socketHandler(io);

// Routes
app.use("/backend/user", userRoute);
app.use("/backend/auth", authRoute);
app.use("/backend/task", taskRoute);
app.use("/backend/truck", truckRoute);
app.use("/backend/ad", adRoute);
app.use("/backend/subscription", subscription);
app.use("/backend/installation", installation);
app.use("/backend/message", messageRoute);
app.use("/backend/voucher", voucher);
app.use("/backend/dashboard", dashboard);
app.use("/backend/notification", notification);
app.use("/backend/recentActivity", recentActivity);
app.use("/backend/feedback", feedback);
app.use("/backend/email", emailTrail);
app.use("/backend/note", noteRoute);
app.use("/backend/sensor", sensorRoute);
app.use("/backend/claimVoucher", claimVoucher);
app.use("/backend/adminAi", adminAi);

app.post('/uploadSensor', async (req, res) => {
  if (!req.files || !req.files.voice) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const uploadedFile = req.files.voice;
    const timestamp = Date.now();
    const fileName = `${uploadedFile.name}`; 
    const uploadPath = path.join(__dirname, 'uploads', fileName);

    await uploadedFile.mv(uploadPath);

    res.send(`File uploaded successfully as ${fileName}`);
  } catch (error) {
    res.status(500).send('Error during file upload.');
  }
});

// Background services
scheduleVoucherGeneration();
voucherNotification();
subscriptionDetails();
fourthyDayEmail();
yearlyEmail();
// mileageNotifcation();

// Start Server
server.listen(8800, () => {
  console.log("Backend server is running on http://localhost:8800");
});
