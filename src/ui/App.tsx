import { useEffect } from "react";

import { Routes, BrowserRouter as Router, Route } from "react-router-dom";

import "./App.css";

import Navbar from "./components/NavBar";
import { SecondNav } from "./components/SecondNav";
import TestV from "./components/TestV";
import Reports from "./screens/Reports";
import Cash from "./screens/Cash";
import Management from "./screens/Management";

function App() {
  useEffect(() => {
    const unsub = window.electron.subscribeStatistics((stats) =>
      console.log("===>", stats)
    );
    return unsub;
  }, []);
  return (
    <Router>
      <Navbar />
      {/* <SecondNav /> */}

      <Routes>
        <Route path="/reports" element={<Reports />} />
        <Route path="/cash" element={<Cash />} />
        <Route path="/manage" element={<Management />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
