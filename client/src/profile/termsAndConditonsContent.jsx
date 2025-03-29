import React from 'react';

const TermsAndConditonsContent = () => {

  const fees = [
    { amount: 350, description: "Fee for missed scheduled appointments" },
    { amount: 1000, description: "4-month subscription fee for vehicle owners" },
    { amount: 50, description: "4-month subscription fee for the driver" },
    { amount: 20, description: "4-month subscription fee for the ad publisher " },
    { amount: 500 , description: "The publication fee for each ad starts at a base price per month, with the cost increasing depending on the size of the audience reached.  " },
    { amount: 500 , description: "Work fee " },
    { amount: 300, description: "Install, deinstall or reinstall" },
    { amount: 0, description: "One-time payment for hardware" },
  ];

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#f9f9f9",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
  };

  const headerStyle = {
    backgroundColor: "#4CAF50",
    color: "white",
    textAlign: "left",
  };

  const cellStyle = {
    padding: "10px",
    border: "1px solid #ddd",
  };

  const rowStyle = {
    backgroundColor: "#f2f2f2",
  };


  return (
    <p>
      Please read and agree to the Terms and Conditions to proceed.
      {/* Insert your actual Terms and Conditions text here */}
      <br />
      By using this service, you agree to the following:
      <ul>
        <li>An Ease Truck representative will manage the hardware installation in the vehicle</li>
        <li>We take responsibility only for hardware purchased from us, as we also offer installation-only services. If the hardware was purchased elsewhere and a fault occurs during installation, we cannot be held liable </li>
        <li>To collaborate with the police department in locating the truck.</li>
        <li>Ease Truck does not provide any assurance that the hardware will result in recovery. </li>
        <li>Offer secure, 24/7 access to web-based monitoring, enabling users to track driver locations and more. Each user is provided with a unique username and password to ensure privacy and security. </li>
        <li>For assistance with complaints and inquiries, please provide feedback through our website. You can also contact us via email or phone. </li>
        <li>The subscription period is four months (quarterly). If a user decides to cancel their subscription, they must pay a cancellation fee; failure to do so will result in the forfeiture of any refund. The subscription will automatically renew unless canceled. If the user cancels the plan, no cancellation fee will apply, but they will forfeit the amount paid for the four-month period. Is this allowed?</li>
        <li>The debit order is processed on the last day of each four-month period.</li>
        <li>Refunds are only eligible if the system is not functioning as described in the "How It Works" video. </li>
        <li>A user can update their plan, but this will deactivate the current plan, and they will be charged for the new plan. The expiration of the plan will be determined based on the new plan. </li>
        <li>If a payment fails, the user will be denied access to the Ease Truck system. After 21 working days without payment, the account will be deactivated, and any data collected during that period will be lost. </li>
        <li>The client can redeem their reward on the system for recognizing the driver’s excellent driving. </li>
        <li>The Client may have the right to cancel the Agreement within 5 (five) Business Days from the date of conclusion by providing written notice to Ease Truck. If the Client exercises their Cooling-Off rights, any payments made to Ease Truck under the Agreement will be refunded within 15 business days. </li>
        <li>The first payment is made at the time of subscription, and the subsequent payment occurs exactly four months later. </li>
        <li>The client must settle the roaming charges within 21 days. </li>
        <li>The truck's ease increases by 10% annually. </li>
        <li><table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ ...cellStyle, ...headerStyle }}>Amount</th>
              <th style={{ ...cellStyle, ...headerStyle }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((fee, index) => (
              <tr key={index} style={index % 2 === 0 ? rowStyle : {}}>
                <td style={cellStyle}>{fee.amount}</td>
                <td style={cellStyle}>{fee.description}</td>
              </tr>
            ))}
          </tbody>
        </table></li>
        <li>The client verifies the completion and accuracy of all details on the subscriber form. </li>
        <li>Ease Track does not guarantee that the Service will capture all events, that remote access or the GSM network will be continuous or uninterrupted, that the fleet management web-based system will be free from errors, or that any specific result or outcome will be achieved through the use of the Service. Additionally, Ease Track does not ensure that the Client’s use of the Service will comply with all relevant laws. </li>
        <li>Ease Truck shall not be held liable for any loss or damage of any kind incurred by the Client as a result of any action or failure to act by Ease Truck, regardless of any negligence on the part of Ease Truck. </li>
        <li>By signing this agreement, the client agrees to Ese Truck processing their personal information, usage data, vehicle location, driver behavior, de-identified data, and any other data transmitted from the hardware installed in the client’s vehicle. </li>
        <li>The Client is not permitted to modify the terms of this Agreement without obtaining written consent from Ease Truck.</li>
        <li>Legal action will be taken against any client who uploads inappropriate images. </li>



      </ul>
    </p>
  );
};

export default TermsAndConditonsContent;