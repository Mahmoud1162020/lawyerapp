import React, { useState } from "react";
import "./SecondNav.css";
import { useAppSelector } from "../store";

const tabData = [
  { id: "tab1", label: "الحقل الأول", content: "محتوى الحقل الأول" },
  { id: "tab2", label: "الحقل الثاني", content: "محتوى الحقل الثاني" },
  { id: "tab3", label: "الحقل الثالث", content: "محتوى الحقل الثالث" },
  { id: "tab4", label: "الحقل الرابع", content: "محتوى الحقل الرابع" },
];

export function SecondNav() {
  const [activeTab, setActiveTab] = useState("tab1");
  const { navName } = useAppSelector((state) => state.nav);
  console.log("===>", navName);
  return (
    <div className="tabs-container" dir="rtl">
      {/* Tab buttons */}
      <div className="tabs-list">
        {tabData.map((tab) => (
          <button
            key={tab.id}
            className={`tabs-trigger ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tabData.map((tab) => (
        <div
          key={tab.id}
          className={`tabs-content ${activeTab === tab.id ? "active" : ""}`}>
          <h2 className="tabs-title">{tab.label}</h2>
          <p>{tab.content}</p>
        </div>
      ))}
    </div>
  );
}
