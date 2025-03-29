import { useNavigate } from 'react-router-dom';

export const navigateToRolePage = async (userRole, userName, navigate) => {
  const roleToPathMap = {
    vehicleOwner: '/vehicleOwnerHomePage',
    driver: '/driverHomePage',
    mechanic: '/mechanicHomePage',
    adPublisher: '/adPublisherHomePage',
    technician: '/technicianHomePage',
    admin: '/adminHomePage',
  };

  const path = roleToPathMap[userRole] || '/profile';
  navigate(path, { state: { currentUsername: userName } });
};
