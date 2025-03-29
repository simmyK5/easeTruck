// src/Logo.js
import React from 'react';
import logoPath from './logo.svg'; // Replace this with your actual SVG path




const MainLogo = () => {
  return (
    <div className="logo-container">
      <img
        src={logoPath}
        alt="Logo"
        style={{
          
          width: '500px',  // Set the width of the image
          height: '450px',  // Maintain aspect ratio
        }}
       />
    </div>
  );
};

export default MainLogo;
