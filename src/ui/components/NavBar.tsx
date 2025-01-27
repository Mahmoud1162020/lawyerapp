import React, { useState } from "react";
import {
  Menu,
  X,
  FileText,
  Users,
  LogOut,
  CircleDollarSign,
} from "lucide-react";
import "./NavBar.css";
import { useAppDispatch, useAppSelector } from "../store";
import { navState } from "../store/slices/navSlice";

const navItems = [
  { name: "النقد", href: "/real-estate", icon: CircleDollarSign, itemId: 0 },
  { name: "تقرير", href: "/reports", icon: FileText, itemId: 1 },
  { name: "ادارة", href: "/customers", icon: Users, itemId: 2 },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { navName } = useAppSelector((state) => state.nav);
  console.log(navName);

  const handleExit = async () => {
    console.log("====================================");
    console.log("Exit");
    console.log("====================================");
    window.electron.sendExit(); // Send the exit event to the main process
  };
  const handleSubmit = async (item: number) => {
    try {
      console.log(item);
      dispatch(navState(item));
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-header">
          {/* <Link to="/" className="brand-name">
            App Name
          </Link> */}
          <div className="menu-toggle">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="toggle-button">
              {isOpen ? <X className="icon" /> : <Menu className="icon" />}
            </button>
          </div>
        </div>
        <div className={`navbar-links ${isOpen ? "open" : ""}`}>
          {navItems.map((item) => (
            <button
              key={item.name}
              className="navbar-button"
              onClick={() => handleSubmit(item.itemId)}>
              <item.icon className="icon" />
              {item.name}
            </button>
          ))}

          <button className="navbar-link" onClick={handleExit}>
            <LogOut className="icon" />
            تسجيل الخروج
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
