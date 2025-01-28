import React, { useEffect, useState } from "react";

interface UserStatus {
  isLoggedIn: boolean;
  username?: string;
}

const UserStatus: React.FC = () => {
  const [userStatus, setUserStatus] = useState<UserStatus>({
    isLoggedIn: false,
  });

  useEffect(() => {
    // Listen for user status updates
    window.electron.onUserStatusUpdate((status: UserStatus) => {
      setUserStatus(status);
    });
  }, []);

  return (
    <div>
      <h1>Electron + React Authentication</h1>
      {userStatus.isLoggedIn ? (
        <div>
          <p>Welcome, {userStatus.username}!</p>
          <button onClick={() => window.electron.logout()}>Logout</button>
        </div>
      ) : (
        <div>
          <p>Please log in.</p>
          <button onClick={() => window.electron.login("username", "password")}>
            Login
          </button>
        </div>
      )}
    </div>
  );
};

export default UserStatus;
