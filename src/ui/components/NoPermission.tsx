import React from "react";

const NoPermission = () => {
  return (
    <div
      style={{
        maxWidth: 500,
        margin: "80px auto",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 24px #0001",
        padding: 32,
        textAlign: "center",
      }}>
      <h2 style={{ color: "#d32f2f", marginBottom: 16 }}>
        ليس لديك صلاحية الوصول لهذه الصفحة
      </h2>
      <p style={{ color: "#555", fontSize: 18 }}>
        يرجى التواصل مع المسؤول إذا كنت بحاجة إلى صلاحية إضافية.
      </p>
    </div>
  );
};

export default NoPermission;
