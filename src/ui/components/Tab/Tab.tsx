import { useEffect, useState } from "react";
import "./styles.css";
import TabContent from "./TabContent";
import FinancialTable from "../Tables/FinancialTable";
import { useLocation, useNavigate } from "react-router-dom";

export default function CashTab() {
  const [activeTab, setActiveTab] = useState<string>("outgoing");
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    console.log("Active tab changed:", location.state);
    if (location.state?.activeTab) setActiveTab(location.state?.activeTab);
  }, []);
  const tabs = [
    { id: "outgoing", label: "صادر" },
    { id: "incoming", label: "وارد" },
    { id: "internal", label: "قيد داخلي" },
  ];

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
