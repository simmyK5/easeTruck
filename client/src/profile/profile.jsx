import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import {
  TextField,
  Radio,
  FormControl,
  FormLabel,
  FormControlLabel,
  RadioGroup,
  Button,
  FormGroup,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SubscriptionModal from '../subscription/subscription'; // Import the Subscription Modal
import { useForm, Controller } from 'react-hook-form';
import TermsAndConditions from './termsAndCondition';


export default function Profile() {
  const { user, getIdTokenClaims } = useAuth0();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    userRole: '',
    isLive: false,
  });

  const [selectedRole, setSelectedRole] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null); // New state to track selected plan
  const [openModal, setOpenModal] = useState(false); // To control modal visibility
  const [isSubscribed, setIsSubscribed] = useState(false); // Track subscription status
  const [openTandC, setOpenTandC] = useState(false);
  const [agreedToTandC, setAgreedToTandC] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null); // Track current subscription
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset
  } = useForm();

  const [subscriptionId, setSubscriptionId] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = await getIdTokenClaims();
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/auth/users/${user.email}`, {
          headers: {
            Authorization: `Bearer ${token.__raw}`,
          },
        });
        console.log('Fetched profile data:', response.data);
        setProfileData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          userRole: response.data.userRole || '',
          isLive: response.data.isLive || false,

        });
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    fetchProfileData();
  }, [getIdTokenClaims, user.email]);

  useEffect(() => {
    reset(profileData);
  }, [profileData, reset]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (name === 'userRole') {
      setSelectedRole(value);
    }
  };

  const handleOnSubmit = async () => {



    // Wait for the modal to close and ensure the user has subscribed before proceeding
    if (!isSubscribed) {
      alert('Please subscribe to a plan before saving your profile.');
      return; // Don't proceed with profile update if not subscribed
    }

    // Wait for the modal to close and ensure the user has subscribed before proceeding
    if (!agreedToTandC) {
      alert('Please agrree to terms and conditions before saving your profile.');
      return; // Don't proceed with profile update if not subscribed
    }

    try {
      const token = await getIdTokenClaims();

      // Step 1: Check if the user has an active subscription
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/auth/check-status/${user.email}`, {
        headers: {
          Authorization: `Bearer ${token.__raw}`,
        },
      });
      // Step 2: If user doesn't have a subscription, alert them to subscribe
      if (!response.data) {
        alert('Please subscribe to a plan before saving your profile.');
        return; // Don't proceed with profile update
      }

console.log("war",user.email)
console.log("war",profileData)

      // Step 3: If subscription is active, proceed to save the profile data
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/backend/auth/users/${user.email}`, profileData, {
        headers: {
          Authorization: `Bearer ${token.__raw}`,
        },
      });

      //const navigateToRolePage = async (userEmail, token) => {

      console.log("see profile", profileData.email)
      if (profileData.email, token) {
        try {
          const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/auth/user-role/${profileData.email}`, {
            headers: {
              Authorization: `Bearer ${token.__raw}`
            },
          });

          console.log("see me now")
          console.log(response.data)

          const userRole = response.data.role;
          const currentUsername = response.data.name;

          if (userRole === 'vehicleOwner') {
            navigate('/vehicleOwnerHomePage', { state: { currentUsername } });
          } else if (userRole === 'driver') {
            navigate('/driverHomePage', { state: { currentUsername } });
          } else if (userRole === 'mechanic') {
            navigate('/mechanic-home', { state: { currentUsername } });
          } else if (userRole === 'adPublisher') {
            navigate('/adPubliserHomePage', { state: { currentUsername } });
          } else {
            navigate('/profile');  // Fallback to profile if role is unrecognized
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          navigate('/profile');  // Fallback if there is an error
        }
      }




      // Redirect to home after successful profile update
      //navigate('/home');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating your profile.');
    }
  };

  const handleOpenTandC = () => {
    setOpenTandC(true);
  };

  const handleCloseTandC = () => {
    setOpenTandC(false);
  };




  const handlePlanSelection = (plan) => {
    console.log("ngwana waka", plan)
    setSelectedPlan(plan);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);

  };
  const handleSubscriptionIdUpdate = (id) => {
    setSubscriptionId(id); // Update the subscriptionId
    setProfileData((prevData) => ({
      ...prevData,
      paypalSubscriptionId: id, // Update profile data with subscriptionId
    }));
  };

  const handleCancelSubscription = async () => {
    try {
      const token = await getIdTokenClaims();
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/subscription/cancel`, { subscriptionId: profileData.paypalSubscriptionId }, {
        headers: { Authorization: `Bearer ${token.__raw}` }
      });
      setIsSubscribed(false);
      setAgreedToTandC(false);
      setCurrentSubscription(null);
      alert('Subscription cancelled successfully');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('An error occurred while canceling your subscription. Please try again.');
    }
  };


  const renderSubscriptionOptions = () => {
    const roleBasedPlans = {
      driver: [
        { title: 'Free Plan', price: 0, features: ['Feature 1', 'Feature 2'], description: 'Perfect for professional drivers, offering tools and features to enhance efficiency and productivity.', planId:import.meta.env.VITE_FREE_PLAN_SUBSCRIPTION },
        { title: 'Driver Plan', price: 29.99, features: ['Feature 1', 'Feature 2', 'Feature 3'], description: 'Perfect for professional drivers, offering tools and features to enhance efficiency and productivity.', planId: import.meta.env.VITE_DRIVER_PLAN_SUBSCRIPTION },
      ],
      vehicleOwner: [
        { title: 'Free Plan', price: 0, features: ['Feature 1', 'Feature 2'], description: 'Designed for vehicle owners, this plan includes advanced tools and features to manage your vehicle effectively.', planId: import.meta.env.VITE_FREE_PLAN_SUBSCRIPTION },
        { title: 'Vehicle Owner Plan', price: 39.99, features: ['Feature 1', 'Feature 2', 'Feature 3'], description: 'Designed for vehicle owners, this plan includes advanced tools and features to manage your vehicle effectively.', planId: import.meta.env.VITE_VEHICLE_OWNER_PLAN_SUBSCRIPTION },
      ],
      adPublisher: [
        { title: 'Free Plan', price: 0, features: ['Feature 1', 'Feature 2'], description: 'Ideal for advertisers, this plan includes advanced features to maximize visibility.', planId: import.meta.env.VITE_FREE_PLAN_SUBSCRIPTION },
        { title: 'Ad Publisher Plan', price: 39.99, features: ['Feature 1', 'Feature 2', 'Feature 3'], description: 'Ideal for advertisers, this plan includes advanced features to maximize visibility.', planId: import.meta.env.VITE_AD_PUBLISHER_PLAN_SUBSCRIPTION },
      ],
    };

    return (roleBasedPlans[selectedRole] || []).map((plan, index) => (
      <Button
        key={index}
        variant="contained"
        color="primary"
        onClick={() => handlePlanSelection(plan)} // Open modal on plan click
        disabled={isSubscribed} // Disable button if already subscribed
        data-testid={`${plan.title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        {plan.title}
      </Button>
    ));
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Create Profile</Typography>
      <form onSubmit={handleSubmit(handleOnSubmit)}>
        <FormGroup>
          <Controller
            name="firstName"
            control={control}
            defaultValue={profileData.firstName}
            rules={{ required: 'First Name is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="First Name"
                margin="normal"
                variant="outlined"
                data-testid="firstName"
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                onChange={(e) => {
                  field.onChange(e); // Update react-hook-form
                  setProfileData((prev) => ({ ...prev, firstName: e.target.value })); // Update local state
                }}
              />
            )}
          />

          <Controller
            name="lastName"
            control={control}
            defaultValue={profileData.lastName}
            rules={{ required: 'Last Name is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Last Name"
                margin="normal"
                variant="outlined"
                data-testid="lastName"
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                onChange={(e) => {
                  field.onChange(e); // Update react-hook-form
                  setProfileData((prev) => ({ ...prev, lastName: e.target.value })); // Update local state
                }}
              />
            )}
          />
          <TextField
            label="Email"
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            disabled
          />
          <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">User Role</FormLabel>
            <RadioGroup
              name="userRole"
              value={profileData.userRole}
              onChange={handleChange}
              data-testid="userRole"
            >
              {["admin", "driver", "vehicleOwner", "adPublisher"].map((role) => (
                <FormControlLabel
                  key={role}
                  value={role}
                  control={
                    <Radio
                      color="primary"
                      inputProps={{ "data-testid": role }}
                    />
                  }
                  label={role.charAt(0).toUpperCase() + role.slice(1)}
                  disabled={
                    isSubscribed ||
                    !profileData.firstName?.trim() ||
                    !profileData.lastName?.trim()
                  } // Disable if subscribed or if first/last name is empty
                />
              ))}
            </RadioGroup>
          </FormControl>


          {renderSubscriptionOptions()}

          {isSubscribed && (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCancelSubscription}
              style={{ marginTop: '16px' }}
              data-testid="cancelBtn"
            >
              Cancel Subscription
            </Button>
          )}

          <Button variant="contained" onClick={handleOpenTandC}>
            Read and Agree to Terms and Conditions
          </Button>

          <Button type="submit" variant="contained" color="primary" style={{ marginTop: '16px' }} data-testid="submitBtn" >
            Save
          </Button>
        </FormGroup>
      </form>

      {/* Subscription Modal */}
      <SubscriptionModal
        open={openModal}
        plan={selectedPlan}
        userEmail={user.email}
        onClose={handleCloseModal}
        setIsSubscribed={setIsSubscribed} // Pass the state updater
        setSubscriptionId={handleSubscriptionIdUpdate}
        profileData={profileData}
      />

      <TermsAndConditions
        open={openTandC}
        handleClose={handleCloseTandC}
        setAgreedToTandC={setAgreedToTandC}
        userEmail={user.email}

      />

    </div>
  );
}