import React from "react";

const Footer = () => {
  return (
    <footer className="type-label-sm p-4 text-center text-text-default bg-surface-raised">
      <p>© {new Date().getFullYear()} Movie Swiper. All rights reserved. Movie data provided by TheMovieDB.org.</p>
    </footer>
  );
};

export default Footer;
