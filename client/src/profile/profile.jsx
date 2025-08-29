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
import { useForm, Controller } from 'react-hook-form';
import TermsAndConditions from './termsAndCondition';
import Installation from '../installation/installation';


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
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isInstallationPaid, setIsInstallationPaid] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
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
  const [selectedInstallation, setSelectedInstallation] = useState(null);
  const [installationTotalAmount, setInstallationTotalAmount] = useState(null);
  const [installationInfo, setInstallationInfo] = useState({});
  const [fullAddress, setFullAddress] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);


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


  const handleOpenTandC = () => {
    setOpenTandC(true);
  };

  const handleCloseTandC = () => {
    setOpenTandC(false);
  };




  const handlePlanSelection = (plan) => {
    console.log("ngwana waka", plan)
    setSelectedPlan(plan);
    if(selectedPlan){
      handleRedirect();
    }
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
        { title: 'Free Plan', price: 0, totalAmount: 0, features: ['Manage invoices', 'View route selection', 'Post advertisements'], description: 'Perfect for professional drivers', planId: import.meta.env.VITE_FREE_PLAN_SUBSCRIPTION },
        { title: 'Driver Plan', price: 50.00, totalAmount: 50.00, features: ['Manage invoices', 'View route selection', 'Post advertisements'], description: 'Perfect for professional drivers', planId: import.meta.env.VITE_DRIVER_PLAN_SUBSCRIPTION },
      ],
      vehicleOwner: [
        {
          title: 'Vehicle Owner Plan',
          price: parseFloat(
            (
              selectedInstallation?.subscriptionPrice ?? 39.99
            ).toFixed(2)
          ),
          totalAmount: parseFloat(
            (
              installationTotalAmount ?? 39.99
            ).toFixed(2)
          ),
          features: [' Manage trucks', 'track truck locations in real time', 'Receive security alerts'],
          description: selectedInstallation?.name ?? "vehicle Owner",
          planId: import.meta.env.VITE_VEHICLE_OWNER_PLAN_SUBSCRIPTION,
        },
      ],
      adPublisher: [
        { title: 'Free Plan', price: 0, totalAmount: 0, features: ['Post advertisements', 'View advertisements'], description: 'For advertisers', planId: import.meta.env.VITE_FREE_PLAN_SUBSCRIPTION },
        { title: 'Ad Publisher Plan', price: 50.00, totalAmount: 50.00, features: ['Post advertisements', 'View advertisements'], description: 'For advertisers', planId: import.meta.env.VITE_AD_PUBLISHER_PLAN_SUBSCRIPTION },
      ],
    };

    return (roleBasedPlans[selectedRole] || []).map((plan, index) => (
      <Button
        key={index}
        variant="contained"
        color="primary"
        onClick={() => handlePlanSelection(plan)}
        disabled={isSubscribed || (selectedRole === 'vehicleOwner' && !selectedInstallation)} // Disable button if no installation selected
        data-testid={`${plan.title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        {plan.title} - {plan.price}
      </Button>
    ));
  };
  console.log("ngimbonile", selectedInstallation)

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const firstName = params.get('firstName');
    const lastName = params.get('lastName');
    const termsAndConditions = params.get('termsAndConditions');

    if (firstName || lastName || termsAndConditions) {
      setProfileData(prev => ({
        ...prev,
        firstName: firstName || prev.firstName,
        lastName: lastName || prev.lastName,
      }));

      if (termsAndConditions === 'true') {
        setAgreedToTandC(true);
      }
    }
  }, [location.search]);

  console.log("see me now", agreedToTandC)

  useEffect(() => {
    // Dynamically load PayFast script if it's not available
    const script = document.createElement('script');
    script.src = 'https://www.payfast.co.za/button/subscribe'; // This is an example, check the official SDK URL
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);



  const handleRedirect = () => {
    setIsProcessing(true); // Disable the button

    // Create form
    const form = document.createElement('form');
    form.method = 'post';
    form.action = 'https://sandbox.payfast.co.za/eng/process';

    // Helper to add hidden input
    const addInput = (name, value) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    };

    // Add required PayFast fields
    addInput('merchant_id', import.meta.env.VITE_PAYFAST_MERCHANT_ID);
    addInput('merchant_key', import.meta.env.VITE_PAYFAST_MERCHANT_KEY);
    addInput('return_url', import.meta.env.VITE_PAYFAST_RETURN_URL);
    addInput('cancel_url', import.meta.env.VITE_PAYFAST_CANCEL_URL);
    addInput('notify_url', import.meta.env.VITE_PAYFAST_NOTIFY_URL);
    addInput('amount', selectedPlan.price);
    addInput('item_name', selectedPlan.title);
    addInput('email_address', profileData.email);
    addInput('subscription_type', '1');
    addInput('billing_date', new Date().toISOString().split('T')[0]);
    addInput('recurring_amount', selectedPlan.price);
    addInput('frequency', '3');
    addInput('cycles', '0');
    addInput('name_first', profileData.firstName);
    addInput('name_last', profileData.lastName);
    addInput('custom_str1', profileData.userRole);
    addInput('custom_str2', profileData.termsAndConditions ? 'true' : 'false');
    addInput('custom_str3', JSON.stringify(installationInfo));
    addInput('custom_int1', installationTotalAmount);
    addInput('custom_str4', fullAddress);
    addInput('custom_str5', installationInfo.outstandingInstallation);

    // Append and submit
    document.body.appendChild(form);
    form.submit();

    // Optional: clean up and re-enable
    setIsProcessing(false);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Create Profile</Typography>
      <form onSubmit>
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

          <Button variant="contained" onClick={handleOpenTandC}>
            Read and Agree to Terms and Conditions
          </Button>



          <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">User Role</FormLabel>
            <RadioGroup
              name="userRole"
              value={profileData.userRole}
              onChange={handleChange}
              data-testid="userRole"
            >
              {["driver", "vehicleOwner", "adPublisher"].map((role) => (
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
                    !profileData.lastName?.trim() ||
                    !agreedToTandC
                  } // Disable if subscribed or if first/last name is empty
                />
              ))}
            </RadioGroup>
          </FormControl>

          {selectedRole === 'vehicleOwner' && (
            <Installation
              selectedInstallation={selectedInstallation}
              setSelectedInstallation={setSelectedInstallation}
              installationTotalAmount={installationTotalAmount}
              setInstallationTotalAmount={setInstallationTotalAmount}
              installationInfo={installationInfo}
              setInstallationInfo={setInstallationInfo}
              fullAddress={fullAddress}
              setFullAddress={setFullAddress}
              profileData={profileData}
            />
          )}

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

        </FormGroup>
      </form>

      <TermsAndConditions
        open={openTandC}
        handleClose={handleCloseTandC}
        setAgreedToTandC={setAgreedToTandC}
        userEmail={user.email}

      />

    </div>
  );
}