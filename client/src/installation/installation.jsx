import React, { useState, useEffect, useRef } from 'react';
import { Button, Typography, Container, Grid, Paper, Divider, IconButton, TextField, Snackbar } from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import InstallationPayment from './instPayPal';
import { useAuth0 } from '@auth0/auth0-react';
import './installation.css';

const Installation = ({ selectedInstallation, setSelectedInstallation, installationTotalAmount, setInstallationTotalAmount, isInstallationPaid, setIsInstallationPaid, installationInfo, setInstallationInfo, fullAddress, setFullAddress }) => {
    const { user } = useAuth0();
    const [userEmail, setUserEmail] = useState('');
    const [cart, setCart] = useState([]);
    const [quantities, setQuantities] = useState({}); // <-- per-item quantities
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const merchantId = import.meta.env.VITE_PAYFAST_MERCHANT_ID;
    const merchantKey = import.meta.env.VITE_PAYFAST_MERCHANT_KEY;
    const returnUrl = import.meta.env.VITE_PAYFAST_INSTALLATION_FRONTEND_URL;
    //const returnUrl = `${import.meta.env.VITE_PAYFAST_RETURN_BASE_URL}?firstName=${encodeURIComponent(profileData.firstName)}&lastName=${encodeURIComponent(profileData.lastName)}&termsAndConditions=${encodeURIComponent(profileData.termsAndConditions)}`;
    const cancelUrl = import.meta.env.VITE_PAYFAST_INSTALLATION_CANCEL_URL;
    const notifyUrl = import.meta.env.VITE_PAYFAST_INSTALLATION_NOTIFY_URL;
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const debounceRef = useRef(null);
    const [totalAmount, setTotalAmount] = useState(0);


    useEffect(() => {
        if (!query) {
            setSuggestions([]);
            return;
        }

        // Debounce API call
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                query
            )}.json?access_token=${accessToken}&types=address&country=ZA&limit=5`;

            const res = await fetch(url);
            const data = await res.json();

            if (data.features) {
                setSuggestions(data.features);
            }
        }, 300);
    }, [query]);

    const handleSelect = (feature) => {
        setQuery(feature.place_name);
        setSuggestions([]);
        console.log("see address", feature)
        setFullAddress(feature.place_name)
    };




    // DEVICE COST CALCULATION
    const deviceCost = 7714;
    const annualInterestRate = 0.12;
    const monthlyInterestRate = annualInterestRate / 12;
    const months = 36;

    const deviceMonthlyCost = deviceCost * Math.pow((1 + monthlyInterestRate), months) / months;

    const [items] = useState([
        { id: 1, name: 'Free Plan', subscriptionPrice: 0, price: 0 },
        { id: 2, name: 'Month-to-Month Installation Plan', subscriptionPrice: 800, price: 7714, outstandingInstallation: true },
        { id: 3, name: '36 Month Installation Plan', subscriptionPrice: deviceMonthlyCost, price: deviceMonthlyCost, outstandingInstallation: false }
    ]);

    useEffect(() => {
        if (user?.email) {
            setUserEmail(user.email);
        }
    }, [user]);

    // When quantities or cart change, update total
    useEffect(() => {
        const newTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setTotalAmount(newTotal);
        setInstallationTotalAmount(parseFloat(newTotal.toFixed(2)));
        console.log("sweet things", cart)
        if (cart.length > 0) {

            setInstallationInfo(cart[0]); // or whatever logic to choose the relevant item
        } else {
            setInstallationInfo(null);
        }
    }, [cart]);



    const handleQuantityChange = (e, itemId) => {
        const value = parseInt(e.target.value, 10) || 0;
        setQuantities(prev => ({ ...prev, [itemId]: value }));
    };

    /*const addToCart = (item) => {
        const quantity = quantities[item.id] || 1;
        if (quantity <= 0) return;

        const isInstallationPlan = item.name.includes('Installation Plan');

        // Set selected installation
        if (isInstallationPlan) {
            setSelectedInstallation(item); // Store selected plan in parent
        }

        // Always only one plan in the cart
        setCart([{ ...item, quantity }]);
    };*/

    const addToCart = (item) => {
        const quantity = quantities[item.id] || 1;
    
        // Skip if quantity is 0 or less
        if (quantity <= 0) return;
    
        // Calculate the price, with special handling for the "36 Month Installation Plan"
        const price =
            item.name === "36 Month Installation Plan"
                ? deviceMonthlyCost * quantity
                : item.price * quantity;
    
        // Store subscription price if it's a "36 Month Installation Plan"
        const subscriptionPrice = 
            item.name === "36 Month Installation Plan" 
                ? deviceMonthlyCost * quantity 
                : 800; // Default to 0 if it's not a subscription
    
        // Update the item with the new calculated values
        const updatedItem = {
            ...item,
            quantity,
            price, // Dynamically calculated price
            subscriptionPrice, // Add subscription price to the item
        };
    
        // Handle installation plan separately (if it's an installation plan)
        const isInstallationPlan = item.name.includes('Installation Plan');
        if (isInstallationPlan) {
            // Log the updated item to ensure it's correctly updated
            console.log("Updated Installation Plan Item:", updatedItem);
    
            // Store the selected installation plan in the parent component
            setSelectedInstallation(updatedItem); // Use updated item here
        }
    
        // Update the cart with only one subscription plan at a time
        setCart((prevCart) => {
            console.log("Previous Cart:", prevCart); // Log the previous cart state
    
            // Remove any existing installation plan from the cart
            const newCart = prevCart.filter(cartItem => !cartItem.name.includes("Installation Plan"));
    
            // Add the updated subscription plan to the cart
            const updatedCart = [...newCart, updatedItem];
    
            // Log the updated cart
            console.log("Updated Cart:", updatedCart);
    
            return updatedCart;
        });
    };
    
    



    const removeFromCart = (item) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem.quantity <= 1) {
                return prevCart.filter(cartItem => cartItem.id !== item.id);
            } else {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity - 1 }
                        : cartItem
                );
            }
        });
    };

    const removeItemFromCart = (item) => {
        setCart(prevCart => prevCart.filter(cartItem => cartItem.id !== item.id));
    };

    const handleCheckout = () => {
        setIsInstallationPaid(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleManualAddress = (address) => {
        setSelectedAddress({
            place_name: address,
            custom: true
        });
        setSuggestions([]);
    };


    console.log("my life", installationInfo)

    return (
        <div>
            <Container>
                <Paper elevation={3} className="shopping-cart-container">
                    <Typography variant="h4" gutterBottom>Installation</Typography>
                    <Grid container spacing={2} className="products-container">
                        {items.map(item => (
                            <Grid item xs={12} sm={6} key={item.id} className="product-item">
                                <Paper elevation={1} className="product-paper">
                                    <Typography variant="h6">{item.name}</Typography>

                                    {item.name === "36 Month Installation Plan" ? (
                                        <>
                                            <Typography>
                                                Subscription Plan: R{(deviceMonthlyCost * (quantities[item.id] || 1)).toFixed(2)} / month
                                            </Typography>
                                            <Typography>
                                                Total cost for {quantities[item.id] || 1} device(s): R{(deviceMonthlyCost * (quantities[item.id] || 1)).toFixed(2)}
                                            </Typography>
                                        </>
                                    ) : (
                                        <>
                                            <Typography>Subscription Plan: R{item.subscriptionPrice} / month</Typography>
                                            <Typography>
                                                Total cost for {quantities[item.id] || 1} device(s): R{(item.price * (quantities[item.id] || 1)).toFixed(2)}
                                            </Typography>
                                        </>
                                    )}


                                    <TextField
                                        type="number"
                                        label="Installations"
                                        InputProps={{ inputProps: { min: 0 } }}
                                        value={quantities[item.id] || ''}
                                        onChange={(e) => handleQuantityChange(e, item.id)}
                                        size="small"
                                        style={{ marginTop: '10px', marginBottom: '10px', width: '100px' }}
                                    />

                                    <Button
                                        variant="contained"
                                        onClick={() => addToCart(item)}
                                        style={{ marginTop: '10px' }}
                                    >
                                        Add to Cart
                                    </Button>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>

                    <Divider className="section-divider" />

                    <Typography variant="h5" gutterBottom>Order Summary</Typography>

                    <div className="order-summary">
                        {cart.map((item) => (
                            <>
                                <div key={item.id} className="cart-item">
                                    <Typography>Plan: {item.name} - Price: R{item.price} - No of trucks {item.quantity}</Typography>
                                    <div className="quantity-controls">
                                        <IconButton onClick={() => addToCart(item)}>
                                            <Add />
                                        </IconButton>
                                        <Typography variant="body1" className="quantity-text">{item.quantity}</Typography>
                                        <IconButton onClick={() => removeFromCart(item)} color="secondary">
                                            <Remove />
                                        </IconButton>
                                        <IconButton onClick={() => removeItemFromCart(item)} color="error" style={{ marginLeft: '10px' }}>
                                            <Delete />
                                        </IconButton>
                                    </div>
                                    <Divider className="item-divider" />
                                </div>

                                <input
                                    type="text"
                                    placeholder="Search for address"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    style={{ padding: '6px', width: '300px' }}
                                />

                                {(suggestions.length > 0 || query.trim()) && (
                                    <ul style={{
                                        listStyle: 'none',
                                        background: '#fff',
                                        padding: '10px',
                                        border: '1px solid #ccc',
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        width: '300px',
                                        marginTop: '5px'
                                    }}>
                                        {suggestions.map((feature) => (
                                            <li
                                                key={feature.id}
                                                onClick={() => handleSelect(feature)}
                                                style={{ padding: '5px 0', cursor: 'pointer' }}
                                            >
                                                {feature.place_name}
                                            </li>
                                        ))}

                                        {/* Allow manual input if not matched */}
                                        {query && (
                                            <li
                                                key="custom"
                                                onClick={() => handleManualAddress(query)}
                                                style={{ padding: '5px 0', cursor: 'pointer', fontStyle: 'italic', color: '#555' }}
                                            >
                                                Use this address: "{query}"
                                            </li>
                                        )}
                                    </ul>
                                )}

                            </>

                        ))}
                    </div>
                </Paper>
            </Container>

            {/* Snackbar for error message */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
            />
            </div>
    );
};

export default Installation;
