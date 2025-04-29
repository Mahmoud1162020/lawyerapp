import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./OutgoingContent.css";
import ConfirmModal from "../../Modal/ConfirmModal";
import { Link } from "react-router-dom";

// toast.configure(); // Initialize toast notifications

const TransactionPage: React.FC = () => {
  const [amount, setAmount] = useState<number | "">("");
  const [transactionNumber, setTransactionNumber] = useState<string>("");
  const [recipient, setRecipient] = useState("");
  const [report, setReport] = useState("");
  const [selectedType, setSelectedType] = useState("معاملة"); // Default selection
  const [searchQuery, setSearchQuery] = useState("");
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [updateFlag, setUpdateFlag] = useState(false); // State to track updates
  const [editableDates, setEditableDates] = useState<{ [key: number]: string }>(
    {}
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(
    null
  );

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fieldToUpdate, setFieldToUpdate] = useState<{
    id: number;
    field: string;
    value: string | number;
  } | null>(null);

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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSave(); // Trigger the save function when Enter is pressed
    }
  };

  useEffect(() => {
    window.electron.getUser().then((user: User) => {
      console.log("====================================");
      console.log(user);
      console.log("====================================");
      if (user) {
        window.electron
          .getTransactionsByUser(user.id)
          .then((dbTransactions) => {
            setTransactions(
              Array.isArray(dbTransactions) ? dbTransactions : []
            );
            const initialDates: { [key: number]: string } = {};
            ////

            (Array.isArray(dbTransactions) ? dbTransactions : []).forEach(
              (t: Transaction) => {
                console.log("====================================");
                console.log(t.date);
                console.log("====================================");
                initialDates[t.id] = t.date; // Store the DB date
              }
            );
            setEditableDates(initialDates);

            //////
          });
      }
    });
  }, [updateFlag]);

  const handleSave = async () => {
    try {
      if (!recipient || !amount) {
        toast.error("يرجى ملء جميع الحقول المطلوبة!", { autoClose: 3000 });
        return;
      }

      const user = await window.electron.getUser(); // Await user data
      if (!user) {
        toast.error("لم يتم العثور على المستخدم!", { autoClose: 3000 });
        return;
      }

      if (selectedType === "معاملة") {
        const transaction = await window.electron.addTransaction(
          user.id,
          recipient,
          Number(amount),
          report,
          transactionNumber
        );
        if (transaction) {
          setUpdateFlag(!updateFlag); // Trigger update
          toast.success("تمت إضافة المعاملة بنجاح!", { autoClose: 3000 });
        }
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

        toast.success("تمت إضافة العملية الشخصية بنجاح!", { autoClose: 3000 });
      }

      setRecipient("");
      setAmount("");
      setReport("");
      setTransactionNumber("");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "حدث خطأ غير متوقع!";
      toast.error(`❌ خطأ: ${errorMessage}`);
      console.error("Error fetching user data:", error);
    }
  };

  const handleUpdateField = async (
    id: number,
    field: string,
    value: string | number
  ) => {
    try {
      // Show modal to confirm the edit
      setIsModalOpen(true);
      setFieldToUpdate({ id, field, value }); // Store the field info for later use
      console.log("====================================");
      console.log(fieldToUpdate?.field);
      console.log("====================================");
    } catch (error) {
      toast.error("❌ فشل تحديث البيانات!");
      console.error(`Error updating ${field}:`, error);
    }
  };

  const handleConfirm = () => {
    // Proceed with the edit action (update the transaction)
    if (!fieldToUpdate) return;
    const { id, field, value } = fieldToUpdate;

    // Perform the update operation
    const newValue =
      field === "date" ? new Date(value).toISOString().slice(0, 10) : value;

    window.electron
      .updateTransaction(id, field, newValue)
      .then((result) => {
        if (result.updated) {
          toast.success("تم تحديث البيانات بنجاح!", { autoClose: 3000 });
        } else {
          toast.warn(
            "⚠️ لم يتم العثور على المعاملة أو لم يتم تحديث أي بيانات."
          );
        }
        setIsModalOpen(false); // Close the modal after confirmation
      })
      .catch((error) => {
        toast.error(" فشل تحديث البيانات!");
        console.error(`Error updating ${field}:`, error);
        setIsModalOpen(false); // Close the modal on error
      });
  };

  const handleCancel = () => {
    // Cancel the edit and close the modal
    setUpdateFlag(!updateFlag);
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    setTransactionToDelete(id);
    setIsModalOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (transactionToDelete === null) return;

    if (selectedType === "معاملة") {
      setTransactions(transactions.filter((t) => t.id !== transactionToDelete));
      await window.electron.deleteTransaction(transactionToDelete);
    } else {
      setPersonalTransactions(
        personalTransactions.filter((t) => t.id !== transactionToDelete)
      );
    }

    toast.success("تم حذف المعاملة بنجاح!", { autoClose: 3000 });

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
        message={`هل أنت متأكد أنك تريد التحديث؟`}
        onConfirm={fieldToUpdate ? handleConfirm : () => {}}
        onCancel={handleCancel}
      />
      <ConfirmModal
        show={isModalOpen}
        message="هل أنت متأكد أنك تريد الحذف؟"
        onConfirm={
          transactionToDelete !== null ? handleConfirmDelete : handleConfirm
        }
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
              <option value="معاملة">معاملة</option>
              <option value="شخصي">شخصي</option>
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

          {selectedType === "معاملة" && (
            <div className="input-group">
              <label>ادخل رقم المعاملة</label>
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

          <div className="input-group">
            <label>التفاصيل</label>
            <input
              onKeyDown={handleKeyDown}
              type="text"
              value={report}
              onChange={(e) => setReport(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Display Transactions Table */}
      {selectedType === "معاملة" ? (
        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>تسلسل</th>
                <th>المستلم</th>
                <th>رقم المعاملة</th>
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

                  {/* Editable Recipient Field */}
                  <td>
                    <input
                      type="text"
                      value={t.recipient}
                      onChange={(e) =>
                        setTransactions(
                          transactions.map((tx) =>
                            tx.id === t.id
                              ? { ...tx, recipient: e.target.value }
                              : tx
                          )
                        )
                      }
                      onBlur={() =>
                        handleUpdateField(t.id, "recipient", t.recipient)
                      }
                    />
                  </td>

                  {/* Editable Transaction Number */}
                  <td>
                    <input
                      type="text"
                      value={t.transactionId}
                      onChange={(e) =>
                        setTransactions(
                          transactions.map((tx) =>
                            tx.id === t.id
                              ? { ...tx, transactionId: e.target.value }
                              : tx
                          )
                        )
                      }
                      onBlur={() =>
                        handleUpdateField(
                          t.id,
                          "transactionId",
                          t.transactionId
                        )
                      }
                    />
                  </td>

                  {/* Editable Amount */}
                  <td>
                    <input
                      type="number"
                      value={t.amount}
                      onChange={(e) =>
                        setTransactions(
                          transactions.map((tx) =>
                            tx.id === t.id
                              ? { ...tx, amount: Number(e.target.value) }
                              : tx
                          )
                        )
                      }
                      onBlur={() => handleUpdateField(t.id, "amount", t.amount)}
                    />
                  </td>

                  {/* Editable Report */}
                  <td>
                    <input
                      type="text"
                      value={t.report}
                      onChange={(e) =>
                        setTransactions(
                          transactions.map((tx) =>
                            tx.id === t.id
                              ? { ...tx, report: e.target.value }
                              : tx
                          )
                        )
                      }
                      onBlur={() => handleUpdateField(t.id, "report", t.report)}
                    />
                  </td>

                  {/* Editable Date */}
                  <td>
                    <input
                      type="date"
                      value={new Date(t.date).toISOString().slice(0, 10)}
                      onChange={(e) =>
                        setTransactions(
                          transactions.map((tx) =>
                            tx.id === t.id
                              ? { ...tx, date: e.target.value }
                              : tx
                          )
                        )
                      }
                      onBlur={() => handleUpdateField(t.id, "date", t.date)}
                    />
                  </td>

                  {/* Delete Button */}
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
              {personalTransactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>100</td>
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

export default TransactionPage;
