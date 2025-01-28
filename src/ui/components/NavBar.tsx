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
import UserStatus from "./UserStatus";
import { Link } from "react-router-dom";

const navItems = [
  { name: "النقد", href: "/cash", icon: CircleDollarSign, itemId: 0 },
  { name: "تقرير", href: "/reports", icon: FileText, itemId: 1 },
  { name: "ادارة", href: "/manage", icon: Users, itemId: 2 },
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
    window.electron.logout(); // Send the exit event to the main process
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
        <div className="status">
          <UserStatus />
        </div>
        <div className="navbar-header">
          {/* <Link to="/customer" className="brand-name">
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
            <Link to={item.href} className="navbar-link" style={{}}>
              <button
                style={{
                  textDecoration: "none",
                  color: "black",
                }}
                key={item.name}
                onClick={() => handleSubmit(item.itemId)}>
                <item.icon className="icon" style={{}} />
                {item.name}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
