import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Container, MenuItem, FormGroup } from '@mui/material';
import AdPayment from './adPayment'; // Import the AdPayment component
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import "./createAd.css";
import { useAuth0 } from '@auth0/auth0-react';
import { useForm, Controller, useWatch } from 'react-hook-form';  // Import react-hook-form

const CreateAd = () => {
  const { user } = useAuth0();
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [userDetail, setUserDetails] = useState({ email: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageName, setImageName] = useState("");


  const { control, handleSubmit, formState: { errors }, setValue, reset } = useForm();
  const options = ['Transportation Opportunity', 'Logistic Event', 'Truck', 'Head', 'Tailor'];

  const calculateMonthsDifference = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const yearsDifference = end.getFullYear() - start.getFullYear();
    const monthsDifference = end.getMonth() - start.getMonth();
    return yearsDifference * 12 + monthsDifference;
  };
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) fetchUserDetails(user.email);
  }, [user]);

  const fetchUserDetails = async (email) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/user/users/${email}`);
      setUserDetails(response.data);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleAdSubmit = async (data) => {
    if (!selectedImage) {
      alert('Please select an image for the ad.');
      return;
    }

    const form = new FormData();
    form.append('file', selectedImage);
    form.append('title', data.title);
    form.append('content', data.content);
    form.append('linkUrl', data.linkUrl);
    form.append('startDate', data.startDate);
    form.append('endDate', data.endDate);
    form.append('active', true);
    form.append('adType', data.adType);

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/ad/create-order`, form);
      alert('Ad submitted successfully!');

    } catch (error) {
      console.error('Error submitting ad:', error);
      alert('Failed to submit ad.');
    }
  };

  const onPaymentSuccess = () => {
    setPaymentSuccessful(true);
    handleAdSubmit(); // Submit the ad after successful payment
    setValue('title', '');
    setValue('content', '');
    setValue('linkUrl', '');
    setValue('startDate', '');
    setValue('endDate', '');
    setValue('adType', '');
    setValue('image', null);


  };

  const onPaymentError = (message) => {
    alert(message);
  };

  const handleCheckout = (data) => {
    const itemsArray = [
      {
        name: data.title,
        unit_amount: { currency_code: 'USD', value: totalAmount.toFixed(2) },
        quantity: '1',
        description: data.content,
        link: data.linkUrl,
        start_date: data.startDate,
        end_date: data.endDate,
        ad_type: data.adType,
        active: true
      }
    ];
    setItems(itemsArray);
    setIsPaymentModalOpen(true);
    console.log("Checkout items:", itemsArray);
  };
  const startDate = useWatch({ control, name: "startDate" });
  const endDate = useWatch({ control, name: "endDate" });

  useEffect(() => {
    if (startDate && endDate) {
      const months = calculateMonthsDifference(startDate, endDate);
      setTotalAmount(months * 5000);
    }
  }, [startDate, endDate]);  // Now we're using actual values, not function calls



  const clearForm = () => {
    reset({
      title: '',
      content: '',
      linkUrl: '',
      startDate: '',
      endDate: '',
      adType: '',
      image: null, // Clear file input in form

    });

    // Manually reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear file input manually
    }

    // Clear selected image and other state variables
    setSelectedImage(null);
    setTotalAmount(0);
    setItems([]);
  };
  const checkImage = async (file) => {
    console.log(import.meta.env.VITE_SIGHTENGINE_API_USER)
    console.log(import.meta.env.VITE_SIGHTENGINE_API_SECRET)
    const formData = new FormData();
    formData.append("media", file); // File from input
    formData.append("models", "nudity");
    formData.append("api_user", import.meta.env.VITE_SIGHTENGINE_API_USER); // API User (Client ID)
    formData.append("api_secret", import.meta.env.VITE_SIGHTENGINE_API_SECRET); // API Secret

    try {
      const response = await axios.post(
        "https://api.sightengine.com/1.0/check.json",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Set content type for file upload
          },
        }
      );

      console.log("Response:", response.data);

      if (response.data.nudity && response.data.nudity.raw > 0.7) {
        alert("❌ NSFW content detected! Upload blocked.");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error:", error);
      return false;
    }
  };


  const handleFileChange = async (event, field) => {
    const file = event.target.files[0];
    if (file) {
      // Check for image content before setting it
      const isSafe = await checkImage(file);
      if (isSafe) {
        setImageName(file.name);
        setSelectedImage(file);
        field.onChange(file); // Only set the file object to the field value if safe
      }
    }
  };

  return (
    <Container className='formContainer'>
      <Typography variant="h4" gutterBottom className='formTitle'>
        Create a New Ad
      </Typography>

      <form onSubmit={handleSubmit(handleCheckout)}>
        <FormGroup>
          <Controller
            name="title"
            control={control}
            defaultValue=""
            rules={{
              required: 'Title is required'
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Title"
                error={!!errors.title}
                helperText={errors.title?.message}
                margin="normal"
                variant="outlined"
                data-testid="title"
              />
            )}
          />
          <Controller
            name="content"
            control={control}
            defaultValue=""
            rules={{ required: 'Description is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                variant="outlined"
                multiline
                rows={4}
                margin="normal"
                error={!!errors.content}
                helperText={errors.content?.message}
                data-testid="content"
              />
            )}
          />
          <Controller
            name="linkUrl"
            control={control}
            defaultValue=""
            rules={{ required: 'Link URL is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Link URL"
                variant="outlined"
                margin="normal"
                error={!!errors.linkUrl}
                helperText={errors.linkUrl?.message}
                data-testid="linkUrl"
              />
            )}
          />
          <Controller
            name="image"
            control={control}
            defaultValue={null}
            rules={{ required: "Please select an image" }}
            render={({ field }) => (
              <>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleFileChange(e, field)}
                  ref={fileInputRef}
                  data-testid="fileUpload"
                />
                <Button
                  variant="contained"
                  component="span"
                  onClick={() => fileInputRef.current.click()}
                  style={{ margin: "16px 0" }}
                >
                  Upload Image
                </Button>
                {imageName && (
                  <Typography variant="body2" style={{ marginTop: "8px" }}>
                    {`${imageName}`}
                  </Typography>
                )}
                {errors.image && (
                  <Typography variant="body2" color="error" style={{ marginTop: "8px" }}>
                    {errors.image.message}
                  </Typography>
                )}
              </>
            )}
          />
          <Controller
            name="startDate"
            control={control}
            defaultValue=""
            rules={{ required: 'Start Date is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Start Date"
                type="date"
                variant="outlined"
                margin="normal"
                InputLabelProps={{ shrink: true }}
                error={!!errors.startDate}
                helperText={errors.startDate?.message}
                data-testid="startDate"
              />
            )}
          />
          <Controller
            name="endDate"
            control={control}
            defaultValue=""
            rules={{ required: 'End Date is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="End Date"
                type="date"
                variant="outlined"
                margin="normal"
                InputLabelProps={{ shrink: true }}
                error={!!errors.endDate}
                helperText={errors.endDate?.message}
                data-testid="endDate"
              />
            )}
          />
          <Controller
            name="adType"
            control={control}
            defaultValue=""
            rules={{ required: 'Ad Type is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Select type of Ad"
                select
                variant="outlined"
                margin="normal"
                error={!!errors.adType}
                helperText={errors.adType?.message}
                data-testid="selectAd"
              >
                {options.map((option, index) => (
                  <MenuItem key={index} value={option}>{option}</MenuItem>
                ))}
              </TextField>
            )}
          />
          <Typography variant="h6" gutterBottom className='formTitle' data-testid="totalAmount">
            Total Amount: R{totalAmount.toFixed(2)}
          </Typography>
          <Button variant="contained" color="primary" sx={{ mt: 3 }} type="submit" data-testid="SubmitAd">
            Pay and Submit Ad
          </Button>
          {!paymentSuccessful && totalAmount > 0 && (
            <PayPalScriptProvider options={{ 'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID }}>
              <AdPayment
                open={isPaymentModalOpen}
                totalAmount={totalAmount}
                userEmail={userDetail.email}
                items={items}
                selectedImage={selectedImage}
                onClose={() => setIsPaymentModalOpen(false)}
                onPaymentSuccess={onPaymentSuccess}
                onPaymentError={onPaymentError}
                clearForm={clearForm}
              />
            </PayPalScriptProvider>
          )}
        </FormGroup>
      </form>
    </Container>
  );
};

export default CreateAd;
