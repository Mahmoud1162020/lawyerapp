import React, { useEffect, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { LineChart } from "@mui/x-charts/LineChart";

import "./Reports.css";
import InfoModal from "../components/Modal/InfoModal";
import { useAuthUser } from "../helper/useAuthUser";

// Add Customer type definition here

function getMonthKey(dateStr: string) {
  return dateStr ? dateStr.slice(0, 7) : "unknown";
}

function getPercentageChange(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;

  return Math.round(((current - previous) / previous) * 100);
}

export default function Reports() {
  const userPermission = useAuthUser();
  console.log("====================================");
  console.log(userPermission);
  console.log("====================================");

  const [incomingPercentChange, setIncomingPercentChange] = useState(0);
  const [outgoingPercentChange, setOutgoingPercentChange] = useState(0);
  const [totalIncoming, setTotalIncoming] = useState(0);
  const [totalOutgoing, setTotalOutgoing] = useState(0);
  const [activeTab, setActiveTab] = useState("properties");
  const [realstates, setRealStates] = useState<realState[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]); // Replace 'any' with actual Procedure type if available
  const [tenants, setTenants] = useState<TenantResponse[]>([]); // Replace 'any' with actual Tenant type if available
  const [barData, setBarData] = useState<
    {
      month: string;
      available: number;
      sold: number;
      rented: number;
    }[]
  >([]);
  const [lineChartData, setLineChartData] = useState<
    { date: string; incoming: number; outgoing: number }[]
  >([]);
  const [chartData, setChartData] = useState<
    { id: number; value: number; label: string }[]
  >([]);
  const [percentChange, setPercentChange] = useState(0);
  const [customersAccounts, setCustomersAccounts] = useState<Customer[]>([]);
  const [newUsers, setNewUsers] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [transactions, setTransactions] = useState<{
    proceduresTransactions: Transaction[]; // Replace with actual transaction type if available
    personalTransactions: PersonalTransaction[]; // Replace with actual personal transaction type if available
    internalTransactions: InternalTransaction[]; // Replace with actual internal transaction type if available
  }>(); // Replace with actual transaction types if available
  const [userRelatedInfo, setUserRelatedInfo] = useState<{
    realStates?: realState[];
    tenants?: TenantResponse[];
    procedures?: Procedure[];
    transactions?: {
      proceduresTransactions: Transaction[];
      personalTransactions: PersonalTransaction[];
      internalTransactions: InternalTransaction[];
    };
    customersAccounts?: Customer[];
  }>({
    realStates: [],
    tenants: [],
    procedures: [],
    transactions: transactions,
    customersAccounts: [],
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
      const normalized = res.map((rs: realState) => ({
        ...rs,
        isSold: typeof rs.isSold === "number" ? rs.isSold : 0,
        isRented: typeof rs.isRented === "number" ? rs.isRented : 0,
      }));
      setRealStates(normalized);

      // Group by month
      const grouped: Record<string, realState[]> = {};
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

      res.forEach((rs: realState) => {
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
        (rs: realState) => !rs.isSold && !rs.isRented
      ).length;
      const totalSold = res.filter((rs: realState) => rs.isSold).length;
      const totalRented = res.filter((rs: realState) => rs.isRented).length;
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
    const userProcedures = procedures.filter((proc) =>
      proc.owners?.some((owner) => owner.id === user.id)
    );
    const userProcedureIds = userProcedures.map((proc) => proc.id);

    // Filter transactions related to the user
    console.log("User Procedures:", userProcedures);

    const userProceduresTransactions =
      transactions?.proceduresTransactions?.filter(
        (t) =>
          userProcedureIds.includes(t.procedureId) && t.type === "procedure"
      ) || [];
    const userPersonalTransactions =
      transactions?.personalTransactions?.filter(
        (t) => String(t.customer_id) === user.id.toString()
      ) || [];
    const userInternalTransactions =
      transactions?.internalTransactions?.filter(
        (t) => t.fromId === user.id || t.toId === user.id
      ) || [];
    setUserRelatedInfo({
      realStates: userRealStates,
      tenants: userTenants,
      procedures: userProcedures,
      transactions: {
        proceduresTransactions: userProceduresTransactions,
        personalTransactions: userPersonalTransactions,
        internalTransactions: userInternalTransactions,
      },
      customersAccounts: customersAccounts,
    });

    // const userTenants = tenants.filter(tenant => tenant.id === user.id);

    // const userProcedures = procedures.filter(proc => proc.customerId === user.id);

    console.log("User RealStates:", userRealStates);
    // console.log("User Tenants:", userTenants);
    // console.log("User Procedures:", userProcedures);
    setShowModal(true);
  };
  useEffect(() => {
    let totalIncoming = 0;
    let totalOutgoing = 0;

    // Procedure Transactions
    if (transactions?.proceduresTransactions) {
      transactions.proceduresTransactions.forEach((t) => {
        if (t.transactionType === "incoming") totalIncoming += Number(t.amount);
        else if (t.transactionType === "outgoing")
          totalOutgoing += Number(t.amount);
      });
    }

    if (transactions?.personalTransactions) {
      transactions.personalTransactions.forEach((t) => {
        if (t.transactionType === "incoming") totalIncoming += Number(t.amount);
        else if (t.transactionType === "outgoing")
          totalOutgoing += Number(t.amount);
      });
    }
    setTotalIncoming(totalIncoming);
    setTotalOutgoing(totalOutgoing);
    console.log(totalIncoming, totalOutgoing);

    // // Internal Transactions (assume outgoing if fromId is not null, incoming if toId === null)
    // if (transactions?.internalTransactions) {
    //   transactions.internalTransactions.forEach((t) => {
    //     // You can adjust this logic as needed for your business rules
    //     if (t.transactionType === "incoming") totalIncoming += Number(t.amount);
    //     else if (t.transactionType === "outgoing")
    //       totalOutgoing += Number(t.amount);
    //     // Or, if you want to count all as both incoming and outgoing:
    //     // totalIncoming += Number(t.amount);
    //     // totalOutgoing += Number(t.amount);
    //   });
    // }
  }, [
    transactions?.personalTransactions,
    transactions?.proceduresTransactions,
  ]);

  useEffect(() => {
    // Local dateTotals and addToDate to avoid dependency warning
    const dateTotals: Record<string, { incoming: number; outgoing: number }> =
      {};

    function addToDate(
      date: string,
      type: "incoming" | "outgoing",
      amount: number
    ) {
      if (!dateTotals[date]) dateTotals[date] = { incoming: 0, outgoing: 0 };
      dateTotals[date][type] += amount;
    }

    transactions?.proceduresTransactions?.forEach((t) => {
      if (t.date && t.amount) {
        if (t.transactionType === "incoming")
          addToDate(t.date, "incoming", Number(t.amount));
        else if (t.transactionType === "outgoing")
          addToDate(t.date, "outgoing", Number(t.amount));
      }
    });

    // Personal Transactions
    transactions?.personalTransactions?.forEach((t) => {
      if (t.date && t.amount) {
        if (t.transactionType === "incoming")
          addToDate(t.date, "incoming", Number(t.amount));
        else if (t.transactionType === "outgoing")
          addToDate(t.date, "outgoing", Number(t.amount));
      }
    });

    // Internal Transactions (optional: treat all as both incoming and outgoing, or use your own logic)
    transactions?.internalTransactions?.forEach((t) => {
      if (t.date && t.amount) {
        // Example: treat all as outgoing
        addToDate(t.date, "outgoing", Number(t.amount));
      }
    });
    const lineChartData = Object.entries(dateTotals)
      .map(([date, vals]) => ({
        date,
        incoming: vals.incoming,
        outgoing: vals.outgoing,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    setLineChartData(lineChartData);

    console.log("Date Totals:", lineChartData);

    // Cleanup: reset line chart data
    return () => {
      setLineChartData([]);
    };
  }, [
    transactions?.proceduresTransactions,
    transactions?.personalTransactions,
    transactions?.internalTransactions,
  ]);

  useEffect(() => {
    // Group incoming and outgoing by month
    const monthlyTotals: Record<
      string,
      { incoming: number; outgoing: number }
    > = {};

    function addToMonth(
      date: string,
      type: "incoming" | "outgoing",
      amount: number
    ) {
      const month = date ? date.slice(0, 7) : "unknown";
      if (!monthlyTotals[month])
        monthlyTotals[month] = { incoming: 0, outgoing: 0 };
      monthlyTotals[month][type] += amount;
    }

    // Procedure Transactions
    transactions?.proceduresTransactions?.forEach((t) => {
      if (t.date && t.amount) {
        if (t.transactionType === "incoming")
          addToMonth(t.date, "incoming", Number(t.amount));
        else if (t.transactionType === "outgoing")
          addToMonth(t.date, "outgoing", Number(t.amount));
      }
    });

    // Personal Transactions
    transactions?.personalTransactions?.forEach((t) => {
      if (t.date && t.amount) {
        if (t.transactionType === "incoming")
          addToMonth(t.date, "incoming", Number(t.amount));
        else if (t.transactionType === "outgoing")
          addToMonth(t.date, "outgoing", Number(t.amount));
      }
    });

    // Internal Transactions (optional: treat all as outgoing)
    transactions?.internalTransactions?.forEach((t) => {
      if (t.date && t.amount) {
        addToMonth(t.date, "outgoing", Number(t.amount));
      }
    });

    // Get sorted months
    const months = Object.keys(monthlyTotals).sort().reverse();
    const currentMonth = months[0];
    const prevMonth = months[1];

    const currentIncoming = currentMonth
      ? monthlyTotals[currentMonth].incoming
      : 0;
    const prevIncoming = prevMonth ? monthlyTotals[prevMonth].incoming : 0;
    const currentOutgoing = currentMonth
      ? monthlyTotals[currentMonth].outgoing
      : 0;
    const prevOutgoing = prevMonth ? monthlyTotals[prevMonth].outgoing : 0;

    // Helper for percentage
    function getPercentageChange(current: number, previous: number) {
      if (previous === 0) return current === 0 ? 0 : 100;
      return Math.round(((current - previous) / previous) * 100);
    }

    const incomingPercentChange = getPercentageChange(
      currentIncoming,
      prevIncoming
    );

    setIncomingPercentChange(incomingPercentChange);

    const outgoingPercentChange = getPercentageChange(
      currentOutgoing,
      prevOutgoing
    );
    setOutgoingPercentChange(outgoingPercentChange);
  }, [
    transactions?.proceduresTransactions,
    transactions?.personalTransactions,
    transactions?.internalTransactions,
  ]);

  return (
    <div className="dashboard-container" dir="rtl">
      <InfoModal
        showModal={showModal}
        setShowModal={setShowModal}
        info={{
          ...userRelatedInfo,
          procedures: userRelatedInfo.procedures ?? [],
          tenants: userRelatedInfo.tenants ?? [],
          transactions: userRelatedInfo.transactions ?? {
            proceduresTransactions: undefined,
            personalTransactions: undefined,
            internalTransactions: undefined,
          },
        }}
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

        <div className="dashboard-card">
          <div className="dashboard-card-title"> الرصيد</div>
          <div>
            {" "}
            <div>
              <strong> الوارد:</strong> {totalIncoming}
            </div>
          </div>
          <div>
            <strong> الصادر:</strong> {totalOutgoing}
          </div>
          <div className="dashboard-card-desc">
            <br />
            {incomingPercentChange >= 0 ? "+" : ""}
            {incomingPercentChange}% وارد عن الشهر الماضي
            <br />
            {outgoingPercentChange >= 0 ? "+" : ""}
            {outgoingPercentChange}% صادر عن الشهر الماضي
          </div>
        </div>
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
        <button
          className={activeTab === "transactions" ? "active" : ""}
          onClick={() => setActiveTab("transactions")}>
          القيود
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
                {customersAccounts?.map((user) => (
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
                {tenants &&
                  tenants?.map((tenant) => (
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
                      <td>
                        {tenant?.propertyDetails?.propertyTitle || "غير متوفر"}
                      </td>
                      <td>{tenant?.installmentAmount}</td>
                      <td>{tenant?.contractStatus}</td>
                      <td>{tenant?.startDate}</td>
                      <td>{tenant?.endDate}</td>
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
        {activeTab === "transactions" && (
          <>
            <div>
              القيود
              <LineChart
                dataset={lineChartData}
                xAxis={[
                  { dataKey: "date", scaleType: "point", label: "التاريخ" },
                ]}
                series={[
                  {
                    dataKey: "incoming",
                    label: "مجموع القيود الوارد",
                    color: "#1976d2",
                  },
                  {
                    dataKey: "outgoing",
                    label: "مجموع القيود الصادر",
                    color: "#d32f2f",
                  },
                ]}
                height={300}
                grid={{ vertical: true, horizontal: true }}
              />
            </div>
            <h2>القيود</h2>

            {/* Procedure Transactions */}
            <h3>قيود المعاملات</h3>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>رقم المعاملة</th>
                  <th>المستلم</th>
                  <th>المبلغ</th>
                  <th>نوع الحوالة</th>
                  <th>تاريخ الحوالة</th>
                  <th>تفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.proceduresTransactions?.length ? (
                  transactions?.proceduresTransactions?.map((t) => (
                    <tr key={t.id}>
                      <td>{t.procedureId}</td>
                      <td>{t.recipient}</td>
                      <td>{t.amount}</td>
                      <td>
                        {t.transactionType === "incoming" ? "وارد" : "صادر"}
                      </td>
                      <td>{t.date}</td>
                      <td>{t.report}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center" }}>
                      لا توجد قيود معاملات
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Personal Transactions */}
            <h3>قيود شخصية</h3>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>رقم الحوالة</th>
                  <th>الاسم</th>
                  <th>المبلغ</th>
                  <th>نوع الحوالة</th>
                  <th>تاريخ الحوالة</th>
                  <th>تفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.personalTransactions?.length ? (
                  transactions.personalTransactions.map((t) => (
                    <tr key={t.id}>
                      <td>{t.id}</td>
                      <td>{t.customer_name}</td>
                      <td>{t.amount}</td>
                      <td>
                        {t.transactionType === "incoming" ? "وارد" : "صادر"}
                      </td>
                      <td>{t.date}</td>
                      <td>{t.report}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center" }}>
                      لا توجد قيود شخصية
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Internal Transactions */}
            <h3>قيود داخلية</h3>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>رقم الحوالة</th>
                  <th>من</th>
                  <th>إلى</th>
                  <th>المبلغ</th>
                  <th>تاريخ الحوالة</th>
                  <th>تفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.internalTransactions?.length ? (
                  transactions.internalTransactions.map((t) => {
                    // Find from entity
                    let fromName = "";
                    let fromType = "";
                    const fromCustomer = customersAccounts.find(
                      (c) => c.id === t.fromId
                    );
                    const fromRealState = realstates.find(
                      (r) => r.id === t.fromId
                    );
                    const fromProcedure = procedures.find(
                      (p) => p.id === t.fromId
                    );

                    if (fromCustomer) {
                      fromName = fromCustomer.name;
                      fromType = "عميل";
                    } else if (fromRealState) {
                      fromName = fromRealState.propertyTitle;
                      fromType = "عقار";
                    } else if (fromProcedure) {
                      fromName = fromProcedure.procedureName;
                      fromType = "معاملة";
                    } else {
                      fromName = String(t.fromId);
                      fromType = "";
                    }

                    // Find to entity
                    let toName = "";
                    let toType = "";
                    const toCustomer = customersAccounts.find(
                      (c) => c.id === t.toId
                    );
                    const toRealState = realstates.find((r) => r.id === t.toId);
                    const toProcedure = procedures.find((p) => p.id === t.toId);

                    if (toCustomer) {
                      toName = toCustomer.name;
                      toType = "عميل";
                    } else if (toRealState) {
                      toName = toRealState.propertyTitle;
                      toType = "عقار";
                    } else if (toProcedure) {
                      toName = toProcedure.procedureName;
                      toType = "معاملة";
                    } else {
                      toName = String(t.toId);
                      toType = "";
                    }

                    return (
                      <tr key={t.id}>
                        <td>{t.id}</td>
                        <td>
                          {fromName}
                          {fromType && (
                            <span style={{ color: "#888", fontSize: "0.9em" }}>
                              {" "}
                              ({fromType})
                            </span>
                          )}
                        </td>
                        <td>
                          {toName}
                          {toType && (
                            <span style={{ color: "#888", fontSize: "0.9em" }}>
                              {" "}
                              ({toType})
                            </span>
                          )}
                        </td>
                        <td>{t.amount}</td>
                        <td>{t.date}</td>
                        <td>{t.details}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center" }}>
                      لا توجد قيود داخلية
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
