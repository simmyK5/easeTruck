import React, { useState, useEffect } from 'react';
import { Button, Typography, Container, Grid, Paper, Divider, IconButton } from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import InstallationPayment from './instPayPal';
import { useAuth0 } from '@auth0/auth0-react';
import './installation.css'; // Import the CSS file

const Installation = () => {
    const [items] = useState([
        { id: 1, name: 'Installation Only', price: 10 },
        { id: 2, name: 'Installation + Hardware', price: 15 }
    ]);
    const [cart, setCart] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const { user } = useAuth0();
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const fetchProfileData = async () => {
            setUserEmail(user.email);
        };
        fetchProfileData();
    }, [user.email]);

    const addToCart = (item) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            } else {
                return [...prevCart, { ...item, quantity: 1 }];
            }
        });

        setTotalAmount(prevTotal => prevTotal + item.price);
    };

    const removeFromCart = (item) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem.quantity === 1) {
                return prevCart.filter(cartItem => cartItem.id !== item.id);
            } else {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity - 1 }
                        : cartItem
                );
            }
        });

        setTotalAmount(prevTotal => prevTotal - item.price);
    };

    const removeItemFromCart = (item) => {
        setCart(prevCart => prevCart.filter(cartItem => cartItem.id !== item.id));
        setTotalAmount(prevTotal => prevTotal - (item.price * item.quantity));
    };

    const handleCheckout = () => {
        console.log("Proceeding to checkout");
        setIsPaymentModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsPaymentModalOpen(false);
    };

    const clearCart = () => {
        setCart([]);
        setTotalAmount(0);
    };

    return (
        <PayPalScriptProvider options={{ 'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID }}>
            <Container>
                <Paper elevation={3} className="shopping-cart-container">
                    <Typography variant="h4" gutterBottom>Products</Typography>
                    <Grid container spacing={2} className="products-container">
                        {items.map(item => (
                            <Grid item xs={12} sm={6} key={item.id} className="product-item">
                                <Paper elevation={1} className="product-paper">
                                    <Typography variant="h6">{item.name}</Typography>
                                    <Typography>R{item.price}</Typography>
                                    <Button variant="contained" onClick={() => addToCart(item)} style={{ marginTop: '10px' }} data-testid="cartBtn" >Add to Cart</Button>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                    <Divider className="section-divider" />
                    <Typography variant="h5" gutterBottom>Order Summary</Typography>
                    <div className="order-summary">
                        {cart.map((item) => (
                            <div key={item.id} className="cart-item">
                                <Typography>{item.name} - R{item.price} x {item.quantity}</Typography>
                                <div className="quantity-controls">
                                    <IconButton onClick={() => addToCart(item)} data-testid="addBtn">
                                        <Add />
                                    </IconButton>
                                    <Typography variant="body1" className="quantity-text">{item.quantity}</Typography>
                                    <IconButton onClick={() => removeFromCart(item)} color="secondary" data-testid="removeBtn">
                                        <Remove />
                                    </IconButton>
                                    <IconButton onClick={() => removeItemFromCart(item)} color="error" style={{ marginLeft: '10px' }} data-testid="deleteBtn">
                                        <Delete />
                                    </IconButton>
                                </div>
                                <Divider className="item-divider" />
                            </div>
                        ))}
                    </div>
                    <Typography variant="h5" gutterBottom>Total Amount: R{totalAmount.toFixed(2)}</Typography>

                    <div className="checkout-button-container">
                        <Button variant="contained" onClick={handleCheckout} data-testid="checkoutBtn">Proceed to Checkout</Button>
                    </div>
                </Paper>

                {isPaymentModalOpen && (
                    <InstallationPayment 
                        open={isPaymentModalOpen} 
                        items={cart} 
                        totalAmount={totalAmount}
                        userEmail={userEmail} 
                        onClose={handleCloseModal} 
                        clearCart={clearCart}
                    />
                )}
            </Container>
        </PayPalScriptProvider>
    );
};

export default Installation;
