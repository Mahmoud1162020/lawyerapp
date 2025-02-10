import React, { useState } from "react";
import "./OutgoingContent.css";

const TransactionPage: React.FC = () => {
  const [amount, setAmount] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [recipient, setRecipient] = useState("");
  const [report, setReport] = useState("");
  const [selectedType, setSelectedType] = useState("معاملة"); // Default selection
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [transactions, setTransactions] = useState([
    {
      id: 1500,
      recipient: "رحيم مصطفى",
      amount: "2000",
      report: "this is a report",
      date: new Date(),
    },
  ]);

  const [personalTransactions, setPersonalTransactions] = useState([
    {
      id: 1,
      name: "mahmood",
      amount: 100,
      balance: 120000,
      details: "تفاصيل",
      date: "1/2/2024",
    },
  ]);

  const handleSave = () => {
    if (recipient && amount) {
      if (selectedType === "معاملة") {
        setTransactions([
          ...transactions,
          {
            id: transactions.length + 1500,
            recipient,
            amount,
            report,
            date: new Date(),
          },
        ]);
      } else {
        setPersonalTransactions([
          ...personalTransactions,
          {
            id: personalTransactions.length + 1,
            name: "mahmood",
            amount: Number(amount),
            balance: 1200000,
            details: "تفاصيل",
            date: "1/2/2024",
          },
        ]);
      }
      setRecipient("");
      setAmount("");
      setReport("");
    }
  };

  const handleDelete = (id: number) => {
    if (selectedType === "معاملة") {
      setTransactions(transactions.filter((t) => t.id !== id));
    } else {
      setPersonalTransactions(personalTransactions.filter((t) => t.id !== id));
    }
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
  };

  const handleChange = (id: number, field: string, value: string | number) => {
    if (selectedType === "معاملة") {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
      );
    } else {
      setPersonalTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, [field]: value } : t))
      );
    }
  };

  const handleBlur = () => {
    setEditingId(null);
  };
  const filteredTransactions = transactions.filter(
    (t) =>
      t.recipient.includes(searchQuery) || t.id.toString().includes(searchQuery)
  );

  const filteredPersonalTransactions = personalTransactions.filter(
    (t) =>
      t.id.toString().includes(searchQuery) ||
      t.name.toString().includes(searchQuery)
  );

  return (
    <div className="transaction-container">
      {/* Search Section */}
      <div className="search-section">
        <input
          type="text"
          placeholder="ابحث بالاسم أو رقم العملية"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Form Section */}
      <div className="form-section">
        <button className="save-btn" onClick={handleSave}>
          حفظ
        </button>

        <div className="input-group">
          <label>اختر العملية</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}>
            <option value="معاملة">معاملة</option>
            <option value="شخصي">شخصي</option>
          </select>
        </div>

        <div className="input-group">
          <label>ادخل المبلغ</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {selectedType === "معاملة" && (
          <div className="input-group">
            <label>ادخل رقم المعاملة</label>
            <input
              type="text"
              value={transactionNumber}
              onChange={(e) => setTransactionNumber(e.target.value)}
            />
          </div>
        )}

        <div className="input-group">
          <label>ادخل الاسم</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>التفاصيل</label>
          <input
            type="text"
            value={report}
            onChange={(e) => setReport(e.target.value)}
          />
        </div>
      </div>

      {/* Display appropriate table based on selection */}
      {selectedType === "معاملة" ? (
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>تسلسل</th>
                <th>المستلم</th>
                <th>المبلغ</th>
                <th>تقرير</th>
                <th>التاريخ</th>
                <th>خيارات</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td
                    onClick={() => handleEdit(t.id)}
                    onBlur={handleBlur}
                    contentEditable={editingId === t.id}
                    suppressContentEditableWarning
                    onInput={(e) =>
                      handleChange(
                        t.id,
                        "recipient",
                        e.currentTarget.textContent || ""
                      )
                    }>
                    {t.recipient}
                  </td>
                  <td
                    onClick={() => handleEdit(t.id)}
                    onBlur={handleBlur}
                    contentEditable={editingId === t.id}
                    suppressContentEditableWarning
                    onInput={(e) =>
                      handleChange(
                        t.id,
                        "amount",
                        Number(e.currentTarget.textContent)
                      )
                    }>
                    {t.amount}
                  </td>
                  <td
                    onClick={() => handleEdit(t.id)}
                    onBlur={handleBlur}
                    contentEditable={editingId === t.id}
                    suppressContentEditableWarning
                    onInput={(e) =>
                      handleChange(
                        t.id,
                        "report",
                        e.currentTarget.textContent || ""
                      )
                    }>
                    {t.report}
                  </td>
                  <td>{t.date.toLocaleDateString()}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(t.id)}>
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="personal-table">
          <table>
            <thead>
              <tr>
                <th>ت ع</th>
                <th>رقم المعاملة</th>
                <th>الاسم</th>
                <th>التاريخ</th>
                <th>له</th>
                <th>عليه</th>
                <th>الرصيد</th>
                <th>التفاصيل</th>
                <th>حذف</th>
              </tr>
            </thead>
            <tbody>
              {filteredPersonalTransactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>100</td>
                  <td>{t.name}</td>
                  <td>{t.date}</td>
                  <td
                    onClick={() => handleEdit(t.id)}
                    onBlur={handleBlur}
                    contentEditable={editingId === t.id}
                    suppressContentEditableWarning
                    onInput={(e) =>
                      handleChange(
                        t.id,
                        "amount",
                        Number(e.currentTarget.textContent)
                      )
                    }>
                    {t.amount}
                  </td>
                  <td>-</td>
                  <td>{t.balance}</td>
                  <td
                    onClick={() => handleEdit(t.id)}
                    onBlur={handleBlur}
                    contentEditable={editingId === t.id}
                    suppressContentEditableWarning
                    onInput={(e) =>
                      handleChange(
                        t.id,
                        "details",
                        e.currentTarget.textContent || ""
                      )
                    }>
                    {t.details}
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(t.id)}>
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionPage;
