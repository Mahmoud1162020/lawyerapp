import { useEffect } from "react";
import { Routes, BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/NavBar";
import Reports from "./screens/Reports";
import Cash from "./screens/Cash";
import Management from "./screens/Management";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import styles
import TransactionDetails from "./screens/TransactionDetails";
import CustomerDetails from "./components/Details/CustomerDetails";

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
      <ToastContainer position="top-right" autoClose={3000} newestOnTop rtl />

      <Routes>
        <Route path="/reports" element={<Reports />} />
        <Route path="/cash" element={<Cash />} />
        <Route path="/manage" element={<Management />} />
        <Route path="/transaction-details" element={<TransactionDetails />} />
        <Route path="/details/:id" element={<CustomerDetails />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;
