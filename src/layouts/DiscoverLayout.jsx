import Header from "@components/common/Header";
import Footer from "@components/common/Footer";
import { Outlet } from "react-router-dom";

const DiscoverLayout = () => {
  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
};

export default DiscoverLayout;
