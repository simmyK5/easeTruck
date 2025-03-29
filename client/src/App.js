import React, {  useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Route, Routes,useLocation } from 'react-router-dom';
import Layout from './layout.jsx';
import Login from './Login/login.jsx';
import Profile from './profile/profile.jsx';
import DriverList from './Driver/driverList.jsx';
import DriverPool from './Driver/driverPool.jsx';
import TaskList from './Task/task.jsx';
import DriverTask from './Task/driverTask.jsx';
import CreateAd from './Ad/createAd.jsx';
import Ad from './Ad/ad.jsx';
import AdList from './Ad/adList.jsx';
import Subscription from './subscription/subscription.jsx';
import Installation from './installation/installation.jsx';
import InstPayPal from './installation/instPayPal.jsx';
import Chat from './chat/chat.jsx';
import ChatPage from './chat/chatPage.jsx';
import ChatWindow from './chat/chatWindow.jsx';
import ChatList from './chat/chatPage.jsx';
import MapWithSearch from './Map/mapWithSearch.jsx';
import VehicleOwnerMap from './Map/vehicleOwnerMap.jsx';
import Mechanic from './mechanic/mechanic.jsx';
import TruckList from './Truck/truckList.jsx';
import Voucher from './voucher/voucher.jsx';
import Dashboard from './Dashboard/dashboard.jsx';
import EditProfile from './profile/editProfile.jsx';
import AdminInstallation from './installation/adminInstallation.jsx';
import Technician from './technician/technician.jsx';
import VehicleOwnerHomePage from './Home/vehicleOwnerHomePage.jsx';
import { AuthProvider } from "./authProvider.js";
import NotificationAlert from "./notification/notificationAlert.jsx";
import AllNotifications from "./notification/allNotifications.jsx";
import DriverHomePage from "./Home/driverHomePage.jsx";
import MechanicHomePage from "./Home/mechanicHomePage.jsx";
import TechnicianHomePage from "./Home/technicianHomePage.jsx";
import AdPublisherHomePage from "./Home/adPubliserHomePage.jsx";
import AdminHomePage from "./Home/adminHomePage.jsx";
import AdminFeedback from "./feedback/adminFeedback.jsx";
import AdminDashboard from "./Dashboard/adminDashboard.jsx";
import AdminAd from "./Ad/adminAd.jsx";
import AdDashboard from "./Dashboard/adDashboard.jsx";
import Feedback from "./feedback/feedback.jsx";
import TechnicianInstallation from "./installation/technicianInstallation.jsx";
import BreakDownList from "./mechanic/breakDownList.jsx";

import { Helmet } from 'react-helmet-async';
import AdminList from "./Admin/adminList.jsx";
import ProtectedRoute from "./protectedRoute.js";
import TermsAndConditonsContent from "./profile/termsAndConditonsContent.jsx";
import AllServiceSummary from "./recentActivity/allServiceSummary.jsx";
import AboutUs from "./About/aboutUs.jsx";
import HowItWorks from "./About/howItWorks.jsx";


const App = () => {
  const { isAuthenticated } = useAuth0();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && location.pathname === '/' && !sessionStorage.getItem('pageReloaded')) {
      sessionStorage.setItem('pageReloaded', 'true');
      window.location.reload(); // This will reload the page once
    }
  }, [location, isAuthenticated]);


  /*useEffect(() => {
    // Only reload once when the user navigates to the homepage after login
    if (isAuthenticated && location.pathname === '/' && !sessionStorage.getItem('pageReloaded')) {
      sessionStorage.setItem('pageReloaded', 'true');
      window.location.href = '/'; // Redirect to the homepage (this avoids infinite reload loop)
    }
  }, [location, isAuthenticated]);*/

  return (
    <AuthProvider>
      <Helmet>
        <meta
          httpEquiv="Content-Security-Policy"
          content="
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com https://dev-28osh5shw2xy15j3.us.auth0.com https://cdn.jsdelivr.net https://unpkg.com https://www.paypal.com https://www.sandbox.paypal.com https://www.paypalobjects.com https://www.paypal.com/sdk/js;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
      img-src 'self' data: *;
      connect-src 'self' https://api.emailjs.com https://easetruckbackend-emfbc9dje7hdargb.uaenorth-01.azurewebsites.net wss://easetruckbackend-emfbc9dje7hdargb.uaenorth-01.azurewebsites.net https://dev-28osh5shw2xy15j3.us.auth0.com https://www.paypal.com https://www.sandbox.paypal.com https://api.paypal.com https://api.sandbox.paypal.com https://api.sightengine.com/1.0/check.json;
      font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net;
      object-src 'none';
      form-action 'self';
      upgrade-insecure-requests;
      frame-ancestors 'self';
      frame-src 'self' https://dev-28osh5shw2xy15j3.us.auth0.com https://www.paypal.com https://www.sandbox.paypal.com https://www.paypalobjects.com;
      child-src 'self' https://dev-28osh5shw2xy15j3.us.auth0.com;
    "
        />
      </Helmet>

      <Layout>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/adminDashboard" element={<ProtectedRoute element={AdminDashboard} requiredRole="admin" />} />
          <Route path="/adDashboard" element={<ProtectedRoute element={AdDashboard} requiredRole="admin,vehicleOwner,driver,adPublisher" />} />
          <Route path="/technician" element={<ProtectedRoute element={Technician} requiredRole="admin,technician" />} />
          <Route path="/adminAd" element={<ProtectedRoute element={AdminAd} requiredRole="admin" />} />
          <Route path="/driverList" element={<ProtectedRoute element={DriverList} requiredRole="vehicleOwner" />} />
          <Route path="/driverPool" element={<ProtectedRoute element={DriverPool} requiredRole="vehicleOwner" />} />
          <Route path="/task" element={<ProtectedRoute element={TaskList} requiredRole="vehicleOwner,driver" />} />
          <Route path="/driveTask" element={<ProtectedRoute element={DriverTask} requiredRole="driver" />} />
          <Route path="/createAd" element={<ProtectedRoute element={CreateAd} requiredRole="vehicleOwner,driver,adPublisher" />} />
          <Route path="/ad" element={<ProtectedRoute element={Ad} requiredRole="admin,vehicleOwner,driver,adPublisher,technician,mechanic" />} />
          <Route path="/adList" element={<ProtectedRoute element={AdList} requiredRole="admin,vehicleOwner,driver,adPublisher,technician,mechanic" />} />
          <Route path="/subscription" element={<ProtectedRoute element={Subscription} requiredRole="vehicleOwner,driver,adPublisher" />} />
          <Route path="/installation" element={<ProtectedRoute element={Installation} requiredRole="vehicleOwner,driver,adPublisher" />} />
          <Route path="/instPayPal" element={<ProtectedRoute element={InstPayPal} requiredRole="vehicleOwner,driver,adPublisher" />} />
          <Route path="/chat" element={<ProtectedRoute element={Chat} requiredRole="vehicleOwner,driver,mechanic" />} />
          <Route path="/chatPage" element={<ProtectedRoute element={ChatPage} requiredRole="vehicleOwner,driver,mechanic" />} />
          <Route path="/chatWindow" element={<ProtectedRoute element={ChatWindow} requiredRole="vehicleOwner,driver,mechanic" />} />
          <Route path="/chatList" element={<ProtectedRoute element={ChatList} requiredRole="vehicleOwner,driver,mechanic" />} />
          <Route path="/driverMap" element={<ProtectedRoute element={MapWithSearch} requiredRole="driver" />} />
          <Route path="/vehicleOwnerMap" element={<ProtectedRoute element={VehicleOwnerMap} requiredRole="vehicleOwner" />} />
          <Route path="/mechanic" element={<ProtectedRoute element={Mechanic} requiredRole="mechanic,vehicleOwner,driver" />} />
          <Route path="/truck" element={<ProtectedRoute element={TruckList} requiredRole="vehicleOwner" />} />
          <Route path="/voucher" element={<ProtectedRoute element={Voucher} requiredRole="vehicleOwner" />} />
          <Route path="/dashboard" element={<ProtectedRoute element={Dashboard} requiredRole="admin,vehicleOwner,driver,adPublisher" />} />
          <Route path="/editProfile" element={<ProtectedRoute element={EditProfile} requiredRole="admin,vehicleOwner,driver,adPublisher,technician,mechanic" />} />
          <Route path="/adminInstallation" element={<ProtectedRoute element={AdminInstallation} requiredRole="admin" />} />
          <Route path="/admin" element={<ProtectedRoute element={AdminList} requiredRole="admin,vehicleOwner,driver,adPublisher,technician,mechanic" />} />
          <Route path="/vehicleOwnerHomePage" element={<ProtectedRoute element={VehicleOwnerHomePage} requiredRole="vehicleOwner" />} />
          <Route path="/driverHomePage" element={<ProtectedRoute element={DriverHomePage} requiredRole="driver" />} />
          <Route path="/adPublisherHomePage" element={<ProtectedRoute element={AdPublisherHomePage} requiredRole="adPublisher" />} />
          <Route path="/mechanicHomePage" element={<ProtectedRoute element={MechanicHomePage} requiredRole="mechanic" />} />
          <Route path="/technicianHomePage" element={<ProtectedRoute element={TechnicianHomePage} requiredRole="technician" />} />
          <Route path="/adminHomePage" element={<ProtectedRoute element={AdminHomePage} requiredRole="admin" />} />
          <Route path="/notificationAlert" element={<ProtectedRoute element={NotificationAlert} requiredRole="vehicleOwner,driver" />} />
          <Route path="/allNotifications" element={<ProtectedRoute element={AllNotifications} requiredRole="vehicleOwner,driver" />} />
          <Route path="/adminFeedback" element={<ProtectedRoute element={AdminFeedback} requiredRole="admin" />} />
          <Route path="/feedback" element={<ProtectedRoute element={Feedback} requiredRole="admin,vehicleOwner,driver,adPublisher,technician,mechanic" />} />
          <Route path="/technicianInstallation" element={<ProtectedRoute element={TechnicianInstallation} requiredRole="technician" />} />
          <Route path="/breakDownList" element={<ProtectedRoute element={BreakDownList} requiredRole="vehicleOwner,mechanic" />} />
          <Route path="/adminList" element={<ProtectedRoute element={AdminList} requiredRole="admin" />} />
          <Route path="/termAndCondtionContent" element={<ProtectedRoute element={TermsAndConditonsContent} requiredRole="admin,vehicleOwner,driver,adPublisher,technician,mechanic" />} />
          <Route path="/allServiceSummary" element={<ProtectedRoute element={AllServiceSummary} requiredRole="vehicleOwner" />} />
          <Route path="/aboutUs" element={<ProtectedRoute element={AboutUs} requiredRole="*" />} />
          <Route path="/howItWorks" element={<ProtectedRoute element={HowItWorks} requiredRole="*" />} />

        </Routes>
      </Layout>
    </AuthProvider>
  );


};

export default App;
