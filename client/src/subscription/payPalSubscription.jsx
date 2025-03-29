import { PayPalButtons } from "@paypal/react-paypal-js";

function PayPalSubscription({ planId, onApprove }) {
    const createSubscription = (data, actions) => {
        return actions.subscription.create({
            plan_id: planId, // Use your subscription plan ID here
        });
    };

    const handleApprove = (data) => {
        console.log("Subscription approved!", data);
        onApprove(data);
    };

    const handleError = (error) => {
        console.error("PayPal error:", error);
        alert("Error with PayPal. Please try again.");
    };

    return (
        <PayPalButtons
                style={{ layout: "vertical" }}
                createSubscription={createSubscription}
                onApprove={handleApprove}
                onError={handleError}
                fundingSource="credit" // Use 'credit' for card payments
            />
    );
}

export default PayPalSubscription;
