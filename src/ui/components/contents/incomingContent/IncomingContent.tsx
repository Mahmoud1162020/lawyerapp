import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "../outgoingContent/OutgoingContent.css";
import ConfirmModal from "../../Modal/ConfirmModal";
import { Link } from "react-router-dom";
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
const IncomingPage: React.FC = () => {
  const [amount, setAmount] = useState<number | "">("");
  const [transactionNumber, setTransactionNumber] = useState<string>("");
  const [customer, setCustomer] = useState<number>();
  const [currency, setCurrency] = useState("دينار"); // Default currency
  const [selectedType, setSelectedType] = useState("شخصي"); // Default selection
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(
    null
  );
  const [customersAccount, setCustomersAccount] = React.useState<
    CustomerAccount[]
  >([]);
  const [personalTransactions, setPersonalTransactions] = React.useState<
    PersonalTransaction[]
  >([]);
  const [userInfo, setUserInfo] = useState<User | null>();

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [procedureTransactions, setProcedureTransactions] = useState([
    {
      id: 1,
      transactionId: "12345",
      recipient: "Ahmed",
      amount: 1000,
      currency: "دينار",
      date: "2024-01-01",
    },
  ]);
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

  const fetchPersonlalTransactions = async () => {
    try {
      const response: PersonalTransaction[] =
        await window.electron.getAllPersonalTransactions();
      console.log("Fetched personal transactions:", response);

      setPersonalTransactions(response);
    } catch (error) {
      console.error("Error fetching personal transactions:", error);
      toast.error(
        "حدث خطأ أثناء جلب المعاملات الشخصية. يرجى المحاولة مرة أخرى.",
        { autoClose: 3000 }
      );
    }
  };

  useEffect(() => {
    getUserInfo();
    fetchCustomersAccount();
    fetchPersonlalTransactions();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSave(); // Trigger the save function when Enter is pressed
    }
  };

  const handleSave = async () => {
    try {
      if (!customer || !amount) {
        toast.error("يرجى ملء جميع الحقول المطلوبة!", { autoClose: 3000 });
        return;
      }

      if (selectedType === "شخصي") {
        // userId: number, customer_id: number, amount: number, report: string, transactionType: "incoming" | "outgoing", date: string
        const newPersonalTransaction = {
          userId: userInfo?.id,
          customer_id: customer,
        };
        console.log("newPersonalTransaction", newPersonalTransaction);

        // await window.electron.addPersonalTransaction({});
        toast.success("تمت إضافة المعاملة الشخصية بنجاح!", { autoClose: 3000 });
      } else {
        const newTransaction = {
          id: transactions.length + 1,
          recipient: customer,
          transactionId: transactionNumber,
          amount: Number(amount),
          currency,
          date: new Date().toISOString().slice(0, 10),
        };
        setTransactions([...transactions, newTransaction]);

        toast.success("تمت إضافة المعاملة بنجاح!", { autoClose: 3000 });
      }

      setCustomer("");
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
    }
    if (selectedType === "معاملة") {
      setTransactions(transactions.filter((t) => t.id !== transactionToDelete));
    } else {
      setTransactions(transactions.filter((t) => t.id !== transactionToDelete));
    }

    toast.success("تم حذف المعاملة بنجاح!", { autoClose: 3000 });

    setTransactionToDelete(null);
    setIsModalOpen(false);
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
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={!customer || !amount}>
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
            {/* <input
              onKeyDown={handleKeyDown}
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
            /> */}
          </div>

          {
            <div className="input-group">
              <label>اختر العملة</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}>
                <option value="دينار">دينار</option>
                <option value="دولار">دولار</option>
              </select>
            </div>
          }
        </div>
      </div>

      {selectedType === "شخصي" && (
        <PersonalTransactions
          personalTransactions={personalTransactions}
          setPersonalTransactions={setPersonalTransactions}
          onDelete={handleDelete}
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
          transactions={procedureTransactions}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default IncomingPage;
