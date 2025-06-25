import React, { useEffect, useState } from "react";
import "./Reports.css";

const users = [
  {
    id: "U001",
    name: "John Smith",
    role: "Agent",
    properties: 12,
    lastActive: "2024-06-15",
    status: "Active",
  },
  // ... more users
];

const tenants = [
  {
    id: "T001",
    name: "Alice Cooper",
    property: "456 Oak Ave",
    rent: "$2,800",
    status: "Current",
    leaseEnd: "2025-03-15",
  },
  // ... more tenants
];

const transactions = [
  {
    id: "TX001",
    type: "Sale",
    property: "123 Main St",
    amount: "$450,000",
    date: "2024-06-15",
    status: "Completed",
  },
  // ... more transactions
];

const TABS = [
  { key: "properties", label: "العقارات" },
  { key: "users", label: "المستخدمون" },
  { key: "tenants", label: "المستأجرون" },
  { key: "transactions", label: "المعاملات" },
];

type RealState = {
  id: number;
  propertyTitle: string;
  propertyNumber: string;
  address: string;
  price: number;
  date: string;
  details: string | null;
  owners: { id: number; name: string }[];
  isSold?: boolean;
  isRented?: boolean;
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState("properties");
  const [realstates, setRealStates] = useState<RealState[]>([]);
  useEffect(() => {
    // Simulate fetching data
    const fetchData = async () => {
      // Replace with actual data fetching logic
      const res = await window.electron.getAllRealStates();
      console.log("Fetched Real States:", res);

      setRealStates(res);
    };
    fetchData();
  }, []);
  return (
    <div className="dashboard-container" dir="rtl">
      <div className="dashboard-header">
        <div>
          {/* <h1>لوحة تقارير العقارات</h1>
          <p>تحليلات شاملة لأعمالك العقارية</p> */}
        </div>
        <div>
          {/* <button className="dashboard-btn">تصدير التقارير</button> */}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="dashboard-metrics">
        <div className="dashboard-card">
          <div className="dashboard-card-title">إجمالي العقارات</div>
          <div className="dashboard-card-value">247</div>
          <div className="dashboard-card-desc">+12% عن الشهر الماضي</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-title">المستخدمون النشطون</div>
          <div className="dashboard-card-value">45</div>
          <div className="dashboard-card-desc">+3 مستخدمين جدد</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-title">المستأجرون الحاليون</div>
          <div className="dashboard-card-value">189</div>
          <div className="dashboard-card-desc">نسبة الإشغال 95%</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-title">الإيرادات الشهرية</div>
          <div className="dashboard-card-value">$380,000</div>
          <div className="dashboard-card-desc">+18% عن الشهر الماضي</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="dashboard-tab-content">
        {activeTab === "properties" && (
          <>
            <h2>العقارات </h2>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>المعرف</th>
                  <th>اسم العقار</th>
                  <th>العنوان</th>
                  {/* <th>النوع</th> */}
                  <th>الحالة</th>
                  {/* <th>السعر</th> */}
                  <th>اصحاب العقار</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {realstates?.map((rs) => (
                  <tr key={rs.id}>
                    <td>{rs.id}</td>
                    <td>{rs.propertyTitle}</td>
                    <td>{rs.address + "/" + rs.propertyNumber}</td>
                    {/* <td>{rs.type}</td> */}
                    <td>
                      <span>
                        {rs.isSold ? "مباع" : rs.isRented ? "مؤجر" : "متاح"}
                      </span>
                    </td>
                    {/* <td>{rs.price}</td> */}
                    <td>
                      {rs.owners.length > 0
                        ? rs.owners.map((owner) => owner.name).join(", ")
                        : "لا يوجد مالك"}
                    </td>
                    <td>{rs.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === "users" && (
          <>
            <h2>إدارة المستخدمين</h2>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>المعرف</th>
                  <th>الاسم</th>
                  <th>الدور</th>
                  <th>عدد العقارات</th>
                  <th>آخر نشاط</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.role}</td>
                    <td>{user.properties}</td>
                    <td>{user.lastActive}</td>
                    <td>
                      <span
                        className={`badge badge-${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === "tenants" && (
          <>
            <h2>إدارة المستأجرين</h2>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>المعرف</th>
                  <th>الاسم</th>
                  <th>العقار</th>
                  <th>الإيجار الشهري</th>
                  <th>الحالة</th>
                  <th>نهاية العقد</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>{tenant.id}</td>
                    <td>{tenant.name}</td>
                    <td>{tenant.property}</td>
                    <td>{tenant.rent}</td>
                    <td>
                      <span
                        className={`badge badge-${tenant.status.toLowerCase()}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td>{tenant.leaseEnd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === "transactions" && (
          <>
            <h2>المعاملات الحديثة</h2>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>المعرف</th>
                  <th>النوع</th>
                  <th>العقار</th>
                  <th>المبلغ</th>
                  <th>التاريخ</th>
                  <th>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td>{transaction.type}</td>
                    <td>{transaction.property}</td>
                    <td>{transaction.amount}</td>
                    <td>{transaction.date}</td>
                    <td>
                      <span
                        className={`badge badge-${transaction.status.toLowerCase()}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
