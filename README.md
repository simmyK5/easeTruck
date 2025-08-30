# easeTruck

Easetruck is a fleet safety and monitoring platform that integrates hardware sensors (GPS, accelerometer, ultrasonic, microphone, magnetometer, etc.) with a cloud backend. It enables real-time detection of critical events such as puncture, glass break, aggressive braking, weapon detection, and people detection, while providing location tracking and audio evidence for improved safety.

Features
Real-time Event Detection
Puncture detection
Glass break detection
Aggressive braking alerts
Weapon detection (magnetometer)
People detection (ultrasonic sensor)
Audio Recording & Upload
Automatic recording of 5-minute clips after an event
Uploads securely to backend for review
GPS Tracking
Location tagging for every event
Live vehicle tracking
Cloud Integration
Backend services with Node.js + MongoDB (Cosmos DB on Azure currently offline)
Authentication & role-based access with Auth0
Frontend (Vue.js with Vite) for dashboards & monitoring

Tech Stack
Frontend: Vue.js (Vite), React, Material UI , Socket.IO
Backend: Node.js, Express, MongoDB (Cosmos DB)
Cloud: Azure Web Apps, Static Web Apps, PayFast for payments,Mapbox for gps,authO

Hardware: Raspberry Pi, Arduino Nano, ESP8266, GPS (NEO-6/NEO-M8N), ReSpeaker Mic Array v2.0, LSM9DS1 accelerometer, ultrasonic sensors

Project Structure
easetruck/
│── frontend/       # Vue.js + Vite dashboard
│── backend/        # Node.js + Express APIs
│── sensors/        # Raspberry Pi + Arduino (Python scripts)
│── README.md       # This file

Getting Started
Prerequisites
Node.js (v18+)
MongoDB or Azure Cosmos DB
Raspberry Pi / Arduino for sensor testing
Installation (or demo data)

Clone the repo:

git clone -b dev https://github.com/simmyK5/easeTruck.git
cd easetruck

Install backend dependencies:
cd backend
npm install
npm run dev

Install frontend dependencies:
cd frontend
npm install
npm run dev

Authentication
Easetruck uses Auth0 for user login and role-based access. Configure your .env files with your Auth0 domain, client ID, and backend secrets.

API Endpoints 
POST /backend/sensor/puncher → Uploads puncture event data
POST /backend/sensor/glass → Uploads glass break event data + audio
POST /backend/sensor/brake → Aggressive braking detection
GET /backend/notifications → Fetches real-time alerts
