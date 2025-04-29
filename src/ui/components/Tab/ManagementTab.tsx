import { useState } from "react";

import "./styles.css";
import ManageTabContent from "./ManageTabContent";

export default function Home() {
  const [activeTab, setActiveTab] = useState("outgoing");

  const tabs = [
    {
      id: "time",
      label: new Date().toLocaleDateString(),
    },

    { id: "Tenants", label: "المستأجرين" },
    { id: "Procedures", label: "المعاملات" },
    { id: "realState", label: "العقارات" },
    { id: "customersAccount", label: "حساب العملاء" },
  ];

  return (
    <div className="page-container">
      <div className="tab-card">
        <div className="tab-header">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="tab-content-container">
          <ManageTabContent activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
}
