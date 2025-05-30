import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../outgoingContent/OutgoingContent.css";
import ConfirmModal from "../../Modal/ConfirmModal";
import { Link, useLocation } from "react-router-dom";
import PersonalTransactions from "./PersonalTransactions";
import ProcedureTransactions from "./ProcedureTransactions";
import TenantTransactions from "./TenantTransactions";
import { Select } from "antd";

interface CustomerAccount {
  id: number;
  name: string;
  accountNumber: string;
  accountType: string;
  phone: string;
  address: string;
  date: string;
  details: string | null;
}
const { Option } = Select;
const IncomingPage: React.FC = ({ activeTab }) => {
  const [amount, setAmount] = useState<number | "">("");
  const [transactionNumber, setTransactionNumber] = useState<string>("");
  const location = useLocation();
  const [customer, setCustomer] = useState<number>();
  const [currency, setCurrency] = useState("دينار"); // Default currency
  const [selectedType, setSelectedType] = useState("شخصي"); // Default selection
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [report, setReport] = useState("");
  const [updateFlag, setUpdateFlag] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(
    null
  );
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [customersAccount, setCustomersAccount] = React.useState<
    CustomerAccount[]
  >([]);
  const [personalTransactions, setPersonalTransactions] = React.useState<
    PersonalTransaction[]
  >([]);
  const [userInfo, setUserInfo] = useState<User | null>();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allProcedures, setAllProcedures] = useState<Procedure[]>();
  const [procedurId, setProcedureId] = useState<number | null>(null);
  const [procedureTransactions, setProcedureTransactions] = useState<
    Transaction[]
  >([]);
  const getUserInfo = async () => {
    try {
      const user = await window.electron.getUser();
      setUserInfo(user);
      console.log("Fetched user info:", user);
    } catch (error) {
      console.error("Error fetching user info:", error);
      toast.error(
        "حدث خطأ أثناء جلب معلومات المستخدم. يرجى المحاولة مرة أخرى.",
        {
          autoClose: 3000,
        }
      );
    }
  };
  const fetchCustomersAccount = async () => {
    try {
      const response: CustomerAccount[] =
        await window.electron.getAllCustomersAccounts();
      console.log("Fetched customers account:", response);

      setCustomersAccount(response);
    } catch (error) {
      console.error("Error fetching customers account:", error);
      toast.error("حدث خطأ أثناء جلب حسابات العملاء. يرجى المحاولة مرة أخرى.", {
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    if (location.state && location?.state?.activeTab === "incoming") {
      console.log("location", location.state.selectedType);
      setSelectedType(location?.state?.selectedType);
    }
  }, []);

  useEffect(() => {
    const fetchPersonalTransactions = async () => {
      try {
        const rawTransactions =
          await window.electron.getAllPersonalTransactions();

        // First, map to ensure all required fields are present for PersonalTransaction type
        const mappedTransactions = rawTransactions.map((t: any) => ({
          ...t,
          type: t.type ?? "personal",
          transactionType: t.transactionType ?? "incoming",
        }));

        // Then filter transactions with transactionType "incoming" and type "personal"
        const filteredTransactions = mappedTransactions.filter(
          (t: any) => t.transactionType === "incoming" && t.type === "personal"
        );

        console.log("Filtered Personal Transactions:", filteredTransactions);
        setPersonalTransactions(filteredTransactions);
      } catch (error) {
        console.log("Error fetching data from the database:", error);
      }
    };

    fetchPersonalTransactions();
  }, [updateFlag]);

  useEffect(() => {
    const fetchAllProcedures = async () => {
      try {
        const response = await window.electron.getAllProcedures();
        console.log("Fetched all procedures:", response);
        setAllProcedures(response);
      } catch (error) {
        console.error("Error fetching all procedures:", error);
        toast.error(
          "حدث خطأ أثناء جلب جميع الإجراءات. يرجى المحاولة مرة أخرى.",
          {
            autoClose: 3000,
          }
        );
      }
    };

    fetchAllProcedures();
  }, []);

  useEffect(() => {
    const fetchProcedureTransactions = async () => {
      try {
        window.electron.getUser().then((user: User) => {
          console.log("====================================");
          console.log(user);
          console.log("====================================");
          if (user) {
            window.electron
              .getTransactionsByUser(user.id)
              .then((dbTransactions) => {
                // Filter transactions to include only "incoming" transactions
                const incomingTransactions = (
                  Array.isArray(dbTransactions) ? dbTransactions : []
                ).filter((t: Transaction) => t.transactionType === "incoming");

                setProcedureTransactions(incomingTransactions);

                // Log the filtered transactions
                incomingTransactions.forEach((t: Transaction) => {
                  console.log("====================================");
                  console.log(t.date);
                  console.log("====================================");
                });
              });
          }
        });
      } catch (error) {
        console.error("Error fetching all procedure transactions:", error);
        toast.error(
          "حدث خطأ أثناء جلب جميع معاملات الإجراءات. يرجى المحاولة مرة أخرى.",
          {
            autoClose: 3000,
          }
        );
      }
    };

    fetchProcedureTransactions();
  }, [updateFlag]);

  useEffect(() => {
    getUserInfo();
    fetchCustomersAccount();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSave(); // Trigger the save function when Enter is pressed
    }
  };

  const handleSave = async () => {
    console.log("Saving transaction...");

    try {
      if (!amount) {
        toast.error("يرجى ملء جميع الحقول المطلوبة!", { autoClose: 3000 });
        return;
      }

      if (selectedType === "شخصي") {
        // userId: number, customer_id: number, amount: number, report: string, transactionType: "incoming" | "outgoing", date: string
        const userId = userInfo?.id ?? 0;
        const customer_id = customer;
        const transactionAmount = Number(amount);
        const transactionReport = report;
        const transactionType = "incoming";
        const transactionDate = new Date().toISOString().slice(0, 10);

        console.log("newPersonalTransaction", {
          userId,
          customer_id,
          transactionAmount,
          transactionReport,
          transactionType,
          transactionDate,
        });

        const result = await window.electron.addPersonalTransaction(
          userId,
          customer_id,
          transactionAmount,
          transactionReport,
          transactionType,
          transactionDate
        );
        console.log("Transaction added:", result);
        if (result.id) {
          setUpdateFlag(!updateFlag);
        }
        toast.success("تمت إضافة المعاملة الشخصية بنجاح!", { autoClose: 3000 });
      } else if (selectedType === "معاملة") {
        console.log("Saving procedure transaction...");
        toast.success("تمت إضافة المعاملة بنجاح!", { autoClose: 3000 });
        try {
          const transaction = await window.electron.addTransaction(
            Number(userInfo?.id),
            (customerName as string) ?? "",
            Number(amount),
            report,
            Number(procedurId),
            "procedure",
            "incoming",
            transactionDate
          );
          console.log("Transaction added:", transaction);

          if (transaction.id) {
            console.log("Transaction added:", transaction);

            setUpdateFlag(!updateFlag); // Trigger update
            toast.success("تمت إضافة المعاملة بنجاح!", { autoClose: 3000 });
          }
        } catch (error) {
          console.error("Error saving procedure transaction:", error);
          toast.error("فشل إضافة المعاملة. يرجى المحاولة مرة أخرى.", {
            autoClose: 3000,
          });
        }
      }

      setCustomerName("");
      setAmount("");
      setTransactionNumber("");
      setProcedureId(null);
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

  const handleConfirmDelete = async () => {
    if (transactionToDelete === null) return;

    try {
      if (selectedType === "شخصي") {
        await window.electron.deletePersonalTransaction(transactionToDelete);
        setPersonalTransactions(
          personalTransactions.filter((t) => t.id !== transactionToDelete)
        );
      } else if (selectedType === "معاملة") {
        console.log(transactionToDelete);
        await window.electron.deleteTransaction(transactionToDelete);
        setProcedureTransactions(
          procedureTransactions.filter((t) => t.id !== transactionToDelete)
        );
      } else {
        setTransactions(
          transactions.filter((t) => t.id !== transactionToDelete)
        );
      }

      // Show success toast after deletion is complete
      toast.success("تم حذف المعاملة بنجاح!", { autoClose: 3000 });

      // Reset deletion state
      setTransactionToDelete(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("فشل حذف المعاملة. يرجى المحاولة مرة أخرى.", {
        autoClose: 3000,
      });
    }
  };

  // const filteredTransactions = transactions.filter(
  //   (t) =>
  //     t.recipient.includes(searchQuery) || t.transactionId.includes(searchQuery)
  // );

  // const filteredPersonalTransactions = personalTransactions.filter((t) =>
  //   t.name.includes(searchQuery)
  // );

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
      <ToastContainer />
      {/* Search Section */}
      <div>
        <div className="search-section">
          <input
            type="text"
            placeholder="ابحث بالاسم أو رقم المعاملة"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Form Section */}
        <div className="form-section">
          <button className="save-btn" onClick={handleSave} disabled={!amount}>
            حفظ
          </button>
          <div className="input-group">
            <label>اختر المعاملة</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}>
              <option value="شخصي">شخصي</option>
              <option value="معاملة">معاملة</option>
              <option value="ايجار">ايجار</option>
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
          <div className="input-group">
            <label>اختر العملة</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}>
              <option value="دينار">دينار</option>
              <option value="دولار">دولار</option>
            </select>
          </div>
          {selectedType === "معاملة" && (
            <div className="input-group">
              <label>ادخل رقم المعاملة</label>
              <Select
                allowClear
                value={procedurId}
                onChange={(value) => setProcedureId(value as number)}>
                {allProcedures?.map((p) => (
                  <Option key={p.id} value={p.id}>
                    {p.id}
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
          <div className="input-group">
            <label>ادخل الاسم</label>
            {selectedType === "شخصي" ? (
              <Select
                allowClear
                value={customer}
                onChange={(value) => setCustomer(value as number)}>
                {customersAccount.map((ca) => (
                  <Option key={ca.id} value={ca.id}>
                    {ca.name}
                  </Option>
                ))}
              </Select>
            ) : (
              <input
                onKeyDown={handleKeyDown}
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            )}
          </div>
          <div className="input-group">
            <label>التفاصيل</label>
            <input
              type="text"
              value={report}
              onChange={(e) => setReport(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="input-group">
            <label>اختر التاريخ</label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {selectedType === "شخصي" && (
        <PersonalTransactions
          personalTransactions={personalTransactions}
          setPersonalTransactions={setPersonalTransactions}
          onDelete={handleDelete}
          selectedType={selectedType}
          activeTab={activeTab}
        />
      )}
      {selectedType === "ايجار" && (
        <TenantTransactions
          transactions={personalTransactions}
          onDelete={handleDelete}
        />
      )}
      {selectedType === "معاملة" && (
        <ProcedureTransactions
          procedureTransactions={procedureTransactions}
          onDelete={handleDelete}
          selectedType={selectedType}
          activeTab={activeTab}
        />
      )}
    </div>
  );
};

export default IncomingPage;
