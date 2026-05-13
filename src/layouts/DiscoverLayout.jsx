import Header from "@components/common/Header";
import Footer from "@components/common/Footer";
import GuestBanner from "@components/auth/GuestBanner";
import { Outlet } from "react-router-dom";

const DiscoverLayout = () => {
  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <Header />
      <GuestBanner />
      <Outlet />
      <Footer />
    </div>
  );
};

export default DiscoverLayout;
