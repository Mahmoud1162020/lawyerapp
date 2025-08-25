import React, { useState } from "react";
import "./Register.css";
import { toast, ToastContainer } from "react-toastify";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      const user = await window.electron.register(username, password);
      console.log("Registered:", user);
      // Optionally, show a success message or redirect
      toast("تم تسجيل المستخدم بنجاح");
      setUsername("");
      setPassword("");
    } catch (error) {
      console.error("Registration failed:", error);
      // Optionally, show an error message
      toast("فشل تسجيل المستخدم. يرجى المحاولة مرة أخرى." + error);
    }
  };

  return (
    <div className="register-container">
      <ToastContainer />
      <form
        className="register-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleRegister();
        }}>
        <h2 className="register-title">تسجيل مستخدم جديد</h2>
        <input
          type="text"
          placeholder="اسم المستخدم"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="register-input"
          required
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="register-input"
          required
        />
        <button type="submit" className="register-btn">
          تسجيل
        </button>
      </form>
    </div>
  );
};

export default Register;
