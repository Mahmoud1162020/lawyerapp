import React, { useEffect, useState } from "react";
import LoginModal from "./Modal/LoginModal";
import { LogOut } from "lucide-react";

interface UserStatus {
  isLoggedIn: boolean;
  username?: string;
}

const UserStatus: React.FC = () => {
  const [userStatus, setUserStatus] = useState<UserStatus>({
    isLoggedIn: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogin = () => {
    console.log("Redirecting to login...");
    // Add your login navigation logic here
    setIsModalOpen(false);
  };
  useEffect(() => {
    window.electron.getUser().then((user: User) => {
      if (user) {
        console.log("==============user======================");
        console.log(user);
        console.log("====================================");
        window.electron.setUser(user);
      }
    });
    // Listen for user status updates
  }, []);

  useEffect(() => {
    // Listen for user status updates
    window.electron.onUserStatusUpdate((status: UserStatus) => {
      setUserStatus(status);
    });
  }, []);

  return (
    <div>
      {userStatus.isLoggedIn ? (
        // <div>
        //   <p>Welcome, {userStatus.username}!</p>
        //   <button onClick={() => window.electron.logout()}>Logout</button>
        // </div>
        <button
          className="navbar-link"
          onClick={() => window.electron.logout()}>
          <LogOut className="icon" />
          تسجيل الخروج
        </button>
      ) : (
        <div>
          <LoginModal
            isOpen={!userStatus.isLoggedIn}
            onClose={() => setIsModalOpen(false)}
            onLogin={handleLogin}
          />

          {/* <button onClick={() => window.electron.login("username", "password")}>
            Login
          </button> */}
        </div>
      )}
    </div>
  );
};

export default UserStatus;
