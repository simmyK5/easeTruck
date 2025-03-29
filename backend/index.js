const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./route/user");
const taskRoute = require("./route/task");
const authRoute = require("./route/auth");
const truckRoute = require("./route/truck");
const adRoute = require("./route/ad");
const adSubscription = require("./route/subscription");
const installation = require("./route/installation");
const messageRoute = require("./route/message");
const voucher = require("./route/voucher");
const dashboard = require("./route/dashboard");
const notification = require("./route/notification");
const recentActivity = require("./route/recentActivity");
const feedback = require("./route/feedback");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const socketHandler = require("./socket/socketHandler");
const cors = require("cors");
const scheduleVoucherGeneration = require("./serivces/scheduleVoucherGeneration");
const voucherNotification = require("./serivces/voucherNotification");
const emailTrail = require("./route/emailTrail");
const subscriptionDetails = require("./serivces/subscriptionDetails");
const fourthyDayEmail = require("./serivces/fourthyDayEmail");
const yearlyEmail = require("./serivces/yearlyEmail");
require("dotenv").config();


dotenv.config();

app.use(helmet());


// Add X-Frame-Options header to prevent clickjacking
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // or 'DENY'
  next();
});

// Example CSP headers to restrict loading of resources
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "*"],
    styleSrc: ["'self'", "'unsafe-inline'", "*"],
    imgSrc: ["'self'", "data:", "*"],
    connectSrc: ["'self'", "https://api.emailjs.com", "https://easetruckbackend-emfbc9dje7hdargb.southafricanorth-01.azurewebsites.net", "ws://easetruckbackend-emfbc9dje7hdargb.southafricanorth-01.azurewebsites.net","https://mango-stone-06f8be210.6.azurestaticapps.net", "https://dev-28osh5shw2xy15j3.us.auth0.com"],
    fontSrc: ["'self'", "*"],
    objectSrc: ["'none'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: [],
    frameAncestors: ["'self'"], // This must be set on the server-side, not in the meta tag
  },
}));


// Configure CORS to allow only specific origins
const allowedOrigins = ["https://mango-stone-06f8be210.6.azurestaticapps.net"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Cache-Control', // Add Cache-Control here
  })
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin:"https://mango-stone-06f8be210.6.azurestaticapps.net",
    methods: ["GET", "POST"],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
    transports: ["websocket", "polling"],
    path: "/socket.io",
  },
});

app.use(cors());
app.use(express.json());

socketHandler(io);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("message", (data) => {
    console.log("Message received:", data);
    // Broadcast the message to other clients
    socket.broadcast.emit("message", data);
  });
});

/*try {
  mongoose.connect(process.env.MONGO_URL);
  console.log("MongoDB connected");
} catch (err) {
  console.error(err.message);
}*/

async function connectMongoDB() {
  try {
    await mongoose.connect("mongodb+srv://simphiweadmin:FJFG585dfhd@easetruckdb.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000");
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
  }
}
/*
async function connectMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
  }
}*/

connectMongoDB();

/*mongoose.connect(process.env.MONGO_URI, {
  ssl: true, // Ensure SSL is enabled
})
.then(() => console.log("Connected to Azure Cosmos DB"))
.catch(err => console.error("MongoDB connection error:", err));*/

/*mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  tls: true,  // Use TLS instead of SSL
  tlsAllowInvalidCertificates: false, // Ensures only valid certificates are allowed
})
.then(() => console.log("Connected to Azure Cosmos DB"))
.catch(err => console.error("MongoDB connection error:", err));
*/

// Middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use((req, res, next) => {
  // Block metadata request to AWS
  if (req.url.startsWith("/latest/meta-data/")) {
    return res.status(403).send("Access to metadata is denied");
  }

  next();
});

app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');  // Prevent the page from being embedded in any iframe
  next();
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

app.use("/uploads", express.static(path.join(__dirname, "route/uploads")));

app.use("/backend/user", userRoute);
app.use("/backend/auth", authRoute);
app.use("/backend/task", taskRoute);
app.use("/backend/truck", truckRoute);
app.use("/backend/ad", adRoute);
app.use("/backend/subscription", adSubscription);
app.use("/backend/installation", installation);
app.use("/backend/message", messageRoute);
app.use("/backend/voucher", voucher);
app.use("/backend/dashboard", dashboard);
app.use("/backend/recentActivity", recentActivity);
app.use("/backend/notification", notification);
app.use("/backend/feedback", feedback);
app.use("/backend/email", emailTrail);

// Handle React routing, return all requests to React app
/*app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});*/ 



scheduleVoucherGeneration();
voucherNotification();
subscriptionDetails();
fourthyDayEmail();
yearlyEmail();

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

