import React, { useEffect, useState } from 'react';
import { useAuthContext } from './authProvider'; // adjust path if needed
import { adminNotification ,dismissCurrentNotification} from './services/socketService'; // adjust path

const NotificationProvider = ({ children }) => {
  const { authState } = useAuthContext();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState(null);

  useEffect(() => {
    console.log("amjuda",authState?.role)
    if (authState?.role === 'admin' || authState?.role === 'superAdmin') {
        console.log("manje")
      adminNotification(authState.role, (message) => {
        setNotificationData(message);
        setShowNotification(true);
      });
    }
  }, [authState?.role]);

/*
  useEffect(() => {
    if (
      (authState.role === 'admin' || authState.role === 'superAdmin') &&
      !isRegisteredRef.current
    ) {
      isRegisteredRef.current = true;

      adminNotification(authState.role, (message) => {
        setNotificationData(message);
        setShowNotification(true);
      });
    }
  }, [authState.role]);*/

  const handleClose = () => {
    setShowNotification(false);
    setNotificationData(null);
    dismissCurrentNotification();
  };

  return (
    <>
      {children}
      {showNotification && notificationData && (
        <div style={popupStyle}>
          <div style={popupContentStyle}>
            <h4>{notificationData.title}</h4>
            <p>{notificationData.message}</p>
            <button onClick={handleClose}>Dismiss</button>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationProvider;

// Simple styling
const popupStyle = {
  position: 'fixed',
  top: 20,
  right: 20,
  zIndex: 9999,
  backgroundColor: 'white',
  border: '1px solid #ccc',
  borderRadius: '10px',
  padding: '10px',
  boxShadow: '0px 0px 10px rgba(0,0,0,0.2)',
};

const popupContentStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};
