import { useEffect } from "react";

import { BrowserRouter as Router } from "react-router-dom";

import "./App.css";

import Navbar from "./components/NavBar";
import { SecondNav } from "./components/SecondNav";
import Register from "./components/Register";
import Login from "./components/Login";
import UserManagement from "./components/UserManagement";
import UserStatus from "./components/UserStatus";

function App() {
  useEffect(() => {
    const unsub = window.electron.subscribeStatistics((stats) =>
      console.log("===>", stats)
    );
    return unsub;
  }, []);
  return (
    <Router>
      <UserStatus />
      <Navbar />
      <SecondNav />
    </Router>
  );
}

export default App;
