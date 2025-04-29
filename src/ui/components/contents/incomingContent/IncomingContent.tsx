import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "../outgoingContent/OutgoingContent.css";
import ConfirmModal from "../../Modal/ConfirmModal";
import { Link } from "react-router-dom";

const IncomingPage: React.FC = () => {
  const [amount, setAmount] = useState<number | "">("");
  const [transactionNumber, setTransactionNumber] = useState<string>("");
  const [recipient, setRecipient] = useState("");
  const [currency, setCurrency] = useState("دينار"); // Default currency
  const [selectedType, setSelectedType] = useState("شخصي"); // Default selection
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(
    null
  );

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [personalTransactions, setPersonalTransactions] = useState([
    {
      id: 1,
      name: "mahmood",
      amount: 500,
      balance: 1000,
      details: "تفاصيل",
      date: "2024-01-01",
    },
  ]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSave(); // Trigger the save function when Enter is pressed
    }
  };

  const handleSave = async () => {
    try {
      if (!recipient || !amount) {
        toast.error("يرجى ملء جميع الحقول المطلوبة!", { autoClose: 3000 });
        return;
      }

      if (selectedType === "شخصي") {
        setPersonalTransactions([
          ...personalTransactions,
          {
            id: personalTransactions.length + 1,
            name: recipient,
            amount: Number(amount),
            balance: 1000,
            details: "تفاصيل",
            date: new Date().toISOString().slice(0, 10),
          },
        ]);

        toast.success("تمت إضافة العملية الشخصية بنجاح!", { autoClose: 3000 });
      } else {
        const newTransaction = {
          id: transactions.length + 1,
          recipient,
          transactionId: transactionNumber,
          amount: Number(amount),
          currency,
          date: new Date().toISOString().slice(0, 10),
        };
        setTransactions([...transactions, newTransaction]);

        toast.success("تمت إضافة العملية بنجاح!", { autoClose: 3000 });
      }

      setRecipient("");
      setAmount("");
      setTransactionNumber("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "حدث خطأ غير متوقع!";
      toast.error(`❌ خطأ: ${errorMessage}`);
      console.error("Error saving transaction:", error);
    }
  };

  const handleDelete = (id: number) => {
    setTransactionToDelete(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete === null) return;

    if (selectedType === "شخصي") {
      setPersonalTransactions(
        personalTransactions.filter((t) => t.id !== transactionToDelete)
      );
    } else {
      setTransactions(transactions.filter((t) => t.id !== transactionToDelete));
    }

    toast.success("تم حذف العملية بنجاح!", { autoClose: 3000 });

    setTransactionToDelete(null);
    setIsModalOpen(false);
  };

  const filteredTransactions = transactions.filter(
    (t) =>
      t.recipient.includes(searchQuery) || t.transactionId.includes(searchQuery)
  );

  const filteredPersonalTransactions = personalTransactions.filter((t) =>
    t.name.includes(searchQuery)
  );

  return (
    <div className="transaction-container">
      <ConfirmModal
        show={isModalOpen}
        message="هل أنت متأكد أنك تريد الحذف؟"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setTransactionToDelete(null);
          setIsModalOpen(false);
        }}
      />

      {/* Search Section */}
      <div>
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
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={!recipient || !amount}>
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
              onKeyDown={handleKeyDown}
              onChange={(e) =>
                setAmount(e.target.value ? Number(e.target.value) : "")
              }
            />
          </div>

          {selectedType === "عملية" && (
            <div className="input-group">
              <label>ادخل رقم العملية</label>
              <input
                type="text"
                value={transactionNumber}
                onChange={(e) => setTransactionNumber(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          <div className="input-group">
            <label>ادخل الاسم</label>
            <input
              onKeyDown={handleKeyDown}
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          {selectedType === "عملية" && (
            <div className="input-group">
              <label>اختر العملة</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}>
                <option value="دينار">دينار</option>
                <option value="دولار">دولار</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Display Transactions Table */}
      {selectedType === "عملية" ? (
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>ت ع</th>
                <th>رقم العملية</th>
                <th>الاسم</th>
                <th>التاريخ</th>
                <th>له</th>
                <th>عليه</th>
                <th>العملة</th>
                <th>خيارات</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.transactionId}</td>
                  <td>{t.recipient}</td>
                  <td>{t.date}</td>
                  <td>{t.amount}</td>
                  <td>-</td>
                  <td>{t.currency}</td>
                  <td>
                    <button className="btn" onClick={() => handleDelete(t.id)}>
                      حذف
                    </button>
                    <Link
                      className="btn"
                      to="/transaction-details"
                      state={{ item: t }}>
                      تفاصيل
                    </Link>
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
                  <td>{t.name}</td>
                  <td>{t.date}</td>
                  <td>{t.amount}</td>
                  <td>-</td>
                  <td>{t.balance}</td>
                  <td>{t.details}</td>
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

export default IncomingPage;
