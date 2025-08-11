import React from "react";

const ActivationContact = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)",
      }}>
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px #0001",
          padding: "40px 32px",
          maxWidth: 400,
          textAlign: "center",
        }}>
        <div
          style={{
            fontSize: "2.5rem",
            color: "#d32f2f",
            marginBottom: 16,
          }}>
          <span role="img" aria-label="alert">
            ⚠️
          </span>
        </div>
        <h2
          style={{
            color: "#1976d2",
            marginBottom: 16,
            fontWeight: "bold",
          }}>
          لم يتم تفعيل التطبيق
        </h2>
        <p
          style={{
            fontSize: "1.1rem",
            color: "#333",
            marginBottom: 24,
          }}>
          يرجى التواصل مع قسم المبيعات لتفعيل التطبيق ومتابعة استخدام جميع
          الميزات.
        </p>
        <div
          style={{
            background: "#f5f7fa",
            borderRadius: 8,
            padding: "16px 8px",
            marginBottom: 12,
            fontWeight: "bold",
            color: "#1976d2",
            fontSize: "1.1rem",
          }}>
          رقم التواصل:{" "}
          <a
            href="tel:+9647759955841"
            style={{ color: "#1976d2", textDecoration: "underline" }}>
            +9647759955841
          </a>
        </div>
        <div
          style={{
            background: "#f5f7fa",
            borderRadius: 8,
            padding: "12px 8px",
            color: "#333",
            fontSize: "0.98rem",
          }}>
          أو عبر البريد:{" "}
          <a
            href="mailto:sales@yourcompany.com"
            style={{ color: "#1976d2", textDecoration: "underline" }}>
            info@ashursoft.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default ActivationContact;
