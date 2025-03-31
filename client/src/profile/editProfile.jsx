import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import {
  TextField,
  Checkbox,
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
import { useForm, Controller } from 'react-hook-form';
import SubscriptionModal from '../subscription/subscription'; // Import the Subscription Modal
import TermsAndConditions from './termsAndCondition';




export default function EditProfile() {
  const { user, getIdTokenClaims, getAccessTokenSilently, logout } = useAuth0();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    userRole: '',
    isLive: false,
  });
  const [loading, setLoading] = useState(true);  // Loading state for fetching data
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const navigate = useNavigate();
  const [openTandC, setOpenTandC] = useState(false);
  const [agreedToTandC, setAgreedToTandC] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState(null);

  const { control, handleSubmit, formState: { errors }, watch } = useForm();

  const formValues = watch();  // Watch the form values for changes

  // Check if any value has changed by comparing with the initial profile data
  const isChanged = JSON.stringify(formValues) !== JSON.stringify(profileData);
  const isEmailChanged = JSON.stringify(formValues.email) !== JSON.stringify(profileData.email);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const token = await getIdTokenClaims();

        // Fetch profile data
        const profileResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/backend/auth/users/${user.email}`,
          {
            headers: {
              Authorization: `Bearer ${token.__raw}`,
            },
          }
        );
        console.log("see backend data", profileResponse.data.paypalSubscriptionId)
        setProfileData(profileResponse.data);
        setSelectedRole(profileResponse.data.userRole);

        // Fetch subscription details
        const subscriptionResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/backend/auth/check-status/${user.email}`,
          {
            headers: {
              Authorization: `Bearer ${token.__raw}`,
            },
          }
        );

        if (subscriptionResponse?.data) {
          setIsSubscribed(true);
          setCurrentSubscription(subscriptionResponse.data.paypalSubscriptionId); // Save subscriptionId
        }
      } catch (error) {
        console.error('Error fetching profile or subscription data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [getIdTokenClaims, user.email]);


  const onSubmit = async (data) => {
    if (!isSubscribed) {
      alert('Please subscribe to a plan before saving your profile.');
      return;
    }
    console.log("what data are we submitting", data)

    if (!agreedToTandC) {
      alert('Please agrree to terms and conditions before saving your profile.');
      return; // Don't proceed with profile update if not subscribed
    }

    const token = await getIdTokenClaims();
    const accessToken = await getAccessTokenSilently({
      audience: `https://${import.meta.env.AUTH0_DOMAIN}/api/v2/`, // Auth0 API v2 audience
      scope: "update:users", // Ensure you request the required scopes
    })

    if (isChanged) {
      console.log("console one change")

      if (isEmailChanged) {
        console.log("rush hour", data.email)
        console.log("rush hour", accessToken)
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/backend/auth/updateAutho`,
          {
            email: data.email,
            userId: user.sub,  // Ensure your backend expects "userId"
          },
          {
            headers: {
              Authorization: `Bearer ${token.__raw}`,
            },
          }
        );
        logout();

      }
      console.log("console two change")

      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/backend/auth/users/${user.email}`, data, {
        headers: {
          Authorization: `Bearer ${token.__raw}`,
        },
      });


    }

    if (data.email) {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/auth/user-role/${data.email}`, {
          headers: {
            Authorization: `Bearer ${token.__raw}`,
          },
        });

        const userRole = response.data.role;
        const currentUsername = response.data.name;

        if (userRole === 'vehicleOwner') {
          navigate('/vehicleOwnerHomePage', { state: { currentUsername } });
        } else if (userRole === 'driver') {
          navigate('/driverHomePage', { state: { currentUsername } });
        } else if (userRole === 'mechanic') {
          navigate('/mechanic-home', { state: { currentUsername } });
        } else {
          navigate('/profile');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        navigate('/profile');
      }
    }
  };




  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(`Field Changed: ${name}, New Value: ${type === 'checkbox' ? checked : value}`);
    setProfileData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (name === 'userRole') {
      setSelectedRole(value);
    }
  };

  useEffect(() => {
    console.log("Updated profileData:", profileData);
  }, [profileData]);


  const handleOpenTandC = () => {
    setOpenTandC(true);
  };

  const handleCloseTandC = () => {
    setOpenTandC(false);
  };

  const handlePlanSelection = (plan) => {
    console.log("we debugg", plan)
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
    console.log(profileData.paypalSubscriptionId)
    try {
      const token = await getIdTokenClaims();
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/subscription/cancel`, { subscriptionId: profileData.paypalSubscriptionId }, {
        headers: { Authorization: `Bearer ${token.__raw}` }
      });
      setIsSubscribed(false);
      setAgreedToTandC(false);
      setCurrentSubscription(null);


      // Update profileData to reset `isLive` and `userRole`
      setProfileData(prev => ({
        ...prev,
        isLive: false,  // Reset "Is Live" checkbox if needed
        userRole: "",   // Reset selected role
      }));
      alert('Subscription cancelled successfully');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('An error occurred while canceling your subscription. Please try again.');
    }
  };


  const renderSubscriptionOptions = () => {
    const roleBasedPlans = {
      driver: [
        { title: 'Free Plan', price: 0, features: ['Feature 1', 'Feature 2'], description: 'Perfect for professional drivers, offering tools and features to enhance efficiency and productivity.', planId: import.meta.env.VITE_FREE_PLAN_SUBSCRIPTION },
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


  // If loading, show a loading spinner or message
  if (loading) {
    return <Typography variant="h6">Loading profile data...</Typography>;
  }

  return (
    <div >
      <Typography variant="h4" gutterBottom>Edit Profile</Typography>
      <form onSubmit={handleSubmit(onSubmit)} >
        <FormGroup>
          <Controller
            name="firstName"
            control={control}
            defaultValue={profileData.firstName}
            rules={{
              required: 'First Name is required',
              pattern: {
                value: /^[A-Za-z]+$/,
                message: 'First Name must contain only letters',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="First Name"
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                margin="normal"
                variant="outlined"
                data-testid="firstName"
              />
            )}
          />
          <Controller
            name="lastName"
            control={control}
            defaultValue={profileData.lastName}
            rules={{
              required: 'Last Name is required',
              pattern: {
                value: /^[A-Za-z]+$/,
                message: 'Last Name must contain only letters',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Last Name"
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                margin="normal"
                variant="outlined"
                data-testid="lastName"
              />
            )}
          />
          <Controller
            name="email"
            control={control}
            defaultValue={profileData.email}
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: 'Please enter a valid email address',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                error={!!errors.email}
                helperText={errors.email?.message}
                margin="normal"
                variant="outlined"
                data-testid="email"
              />
            )}
          />
          <Controller
            name="isLive"
            control={control}
            defaultValue={profileData.isLive}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    {...field}
                    checked={field.value} // Ensure it reflects state
                    onChange={(e) => field.onChange(e.target.checked)} // Update the state properly
                    color="primary"
                    data-testid="isLive"
                  />
                }
                label="Is Live"
              />
            )}
          />
          <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">User Role</FormLabel>
            <RadioGroup
              name="userRole"
              value={profileData.userRole}
              onChange={handleChange}
              data-testid="userRole"
            >
              <FormControlLabel
                value="admin"
                control={<Radio color="primary" />}
                label="Admin"
                disabled={isSubscribed}
                data-testid="admin"
              />
              <FormControlLabel
                value="driver"
                control={<Radio color="primary" />}
                label="Driver"
                disabled={isSubscribed}
                data-testid="driver"
              />
              <FormControlLabel
                value="vehicleOwner"
                control={<Radio color="primary" />}
                label="Vehicle Owner"
                disabled={isSubscribed}
                data-testid="vehicleOwner"
              />
              <FormControlLabel
                value="adPublisher"
                control={<Radio color="primary" />}
                label="Ad Publisher"
                disabled={isSubscribed}
                data-testid="adPublisher"
              />
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

          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginTop: '16px' }}
            data-testid="submitBtn"
            disabled={!isChanged}  // Disable button if nothing changed
          >
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
        setIsSubscribed={setIsSubscribed}
        setCurrentSubscription={setCurrentSubscription}
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
