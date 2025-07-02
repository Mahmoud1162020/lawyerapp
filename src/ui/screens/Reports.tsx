import React, { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import "./Reports.css";
import InfoModal from "../components/Modal/InfoModal";

// Add Customer type definition here

type RealState = {
  id: number;
  propertyTitle: string;
  propertyNumber: string;
  address: string;
  price: number;
  date: string;
  details: string | null;
  owners: { id: number; name: string }[];
  isSold?: number;
  isRented?: number;
  credit?: number;
  debit?: number;
};

function getMonthKey(dateStr: string) {
  return dateStr ? dateStr.slice(0, 7) : "unknown";
}

function getPercentageChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;

  return Math.round(((current - previous) / previous) * 100);
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState("properties");
  const [realstates, setRealStates] = useState<RealState[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]); // Replace 'any' with actual Procedure type if available
  const [tenants, setTenants] = useState<TenantResponse[]>([]); // Replace 'any' with actual Tenant type if available
  const [barData, setBarData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<
    { id: number; value: number; label: string }[]
  >([]);
  const [percentChange, setPercentChange] = useState(0);
  const [customersAccounts, setCustomersAccounts] = useState<Customer[]>([]);
  const [newUsers, setNewUsers] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [userRelatedInfo, setUserRelatedInfo] = useState<{
    realStates: RealState[];
    tenants: TenantResponse[];
    procedures: Procedure[];
    transactions: [];
  }>({
    realStates: [],
    tenants: [],
    procedures: [],
    transactions: [],
  });

  function valueFormatter(value: number | null) {
    return `${value}`;
  }

  useEffect(() => {
    const fetchCustomersAccounts = async () => {
      const res = await window.electron.getAllCustomersAccounts();
      console.log("Fetched customers accounts:", res);
      if (res) {
        // Ensure debit and credit fields exist for each customer
        setCustomersAccounts(res);

        // Group users by month
        const grouped: Record<string, Customer[]> = {};
        res.forEach((user: Customer) => {
          const month = getMonthKey(user.date);
          if (!grouped[month]) grouped[month] = [];
          grouped[month].push(user);
        });

        // Get months sorted descending
        const months = Object.keys(grouped).sort().reverse();
        const currentMonth = months[0];
        const prevMonth = months[1];

        const currentCount = currentMonth ? grouped[currentMonth].length : 0;
        const prevCount = prevMonth ? grouped[prevMonth].length : 0;

        setNewUsers(currentCount - prevCount);
      }
    };
    fetchCustomersAccounts();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      const res = await window.electron.getAllRealStates();
      // Ensure isSold and isRented are present (default to 0 if missing)
      const normalized = res.map((rs: RealState) => ({
        ...rs,
        isSold: typeof rs.isSold === "number" ? rs.isSold : 0,
        isRented: typeof rs.isRented === "number" ? rs.isRented : 0,
      }));
      setRealStates(normalized);

      // Group by month
      const grouped: Record<string, RealState[]> = {};
      res.forEach((rs) => {
        const month = getMonthKey(rs.date);
        if (!grouped[month]) grouped[month] = [];
        grouped[month].push(rs);
      });

      // Get months sorted descending
      const months = Object.keys(grouped).sort().reverse();

      const currentMonth = months[0];
      const prevMonth = months[1];

      const currentCount = currentMonth ? grouped[currentMonth].length : 0;

      const prevCount = prevMonth ? grouped[prevMonth].length : 0;

      setPercentChange(getPercentageChange(currentCount, prevCount));

      // Group by month (or year-month)
      const monthlyData: Record<
        string,
        { متاح: number; مباع: number; مؤجر: number }
      > = {};

      res.forEach((rs: RealState) => {
        // Extract month from date (YYYY-MM-DD)
        const month = rs.date ? rs.date.slice(0, 7) : "unknown";
        if (!monthlyData[month])
          monthlyData[month] = { متاح: 0, مباع: 0, مؤجر: 0 };
        if (rs.isSold) monthlyData[month].مباع += 1;
        else if (rs.isRented) monthlyData[month].مؤجر += 1;
        else monthlyData[month].متاح += 1;
      });

      // Convert to array for BarChart
      const barArr = Object.entries(monthlyData).map(([month, vals]) => ({
        month,
        available: vals.متاح,
        sold: vals.مباع,
        rented: vals.مؤجر,
      }));
      setBarData(barArr);
      console.log("Bar data:", barArr);

      // Pie chart data (totals)
      const totalAvailable = res.filter(
        (rs: RealState) => !rs.isSold && !rs.isRented
      ).length;
      const totalSold = res.filter((rs: RealState) => rs.isSold).length;
      const totalRented = res.filter((rs: RealState) => rs.isRented).length;
      setChartData([
        { id: 0, value: totalAvailable, label: "متاح" },
        { id: 1, value: totalSold, label: "مباع" },
        { id: 2, value: totalRented, label: "مؤجر" },
      ]);
    };
    fetchData();
  }, []);
  useEffect(() => {
    const fetchTenants = async () => {
      const res: TenantResponse[] = await window.electron.getAllTenants();
      console.log("Fetched tenants:", res);
      if (res) {
        setTenants(res);
      }
    };
    fetchTenants();
  }, []);

  useEffect(() => {
    const fetchProcedures = async () => {
      const res: Procedure[] = await window.electron.getAllProcedures();
      console.log("Fetched procedures:", res);

      if (res) {
        setProcedures(res);
        console.log("Fetched procedures:", res);
      }
    };
    fetchProcedures();
  }, []);
  const showInfo = async (user: Customer) => {
    console.log("Show info clicked", user);
    const userRealStates = realstates.filter((rs) =>
      rs.owners.some((owner) => owner.id === user.id)
    );
    const userTenants = tenants.filter((t) =>
      t.tenantNames.includes(user.name)
    );
    console.log("User Tenants:", userTenants);

    setUserRelatedInfo({
      realStates: userRealStates,
      tenants: userTenants,
      procedures: procedures,
      transaction: [],
    });

    // const userTenants = tenants.filter(tenant => tenant.id === user.id);

    // const userProcedures = procedures.filter(proc => proc.customerId === user.id);

    console.log("User RealStates:", userRealStates);
    // console.log("User Tenants:", userTenants);
    // console.log("User Procedures:", userProcedures);
    setShowModal(true);
  };

  return (
    <div className="dashboard-container" dir="rtl">
      <InfoModal
        showModal={showModal}
        setShowModal={setShowModal}
        info={userRelatedInfo}
      />
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
          <div className="dashboard-card-value">{realstates?.length}</div>
          <div className="dashboard-card-desc">
            {percentChange >= 0 ? "+" : ""}
            {percentChange}% عن الشهر الماضي
          </div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-title">العملاء </div>
          <div className="dashboard-card-value">
            {customersAccounts?.length}
          </div>
          <div className="dashboard-card-desc">
            {newUsers >= 0 ? "+" : ""}
            {newUsers} عملاء جدد
          </div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-title">المستأجرون الحاليون</div>
          <div className="dashboard-card-value">{tenants.length}</div>
          <div className="dashboard-card-desc">
            {(tenants.length / realstates.length) * 100}%
          </div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-title"> المعاملات</div>
          <div className="dashboard-card-value">{procedures.length}</div>
        </div>
        {/* <div className="dashboard-card">
          <div className="dashboard-card-title"> money box</div>
          <div className="dashboard-card-value">$380,000</div>
          <div className="dashboard-card-desc">+18% عن الشهر الماضي</div>
        </div> */}
        {/* TODO:add the money box for the owner of office  */}
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === "properties" ? "active" : ""}
          onClick={() => setActiveTab("properties")}>
          العقارات
        </button>
        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}>
          المستخدمون
        </button>
        <button
          className={activeTab === "tenants" ? "active" : ""}
          onClick={() => setActiveTab("tenants")}>
          المستأجرون
        </button>
        <button
          className={activeTab === "procedures" ? "active" : ""}
          onClick={() => setActiveTab("procedures")}>
          المعاملات
        </button>
      </div>

      {/* Tab Content */}
      <div className="dashboard-tab-content">
        {activeTab === "properties" && (
          <>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexDirection: "row-reverse",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "flex-start",
                width: "100%",
                margin: "auto",
              }}>
              <div
                style={{
                  flex: "1 1 350px",
                  minWidth: 0,
                  maxWidth: 700,
                }}>
                <BarChart
                  dataset={barData}
                  xAxis={[{ dataKey: "month" }]}
                  series={[
                    { dataKey: "available", label: "متاح", valueFormatter },
                    { dataKey: "sold", label: "مباع", valueFormatter },
                    { dataKey: "rented", label: "مؤجر", valueFormatter },
                  ]}
                  height={300}
                  width={600}
                  sx={{ width: "100%" }}

                  // Responsive width
                />
              </div>
              <div style={{ flex: "0 1 280px", minWidth: 180, maxWidth: 600 }}>
                <PieChart
                  series={[
                    {
                      data: chartData,
                    },
                  ]}
                  height={300}
                  sx={{ width: "100%" }}
                  // Responsive width
                />
              </div>
            </div>
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
                  <th>له</th>
                  <th>عليه</th>

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
                    <td>{rs.credit}</td>
                    <td>{rs.debit}</td>
                    <td>{rs.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === "users" && (
          <>
            <h2>العملاء</h2>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>المعرف</th>
                  <th>الاسم</th>
                  {/* <th>الدور</th> */}
                  <th>العنوان</th>
                  <th>رقم الهاتف</th>
                  <th>التفاصيل</th>
                  <th>له</th>
                  <th>عليه</th>
                </tr>
              </thead>
              <tbody>
                {customersAccounts.map((user) => (
                  <tr key={user.id} onClick={() => showInfo(user)}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    {/* <td>{user.role}</td> */}
                    <td>{user.address}</td>
                    <td>{user.phone}</td>
                    <td>{user.details}</td>
                    <td>{user.credit}</td>
                    <td>{user.debit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === "tenants" && (
          <>
            <h2> المستأجرين</h2>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>المعرف</th>
                  <th>الاسم</th>
                  <th>العقار</th>
                  <th>الإيجار الشهري</th>
                  <th>الحالة</th>
                  <th>بداية العقد</th>

                  <th>نهاية العقد</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>{tenant.id}</td>
                    <td>
                      {tenant.tenantNames && tenant.tenantNames.length > 0
                        ? (
                            (typeof tenant.tenantNames === "string"
                              ? JSON.parse(tenant.tenantNames)
                              : tenant.tenantNames) as string[]
                          ).map((i, idx) => <span key={idx}>{i}</span>)
                        : "N/A"}
                    </td>
                    <td>{tenant.propertyDetails.propertyTitle}</td>
                    <td>{tenant.installmentAmount}</td>
                    <td>{tenant.contractStatus}</td>
                    <td>{tenant.startDate}</td>
                    <td>{tenant.endDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {activeTab === "procedures" && (
          <>
            <h2>المعاملات </h2>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>رقم المعاملة</th>
                  <th>نوع المعاملة</th>
                  <th>الحالة</th>
                  <th>تفاصيل</th>
                  <th>صاحب المعاملة</th>
                  <th> له</th>

                  <th>عليه</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {procedures.map((procedure) => (
                  <tr key={procedure.id}>
                    <td>{procedure.procedureNumber}</td>
                    <td>{procedure.procedureName}</td>

                    <td>{procedure.status}</td>
                    <td>{procedure.description}</td>
                    <td>
                      {procedure?.owners?.map((po) => po?.name).join(" , ")}
                    </td>
                    <td>{procedure.credit}</td>
                    <td>{procedure.debit}</td>
                    <td>{procedure.date}</td>
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
