import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect } from "react";

const Layout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen w-screen bg-white">
      <Navbar />
      <div className="flex-1 w-full pt-16 md:pl-64 md:pt-0">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;