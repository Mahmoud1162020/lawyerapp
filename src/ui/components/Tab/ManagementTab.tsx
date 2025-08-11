import { useEffect, useState } from "react";

import "./styles.css";
import ManageTabContent from "./ManageTabContent";
import { subNav } from "../../store/slices/subNavSlice";
import { useAppDispatch, useAppSelector } from "../../store";

export default function Home() {
  const [activeTab, setActiveTab] = useState("");
  const dispatch = useAppDispatch();
  const { subNavState } = useAppSelector((state) => state.subNav);

  const tabs = [
    {
      id: "admin",
      label: "المدير",
      itemId: 4,
    },

    { id: "Tenants", label: "المستأجرين", itemId: 0 },
    { id: "Procedures", label: "المعاملات", itemId: 1 },
    { id: "realState", label: "العقارات", itemId: 2 },
    { id: "customersAccount", label: "حساب العملاء", itemId: 3 },
  ];
  useEffect(() => {
    setActiveTab(subNavState.toString());
  }, []);
  const handleSubmit = async (item: string) => {
    try {
      console.log(item);
      dispatch(subNav(item));
    } catch (error) {
      console.error("Login failed:", error);
    }
  };
  return (
    <div className="page-container">
      <div className="tab-card">
        <div
          className="tab-header"
          style={{ display: "flex", justifyContent: "space-between" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                handleSubmit(tab.id);
              }}>
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
