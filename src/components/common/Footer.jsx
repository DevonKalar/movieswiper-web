import React from "react";

const Footer = () => {
  return (
    <footer className="type-label-sm p-4 text-center text-text-default bg-surface-raised">
      <p>Movie data provided by themoviedb.org<br />© {new Date().getFullYear()} MovieSwiper</p>
    </footer>
  );
};

export default Footer;
