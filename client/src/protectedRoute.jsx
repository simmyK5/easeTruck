import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ element: Element, requiredRole, ...rest }) => {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async (userEmail) => {
      try {
        const token = await getAccessTokenSilently();
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/auth/check-status/${userEmail}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { role, subscriptionStatus, subscriptionId } = response.data;
        setUserRole(role);
        console.log("see subscription", subscriptionStatus);
        console.log("see role", role);
        console.log("see subscriptionId", subscriptionId);

        if (subscriptionStatus === "ACTIVE" || (subscriptionId === "No active subscription" && ["technician", "mechanic", "admin"].includes(role))) {
          console.log("see role", role);
        } else{
          navigate('/profile');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };
    console.log(isAuthenticated)
    console.log("why pay ikets",requiredRole)
    if (requiredRole === '*') {
      // Allow public access
      setLoading(false);
      return;
    }
    if (isAuthenticated && user) {
      checkUserRole(user.email);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, getAccessTokenSilently, navigate,requiredRole]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (requiredRole === '*') {
    return <Element {...rest} />;
  }

  if (!isAuthenticated || !userRole) {
    return <Navigate to="/" />;
  }
  

 

  const allowedRoles = requiredRole.split(',').map(role => role.trim());
  return allowedRoles.includes(userRole) ? (
    <Element {...rest} />
  ) : (
    <Navigate to="/" />
  );
};

export default ProtectedRoute;



/*import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ element: Element, requiredRole, ...rest }) => {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async (userEmail) => {
      try {
        const token = await getAccessTokenSilently();
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/auth/check-status/${userEmail}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { role, subscriptionStatus, subscriptionId } = response.data;
        setUserRole(role);
        console.log("see subscription", subscriptionStatus);

        if (subscriptionStatus === "ACTIVE" || (subscriptionId === "No active subscription" && ["technician", "mechanic", "admin"].includes(role))) {
          console.log("see role", role);
        } else {
          navigate('/profile');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user) {
      checkUserRole(user.email);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, getAccessTokenSilently, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !userRole) {
    return <Navigate to="/" />;
  }

  const allowedRoles = requiredRole.split(',').map(role => role.trim());
  return allowedRoles.includes(userRole) ? (
    <Element {...rest} />
  ) : (
    <Navigate to="/" />
  );
};

export default ProtectedRoute;
*/