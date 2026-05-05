import { useContext, useState } from "react";
import { CurrentUserContext } from "../lib/contexts/CurrentUserContext";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { RxHamburgerMenu, RxCross1 } from "react-icons/rx";
import { NavHashLink } from "react-router-hash-link";
import eldcarelogohori from "../../public/eldcarelogohori.png";
import { IoMdHome } from "react-icons/io";
import { MdDashboard } from "react-icons/md";
import { IoIosFolder } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import { FaGear } from "react-icons/fa6";
import { IoPersonOutline } from "react-icons/io5";
import { TbDoorExit } from "react-icons/tb";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUserContext = useContext(CurrentUserContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.setItem("access_token", "");
    currentUserContext?.setCurrentUser(null);
    navigate("/auth/sign-in");
  };

  const getLinkClass = (path: string) => {
    const currentPath = location.pathname + location.hash;
    const isHome = path === "/#home" && (currentPath === "/" || currentPath === "/#home");
    const isActive = isHome || currentPath === path;

    return `block rounded-md px-4 py-2 transition-all duration-200 ${
      isActive
        ? "bg-[#F1E1B4] font-bold text-gray-900 shadow-xl"
        : "font-medium text-gray-600 hover:bg-gray-200 hover:text-blue-900"
    }`;
  };

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-white shadow-md z-[60] flex items-center justify-between px-6">
        <NavLink to="/" className="text-2xl font-bold tracking-wide text-blue-700">
        </NavLink>
        <button onClick={() => setIsMobileMenuOpen(true)}>
          <RxHamburgerMenu size={30} />
        </button>
      </div>

      <aside
        className={`fixed left-0 top-0 z-[100] flex h-screen w-64 flex-col justify-between bg-white shadow-xl transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex flex-col p-6">
          <div className="flex items-center justify-between pb-8">
            <NavLink to="/" className="text-2xl font-bold tracking-wide text-blue-700">
              <img src={eldcarelogohori} width="100%"/>
            </NavLink>
            <button
              className="md:hidden text-gray-500 hover:text-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <RxCross1 size={24} />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            <NavHashLink
              to="/#home"
              smooth
              className={getLinkClass("/#home")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex flex-row items-center gap-2">
                <IoMdHome size={18} />
                <p>Home</p>
              </div>
            </NavHashLink>
            <NavLink
              to="/dashboard"
              className={getLinkClass("/dashboard")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex flex-row items-center gap-2">
                <MdDashboard size={18} />
                <p>Dashboard</p>
              </div>
            </NavLink>
            <NavLink
              to="/repos"
              className={getLinkClass("/repos")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex flex-row items-center gap-2">
                <IoIosFolder size={18} />
                <p>Med. Records</p>
              </div>
            </NavLink>
            <NavLink
              to="/notifications"
              className={getLinkClass("/notifications")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex flex-row items-center gap-2">
                <MdEmail size={18}/>
                <p>Notifications</p>
              </div>
            </NavLink>
            <NavLink
              to="/settings"
              className={getLinkClass("/settings")}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="flex flex-row items-center gap-2">
                <FaGear size={18}/>
                <p>Settings</p>
              </div>
            </NavLink>
          </nav>
        </div>

        <div className="p-6 border-t border-gray-100">
          {currentUserContext?.currentUser?.username ? (
            <div className="flex flex-col gap-2">
              <div className="shadow-lg bg-gradient-to-b from-[#B3CEFF] to-#FFFFFF hover:bg-gray-200 rounded-xl flex flex-row items-center align-center justify-center">
                <IoPersonOutline size={18}/>
                <NavLink 
                  to={`/profile/${currentUserContext.currentUser.username}`}
                  className={getLinkClass(`/profile/${currentUserContext.currentUser.username}`)}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex-col">
                    <div className="text-xs font-bold">{currentUserContext?.currentUser?.username?.split(" ")[0]}</div>
                    <div className="text-xs">Example@gmail.com</div>
                  </div>
                </NavLink>
              </div>
              <button
                className="block w-full text-left rounded-md px-4 py-2 font-medium text-blue-900 hover:bg-blue-50 transition-all duration-200"
                onClick={handleLogout}
              >
                <div className="flex flex-row items-center gap-2">
                  <TbDoorExit size={18} />
                  <p>Log Out</p>
                </div>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 font-medium">
              <NavLink
                to="/auth/sign-up"
                className={getLinkClass("/auth/sign-up")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </NavLink>
              <NavLink
                to="/auth/sign-in"
                className="block rounded-md bg-[#00bf33] px-4 py-2 text-center text-white hover:bg-green-800 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </NavLink>
            </div>
          )}
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Navbar;