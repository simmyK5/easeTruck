// src/Logo.js
import React from 'react';
import logoPath from './logo.svg'; // Replace this with your actual SVG path




const Logo = () => {
  return (
    <div className="logo-container">
      <img
        src={logoPath}
        alt="Logo"
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '50px',  // Set the width of the image
          height: '50px',  // Maintain aspect ratio
        }}
      
       />
    </div>
  );
};

export default Logo;
