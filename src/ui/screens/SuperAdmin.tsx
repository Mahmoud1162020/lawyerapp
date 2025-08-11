import React, { useState } from "react";
import "./SuperAdmin.css";
import Register from "../components/Register";
import UserManagement from "../components/UserManagement";
import ActivationCode from "../components/ActivationCode";

const adminList = [
  {
    title: "register new user",
    link: "/register",
    id: 1,
  },
  {
    title: "fetch users",
    link: "/fetch-users",
    id: 2,
  },

  {
    title: "activationCode",
    link: "/activation-code",
    id: 4,
  },
];
const SuperAdmin = () => {
  const [selectionId, setSelectionId] = useState<number | null>(null);
  return (
    <div className="super-admin-container">
      <div className="superadmin-header">SuperAdmin</div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          width: "100%",
          justifyContent: "space-around",
        }}>
        <div style={{ width: "30%" }}>
          {adminList.map((item, index) => (
            <div
              key={index}
              className="superadmin-card "
              onClick={() => setSelectionId(item.id)}>
              <p>{item.title}</p>
            </div>
          ))}
        </div>
        <div
          style={{
            width: "60%",
            borderWidth: "1px",
          }}>
          {selectionId === 1 && <Register />}
          {selectionId === 2 && <UserManagement />}
          {selectionId === 4 && <ActivationCode />}
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
