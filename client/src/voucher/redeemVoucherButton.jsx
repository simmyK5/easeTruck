import React, { useState, useEffect, useRef } from "react";
import { Button, CircularProgress, Typography } from "@mui/material";
import axios from "axios";
import braintree from "braintree-web";

const RedeemVoucherButton = ({ voucherCode, amount }) => {
  const [loading, setLoading] = useState(false);
  const [clientToken, setClientToken] = useState(null);
  const [paymentMethodNonce, setPaymentMethodNonce] = useState(null);
  const hostedFieldsInstanceRef = useRef(null);

  // Fetch the client token from your backend
  useEffect(() => {
    const fetchClientToken = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/backend/voucher/client-token`);
        setClientToken(response.data.clientToken);
      } catch (error) {
        console.error("Error fetching client token:", error);
      }
    };

    fetchClientToken();

    // Cleanup hosted fields on initial mount
    return () => {
      if (hostedFieldsInstanceRef.current) {
        hostedFieldsInstanceRef.current.teardown().then(() => {
          hostedFieldsInstanceRef.current = null;
          console.log("Cleaned up hosted fields on initial load.");
        });
      }
    };
  }, []);

  // Initialize Braintree Hosted Fields when client token is available
  useEffect(() => {
    const initializeHostedFields = async () => {
      try {
        if (hostedFieldsInstanceRef.current) {
          await hostedFieldsInstanceRef.current.teardown();
          hostedFieldsInstanceRef.current = null;
        }

        document.querySelector("#card-number").innerHTML = "";
        document.querySelector("#expiration-date").innerHTML = "";
        document.querySelector("#cvv").innerHTML = "";

        const clientInstance = await braintree.client.create({
          authorization: clientToken,
        });

        hostedFieldsInstanceRef.current = await braintree.hostedFields.create({
          client: clientInstance,
          styles: {
            input: { "font-size": "16px", color: "#3a3a3a" },
            ".valid": { color: "#28a745" },
            ".invalid": { color: "#dc3545" },
          },
          fields: {
            number: { selector: "#card-number" },
            expirationDate: { selector: "#expiration-date" },
            cvv: { selector: "#cvv" },
          },
        });

        console.log("Hosted fields initialized successfully.");
      } catch (error) {
        console.error("Error initializing Braintree:", error);
      }
    };

    if (clientToken) {
      initializeHostedFields();
    }

    return () => {
      if (hostedFieldsInstanceRef.current) {
        hostedFieldsInstanceRef.current.teardown().then(() => {
          console.log("Hosted fields instance torn down on unmount.");
        });
      }
    };
  }, [clientToken]);

  // Handle voucher redemption with payment nonce
  const handleRedeem = async () => {
    if (!hostedFieldsInstanceRef.current) {
      alert("Payment fields are not initialized. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const payload = await hostedFieldsInstanceRef.current.tokenize();

      if (payload && payload.nonce) {
        setPaymentMethodNonce(payload.nonce);
        console.log("Payment Method Nonce:", payload.nonce);

        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/backend/voucher/redeem-voucher`, {
          voucherCode,
          paymentMethodNonce: payload.nonce,
          amount,
        });

        if (response.data.success) {
          alert("Payment processed successfully!");
        } else {
          alert("Error processing payment.");
        }
      } else {
        alert("Failed to retrieve payment method nonce. Please check your card details.");
      }
    } catch (error) {
      console.error("Error tokenizing payment fields:", error);
      alert("An error occurred while processing payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Enter Card Details
      </Typography>

      <div style={{ marginBottom: "16px" }}>
        <label htmlFor="card-number" style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
          Card Number
        </label>
        <div id="card-number" style={{ height: "40px", border: "1px solid #ccc" }}></div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label htmlFor="expiration-date" style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
          Expiration Date
        </label>
        <div id="expiration-date" style={{ height: "40px", border: "1px solid #ccc" }}></div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <label htmlFor="cvv" style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>
          CVV
        </label>
        <div id="cvv" style={{ height: "40px", border: "1px solid #ccc" }}></div>
      </div>

      <Button
        variant="contained"
        color="primary"
        onClick={handleRedeem}
        disabled={loading}
        fullWidth
        sx={{ mt: 2 }}
      >
        Redeem Voucher
      </Button>
      {loading && <CircularProgress size={24} sx={{ mt: 2 }} />}
    </div>
  );
};

export default RedeemVoucherButton;
