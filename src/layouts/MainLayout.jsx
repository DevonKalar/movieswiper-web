import Header from "@components/common/Header";
import Footer from "@components/common/Footer";
import GuestBanner from "@components/auth/GuestBanner";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <>
      <Header />
      <GuestBanner />
      <Outlet />
      <Footer />
    </>
  );
};

export default MainLayout;
