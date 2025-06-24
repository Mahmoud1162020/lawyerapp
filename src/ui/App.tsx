import { useEffect } from "react";
import { Routes, HashRouter as Router, Route } from "react-router-dom"; // <-- Use HashRouter
import "./App.css";
import Navbar from "./components/NavBar";
import Reports from "./screens/Reports";
import Cash from "./screens/Cash";
import Management from "./screens/Management";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomerDetails from "./components/Details/CustomerDetails";
import RealStateDetails from "./components/Details/RealStateDetails";
import Register from "./components/Register";
import ProcedureDetails from "./components/Details/ProcedureDetails";
import TenantsDetails from "./components/Details/TenantsDetails";
import OutgoingTransactionDetails from "./components/Details/OutgoingTransactionDetails";
import OutgoingPersonalTransactionDetails from "./components/Details/OutgoigPersonalTransactionDetails";
import IncomingPersonalTransactionDetails from "./components/Details/incomingPersonalTransactionDetails";
import ProcedureIncomingDetails from "./components/Details/ProcedureIncomingDetails";
import TenantTransactionDetails from "./components/Details/TenantTransactionDetails";
import InternatTransactionDetails from "./components/Details/InternatTransactionDetails";

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
        <Route path="/real-state-details/:id" element={<RealStateDetails />} />
        {/* tenantContract */}
        <Route path="/tenantContract/:id" element={<TenantsDetails />} />
        <Route path="/procedure-details/:id" element={<ProcedureDetails />} />
        <Route
          path="/tenant-transaction-details/:transactionId"
          element={<TenantTransactionDetails />}
        />
        <Route
          path="/outgoing-transaction-details/:id"
          element={<OutgoingTransactionDetails />}
        />
        <Route
          path="/outgoing-personal-transaction-details/:id"
          element={<OutgoingPersonalTransactionDetails />}
        />
        <Route
          path="/personalTransaction-incoming-details/:id"
          element={<IncomingPersonalTransactionDetails />}
        />
        <Route
          path="/procedure-incoming-details/:id"
          element={<ProcedureIncomingDetails />}
        />
        <Route path="/details/:id" element={<CustomerDetails />} />
        {/* Add other routes here */}
        <Route path="/register" element={<Register />} />
        <Route
          path="/internal-transaction-details/:transactionId"
          element={<InternatTransactionDetails />}
        />
      </Routes>
    </Router>
  );
}

export default App;
