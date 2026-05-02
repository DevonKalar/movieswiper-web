import React from "react";

const Footer = () => {
  return (
    <footer className="p-4 text-center text-sm text-text-default bg-surface-raised">
      <p>© {new Date().getFullYear()} Movie Swiper. All rights reserved. For Demonstration Purposes Only</p>
    </footer>
  );
};

export default Footer;
