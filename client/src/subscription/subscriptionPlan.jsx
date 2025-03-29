import React, { useState } from 'react';
import { Card, CardContent, Typography, CardActions, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

const SubscriptionPlan = ({ title, price, features, onSubscribe }) => {
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    acceptedTerms: false,
  });


  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setUserData({
      ...userData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFormSubmit = () => {
    onSubscribe(userData);
    handleClose();
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="h6" component="div">
          ${price} / month
        </Typography>
        <ul>
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </CardContent>
      <CardActions>
        <Button variant="contained" color="primary" onClick={handleClickOpen} data-testid="subsribeBtn">
          Subscribe
        </Button>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Subscribe to {title}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Name"
              type="text"
              fullWidth
              value={userData.name}
              onChange={handleInputChange}
              data-testid="name"
            />
            <TextField
              margin="dense"
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              value={userData.email}
              onChange={handleInputChange}
              data-testid="email"
            />
            <label>
              <input
                type="checkbox"
                name="acceptedTerms"
                checked={userData.acceptedTerms}
                onChange={handleInputChange}
                data-testid="acceptedTerms"
              />
              Accept Terms and Conditions
            </label>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary" data-testid="cancelBtn">
              Cancel
            </Button>
            <Button onClick={handleFormSubmit} color="primary" data-testid="saveSubscribeBtn">
              Subscribe
            </Button>
          </DialogActions>
        </Dialog>
      </CardActions>
    </Card>
  );
};

export default SubscriptionPlan;
