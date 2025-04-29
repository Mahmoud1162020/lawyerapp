import React, { useState } from "react";
import "./InternalEntry.css";
import ConfirmModal from "../../Modal/ConfirmModal";

const InternalEntry: React.FC = () => {
  const [amount, setAmount] = useState<number | "">("");
  const [recipient, setRecipient] = useState("");
  const [currency, setCurrency] = useState("دينار"); // Default currency
  const [selectedType, setSelectedType] = useState("شخصي"); // Default selection
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);

  const [entries, setEntries] = useState<
    {
      id: number;
      name: string;
      amount: number;
      balance: number;
      details: string;
      date: string;
    }[]
  >([
    {
      id: 1,
      name: "رحيم مصطفى",
      amount: 500,
      balance: 1000,
      details: "تفاصيل",
      date: "2024-01-01",
    },
  ]);

  const handleSave = () => {
    if (!recipient || !amount) {
      alert("يرجى ملء جميع الحقول المطلوبة!");
      return;
    }

    const newEntry = {
      id: entries.length + 1,
      name: recipient,
      amount: Number(amount),
      balance: 1000,
      details: "تفاصيل",
      date: new Date().toISOString().slice(0, 10),
    };

    setEntries([...entries, newEntry]);
    setRecipient("");
    setAmount("");
  };

  const handleDelete = (id: number) => {
    setEntryToDelete(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (entryToDelete !== null) {
      setEntries(entries.filter((entry) => entry.id !== entryToDelete));
      setEntryToDelete(null);
      setIsModalOpen(false);
    }
  };

  const filteredEntries = entries.filter((entry) =>
    entry.name.includes(searchQuery)
  );

  return (
    <div className="internal-entry-container">
      <ConfirmModal
        show={isModalOpen}
        message="هل أنت متأكد أنك تريد الحذف؟"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsModalOpen(false)}
      />

      {/* Search Section */}
      <div className="search-section">
        <input
          type="text"
          placeholder="ابحث بالاسم"
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
            <option value="شخصي">شخصي</option>
            <option value="عملية">عملية</option>
          </select>
        </div>

        <div className="input-group">
          <label>ادخل المبلغ</label>
          <input
            type="number"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value ? Number(e.target.value) : "")
            }
          />
        </div>

        <div className="input-group">
          <label>ادخل الاسم</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>اختر العملة</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}>
            <option value="دينار">دينار</option>
            <option value="دولار">دولار</option>
          </select>
        </div>
      </div>

      {/* Display Entries Table */}
      <div className="entries-table">
        <table>
          <thead>
            <tr>
              <th>ت ع</th>
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
            {filteredEntries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.id}</td>
                <td>{entry.name}</td>
                <td>{entry.date}</td>
                <td>{entry.amount}</td>
                <td>-</td>
                <td>{entry.balance}</td>
                <td>{entry.details}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(entry.id)}>
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InternalEntry;
