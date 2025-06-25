import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./OutgoingContent.css";
import ConfirmModal from "../../Modal/ConfirmModal";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Select } from "antd";

// toast.configure(); // Initialize toast notifications
const { Option } = Select;
interface TransactionPageProps {
  activeTab: string;
}

interface personalTransaction {
  id: number;
  userId: number;
  customer_id: number;
  amount: number;
  report: string;
  date: string;
  transactionType?: string;
  type?: string; // "personal" or "procedure"
  customer_name?: string; // Optional field for customer name
}

const TransactionPage: React.FC<TransactionPageProps> = ({ activeTab }) => {
  const navigate = useNavigate();
  const [customerAccounts, setCustomerAccounts] = useState<Customer[]>([]);
  const [amount, setAmount] = useState<number | "">("");
  const [transactionNumber, setTransactionNumber] = useState<string>();
  const [recipient, setRecipient] = useState("");
  const [recipientId, setRecipientId] = useState<number>();
  const [report, setReport] = useState("");
  const [selectedType, setSelectedType] = useState("معاملة"); // Default selection
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  ); // State to manage the date input
  const [updateFlag, setUpdateFlag] = useState(false); // State to track updates
  const location = useLocation();
  const [allProcedures, setAllProcedures] = useState<Procedure[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(
    null
  );

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [personalTransactions, setPersonalTransactions] =
    useState<personalTransaction[]>();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSave(); // Trigger the save function when Enter is pressed
    }
  };

  useEffect(() => {
    if (location.state && location?.state?.activeTab === "outgoing") {
      console.log("location", location.state.selectedType);
      setSelectedType(location?.state?.selectedType);
    }
  }, []);

  const getAllCustomersAccounts = async () => {
    try {
      const customersAccounts = await window.electron.getAllCustomersAccounts();
      console.log("Fetched Customers Accounts:", customersAccounts);
      setCustomerAccounts(
        customersAccounts.map(
          (customer: {
            id: number;
            name: string;
            accountNumber: string;
            accountType: string;
            phone: string;
            address: string;
            date: string;
            details: string | null;
            debit?: number;
            credit?: number;
          }) => ({
            ...customer,
            debit: customer.debit ?? 0,
            credit: customer.credit ?? 0,
          })
        )
      );
    } catch (error) {
      console.log("Error fetching data from the database:", error);
    }
  };

  const getAllProcedures = async () => {
    try {
      const allProcedures = await window.electron.getAllProcedures();
      console.log("====================================");
      console.log(allProcedures);
      console.log("====================================");
      if (allProcedures) {
        setAllProcedures(allProcedures);
      } else {
        toast.error("لم يتم العثور على العمليات!", { autoClose: 3000 });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "حدث خطأ غير متوقع!";
      toast.error(`❌ خطأ: ${errorMessage}`);
      console.error("Error fetching procedures:", error);
    }
  };

  useEffect(() => {
    getAllCustomersAccounts();
    getAllProcedures();

    window.electron.getUser().then((user: User) => {
      console.log("====================================");
      console.log(user);
      console.log("====================================");
      if (user) {
        window.electron
          .getTransactionsByUser(user.id)
          .then((dbTransactions) => {
            const incomingTransactions = (
              Array.isArray(dbTransactions) ? dbTransactions : []
            ).filter((t: Transaction) => t.transactionType === "outgoing");

            setTransactions(incomingTransactions);
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
          });
      }
    });
  }, [updateFlag]);

  useEffect(() => {
    const fetchPersonalTransactions = async () => {
      try {
        const rawTransactions =
          await window.electron.getAllPersonalTransactions();

        // Filter transactions with transactionType "outgoing" and type "personal"
        const filteredTransactions = rawTransactions.filter(
          (t: personalTransaction) =>
            t.transactionType === "outgoing" && t.type === "personal"
        );

        console.log("Filtered Personal Transactions:", filteredTransactions);
        setPersonalTransactions(filteredTransactions);
      } catch (error) {
        console.log("Error fetching data from the database:", error);
      }
    };

    fetchPersonalTransactions();
  }, [updateFlag]);
  const handleSave = async () => {
    try {
      if (!amount) {
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
          Number(transactionNumber),
          selectedType === "معاملة" ? "procedure" : "personal",
          "outgoing",
          date
        );
        console.log("====================================");
        console.log(transaction);
        console.log("====================================");
        if (transaction) {
          setUpdateFlag(!updateFlag); // Trigger update
          toast.success("تمت إضافة المعاملة بنجاح!", { autoClose: 3000 });
        }
      } else {
        //user_id, recipient, amount, report, type, date
        const transaction = await window.electron.addPersonalTransaction(
          user.id,
          recipientId ?? 0, // Provide a default value or handle undefined
          Number(amount),
          report,
          "outgoing",
          date
        );
        if (transaction) {
          setUpdateFlag(!updateFlag); // Trigger update
          toast.success("تمت إضافة المعاملة بنجاح!", { autoClose: 3000 });
        }
      }

      setRecipient("");
      setAmount("");
      setReport("");
      setTransactionNumber("");
      setDate(new Date().toISOString().split("T")[0]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "حدث خطأ غير متوقع!";
      toast.error(`❌ خطأ: ${errorMessage}`);
      console.error("Error fetching user data:", error);
    }
  };

  // const handleUpdateField = async (
  //   id: number,
  //   field: string,
  //   value: string | number
  // ) => {
  //   try {
  //     // Show modal to confirm the edit
  //     setIsModalOpen(true);
  //     setFieldToUpdate({ id, field, value }); // Store the field info for later use
  //     console.log("====================================");
  //     console.log(fieldToUpdate?.field);
  //     console.log("====================================");
  //   } catch (error) {
  //     toast.error("❌ فشل تحديث البيانات!");
  //     console.error(`Error updating ${field}:`, error);
  //   }
  // };

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
      console.log("transactionToDelete", transactionToDelete);
      await window.electron.deletePersonalTransaction(transactionToDelete);
      setPersonalTransactions(
        (personalTransactions ?? []).filter((t) => t.id !== transactionToDelete)
      );
    }

    toast.success("تم حذف المعاملة بنجاح!", { autoClose: 3000 });

    setTransactionToDelete(null);
    setIsModalOpen(false);
  };

  const filteredTransactions = transactions.filter((t) =>
    t.recipient.includes(searchQuery)
  );

  // const filteredPersonalTransactions = personalTransactions.filter((t) =>
  //   t.name.includes(searchQuery)
  // );

  return (
    <div className="transaction-container">
      <ConfirmModal
        show={isModalOpen}
        message="هل أنت متأكد أنك تريد الحذف؟"
        onConfirm={() => {
          if (transactionToDelete !== null) {
            handleConfirmDelete();
          }
        }}
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
            // disabled={!recipient || !amount}
          >
            حفظ
          </button>

          <div className="input-group">
            <label>نوع الحساب</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}>
              <option value="معاملة">معاملة</option>
              <option value="شخصي">شخصي</option>
            </select>
          </div>

          {selectedType === "معاملة" && (
            <div className="input-group">
              <label>ادخل رقم المعاملة</label>
              <Select
                allowClear
                value={transactionNumber}
                onChange={(value) => setTransactionNumber(value as string)}>
                {allProcedures.map((procedure) => (
                  <Option key={procedure.id} value={procedure.id}>
                    {procedure.procedureNumber}
                  </Option>
                ))}
              </Select>
              {/* <input
                type="text"
                value={transactionNumber}
                onChange={(e) => setTransactionNumber(e.target.value)}
                onKeyDown={handleKeyDown}
              /> */}
            </div>
          )}

          {selectedType === "معاملة" ? (
            <div className="input-group">
              <label>ادخل الاسم</label>

              <input
                onKeyDown={handleKeyDown}
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
          ) : (
            <div className="input-group">
              <label>ادخل الاسم</label>
              <Select
                allowClear
                value={recipientId}
                onChange={(value) => setRecipientId(value as number)}>
                {customerAccounts.map((ca) => (
                  <Option key={ca.id} value={ca.id}>
                    {ca.name}
                  </Option>
                ))}
              </Select>
            </div>
          )}
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
          {/* <div className="procedures-form-group">
            <label>التاريخ</label>
            <input
              style={{ maxWidth: "200px" }}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div> */}

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
                <th>نوع الإجراء</th>
                <th>التاريخ</th>
                <th>خيارات</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => {
                console.log(t.report.length > 50);

                return (
                  <tr key={t.id}>
                    <td>{t.id}</td>

                    {/* Editable Recipient Field */}
                    <td>{t.recipient}</td>

                    {/* Editable Transaction Number */}
                    <td>{t.procedureId}</td>

                    {/* Editable Amount */}
                    <td>{t.amount}</td>

                    {/* Editable Report */}
                    <td>
                      <p>
                        {t.report.length > 30
                          ? t.report.slice(0, 20) + "..."
                          : t.report}
                      </p>
                    </td>
                    <td>{t.type === "procedure" ? "معاملة" : "شخصي"}</td>

                    {/* Editable Date */}
                    <td>{new Date(t.date).toISOString().slice(0, 10)}</td>

                    {/* Delete Button */}
                    <td>
                      <Button
                        className="btn"
                        onClick={() => handleDelete(t.id)}>
                        حذف
                      </Button>
                      <Button
                        type="default"
                        onClick={() =>
                          navigate(`/outgoing-transaction-details/${t.id}`, {
                            state: { selectedType },
                          })
                        }>
                        تفاصيل
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="personal-table">
          <table>
            <thead>
              <tr>
                <th>ت</th>

                <th>الاسم</th>

                <th>المبلغ</th>
                <th>التاريخ</th>
                <th>التفاصيل</th>
                <th>خيارات</th>
              </tr>
            </thead>
            <tbody>
              {(personalTransactions ?? []).map((t) => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.customer_name}</td>
                  <td>{t.transactionType === "outgoing" ? t.amount : 0}</td>
                  <td>{t.date}</td>

                  {/* <td>{t.details}</td> */}
                  <td>
                    <p>
                      {t.report.length > 30
                        ? t.report.slice(0, 20) + "..."
                        : t.report}
                    </p>
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(t.id)}>
                      حذف
                    </button>
                    <button
                      className="details-button"
                      onClick={() =>
                        navigate(
                          `/outgoing-personal-transaction-details/${t.id}`,
                          {
                            state: {
                              selectedType,
                              from: location.pathname,
                              activeTab: activeTab,
                            },
                          }
                        )
                      }>
                      تفاصيل
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
