import React from "react";
import "./LoginModal.css";
import Login from "../Login";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>تسجيل الدخول</h2>
        <p>يرجى تسجيل الدخول لمتابعة استخدام التطبيق.</p>
        <div className="modal-buttons">
          <Login />
          {/* <button className="login-btn" onClick={onLogin}>
            تسجيل الدخول
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
