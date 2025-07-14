import React from "react";
import "./LoginModal.css";
import Login from "../Login";
import Register from "../Register";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  userStatus: {
    isLoggedIn: boolean;
    username?: string;
  };
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  userStatus,
}) => {
  if (!isOpen) return null;
  console.log(userStatus);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>تسجيل الدخول</h2>
        <p>يرجى تسجيل الدخول لمتابعة استخدام التطبيق.</p>
        <div className="modal-buttons">
          {!userStatus.isLoggedIn && <Login />}
          {/* <Register /> */}
          {/* <button className="login-btn" onClick={onLogin}>
            تسجيل الدخول
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
