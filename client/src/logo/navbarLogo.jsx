// src/Logo.js
import React from 'react';
import logoPath from './logo.svg'; // Replace this with your actual SVG path




const NavbarLogo = () => {
  return (
    <div className="logo-container">
      <img
        src={logoPath}
        alt="Logo"
        style={{
          
          width: '250px',  // Set the width of the image
          height: '250px',  // Maintain aspect ratio
        }}
       />
    </div>
  );
};

export default NavbarLogo;
