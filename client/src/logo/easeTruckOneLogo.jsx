
import React from 'react';
import logoPath from './easeTruckOne.svg'; // Replace this with your actual SVG path




const EaseTruckOneLogo = () => {
  return (
    <div className="logo-container">
      <img
        src={logoPath}
        alt="Logo"
        style={{
          
          width: '300px',  // Set the width of the image
          height: '300px',  // Maintain aspect ratio
        }}
       />
    </div>
  );
};

export default EaseTruckOneLogo;
