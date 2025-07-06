import { useEffect, useState } from "react";
import "./styles.css";
import TabContent from "./TabContent";
import FinancialTable from "../Tables/FinancialTable";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store";
import { addCredit, addDebit } from "../../store/slices/financeSlice";

export default function CashTab() {
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<string>("outgoing");
  const location = useLocation();
  const navigate = useNavigate();
  const [totalIncoming, setTotalIncoming] = useState(0);
  const [totalOutgoing, setTotalOutgoing] = useState(0);
  const [transactions, setTransactions] = useState<{
    proceduresTransactions: Transaction[]; // Replace with actual transaction type if available
    personalTransactions: PersonalTransaction[]; // Replace with actual personal transaction type if available
    internalTransactions: InternalTransaction[]; // Replace with actual internal transaction type if available
  }>({
    proceduresTransactions: [],
    personalTransactions: [],
    internalTransactions: [],
  });

  useEffect(() => {
    console.log("Active tab changed:", location.state);
    if (location.state?.activeTab) setActiveTab(location.state?.activeTab);
  }, []);
  const tabs = [
    { id: "outgoing", label: "صادر" },
    { id: "incoming", label: "وارد" },
    { id: "internal", label: "قيد داخلي" },
  ];

  useEffect(() => {
    const fetchTransactions = async () => {
      const proceduresTransactions = await window.electron.getAllTransactions();
      const PersonalTransactions =
        await window.electron.getAllPersonalTransactions();
      const InternalTransactions =
        await window.electron.getAllInternalTransactions();
      console.log("Fetched procedures transactions:", proceduresTransactions);
      console.log("Fetched personal transactions:", PersonalTransactions);
      console.log("Fetched internal transactions:", InternalTransactions);

      setTransactions({
        proceduresTransactions,
        personalTransactions: PersonalTransactions,
        internalTransactions: InternalTransactions,
      });
      console.log("Fetched transactions:", {
        proceduresTransactions,
        personalTransactions: PersonalTransactions,
        internalTransactions: InternalTransactions,
      });
    };

    fetchTransactions();
  }, [dispatch, activeTab]);
  useEffect(() => {
    let totalIncoming = 0;
    let totalOutgoing = 0;

    // Procedure Transactions
    if (transactions?.proceduresTransactions) {
      transactions?.proceduresTransactions.forEach((t) => {
        if (t.transactionType === "incoming") totalIncoming += Number(t.amount);
        else if (t.transactionType === "outgoing")
          totalOutgoing += Number(t.amount);
      });
    }

    if (transactions?.personalTransactions) {
      transactions?.personalTransactions.forEach((t) => {
        if (t.transactionType === "incoming") totalIncoming += Number(t.amount);
        else if (t.transactionType === "outgoing")
          totalOutgoing += Number(t.amount);
      });
    }
    setTotalIncoming(totalIncoming);
    setTotalOutgoing(totalOutgoing);
    console.log(totalIncoming, totalOutgoing);
    dispatch(addCredit(totalIncoming));
    dispatch(addDebit(totalOutgoing));
  }, [
    transactions?.personalTransactions,
    transactions?.proceduresTransactions,
    dispatch,
  ]);

  return (
    <div className="container">
      <div className="tabs-container">
        <div className="tabs">
          <FinancialTable />
          <div></div>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>
        {/* New flex container for side-by-side layout */}
        <div>
          <TabContent activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
}
