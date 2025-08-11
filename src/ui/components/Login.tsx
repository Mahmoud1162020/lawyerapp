import React, { useState } from "react";

import { CSSProperties } from "react";
import { useAppDispatch } from "../store";
import { setUser } from "../store/slices/usersSlice";

const styles: { [key: string]: CSSProperties } = {
  container: {
    width: "100%", // Changed `innerWidth` to `width`
    height: "90%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px", // Add spacing between inputs and buttons
  },
  button: {
    width: "200px",
    height: "40px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  input: {
    width: "200px",
    height: "30px",
    padding: "5px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
};

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Retrieve user session on app start

  const handleLogin = async () => {
    try {
      const user: User = await window.electron.login(username, password); // Replace with your actual login logic
      console.log("====================================");
      console.log(user);
      console.log("====================================");
      window.electron.setUser(user);
      console.log("Logged in:", user);
      const userWithParsedPermissions = {
        ...user,
        permissions:
          user && typeof user.permissions === "string"
            ? JSON.parse(user.permissions || "{}")
            : user?.permissions || {},
      };
      dispatch(setUser(userWithParsedPermissions)); // Dispatch user info to Redux store
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder="اسم المستخدم"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={styles.input}
      />
      <input
        type="password"
        placeholder="كلمة المرور"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />
      <button onClick={handleLogin} style={styles.button}>
        تسجيل الدخول
      </button>
    </div>
  );
};

export default Login;
