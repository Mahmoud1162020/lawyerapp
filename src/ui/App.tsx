import { useEffect, useState } from "react";
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
import SuperAdmin from "./screens/SuperAdmin";
import ActivationContact from "./components/ActvationCoantact";
import { useAppDispatch } from "./store";
import { setUser } from "./store/slices/usersSlice";
import { useSelector } from "react-redux";
import { RootState } from "./types";
import { useAuthUser } from "./helper/useAuthUser";
import NoPermission from "./components/NoPermission";

function App() {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [activationAlert, setActivationAlert] = useState(false);
  const { user } = useSelector((state: RootState) => state.user);
  console.log(user);

  const dispatch = useAppDispatch();
  useEffect(() => {
    const unsub = window.electron.subscribeStatistics((stats) =>
      console.log("===>", stats)
    );
    return unsub;
  }, []);
  const userPermission = useAuthUser();
  useEffect(() => {
    console.log("User Permissions:", userPermission);
  }, [userPermission]);

  useEffect(() => {
    const fetchUsers = async () => {
      const user = await window.electron.getUser();

      const parsedUerPermissions =
        user && typeof user.permissions === "string"
          ? JSON.parse(user.permissions || "{}")
          : user?.permissions || {};

      const userWithPermissions = {
        ...user,
        permissions: parsedUerPermissions,
      };
      console.log("====================================");
      console.log(userWithPermissions);
      console.log("====================================");
      dispatch(setUser(userWithPermissions));
      console.log("====================================");
      console.log("User Info:", userWithPermissions);
      console.log("====================================");
    };
    fetchUsers();
  }, [dispatch]);

  useEffect(() => {
    const activationStatus = async () => {
      const activationCodes = await window.electron.getActivationCodes();

      //get the newest code
      const newestCode = activationCodes.reduce((latest, current) => {
        return new Date(latest.createdAt) > new Date(current.createdAt)
          ? latest
          : current;
      }, activationCodes[0]);

      if (newestCode && newestCode.status === "active") {
        setActivationAlert(false);
      } else {
        setActivationAlert(true);
      }
    };
    activationStatus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "a"
      ) {
        console.log("Control/Command + Shift + A pressed", event);
        setShowAdminModal((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (showAdminModal) {
    return <SuperAdmin />;
  }
  if (activationAlert) {
    return <ActivationContact />;
  }
  return (
    <Router>
      <Navbar />
      {/* <SecondNav /> */}
      <ToastContainer position="top-right" autoClose={3000} newestOnTop rtl />
      <Routes>
        {userPermission?.permissions.reports ? (
          <Route path="/" element={<Reports />} />
        ) : (
          <Route path="/" element={<NoPermission />} />
        )}
        {userPermission?.permissions.reports ? (
          <Route path="/reports" element={<Reports />} />
        ) : (
          <Route path="/reports" element={<NoPermission />} />
        )}
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
