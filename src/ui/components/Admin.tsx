import React, { useEffect, useState } from "react";
import UserManagement from "./UserManagement";
import UsersPermissions from "./UsersPermissions";
import Register from "./Register";
import ExportBackup from "./ExportBackup";

const Admin = () => {
  const [selectionId, setSelectionId] = useState<number | null>(null);

  const adminList = [
    {
      title: "تسجيل مستخدم جديد",
      link: "/register",
      id: 1,
    },
    {
      title: "جلب المستخدمين",
      link: "/fetch-users",
      id: 2,
    },

    {
      title: "إدارة الصلاحيات",
      link: "/activation-code",
      id: 3,
    },
    {
      title: "نسخ احتياطي",
      link: "/backup",
      id: 4,
    },
  ];
  return (
    <div className="super-admin-container" dir="rtl">
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          width: "100%",
          justifyContent: "space-around",
        }}>
        <div style={{ width: "10%" }}>
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
            width: "80%",
            borderWidth: "1px",
          }}>
          {selectionId === 1 && <Register />}
          {selectionId === 2 && <UserManagement />}
          {selectionId === 3 && <UsersPermissions />}
          {selectionId === 4 && <ExportBackup />}
        </div>
      </div>
    </div>
  );
};

export default Admin;
