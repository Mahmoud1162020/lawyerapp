import React, { useEffect, useState } from "react";
import "./InternalEntry.css";
import ConfirmModal from "../../Modal/ConfirmModal";
import { useLocation, useNavigate } from "react-router-dom";

interface InternatTransactionProps {
  activeTab: string;
}
const InternalTransactions: React.FC<InternatTransactionProps> = ({
  activeTab,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [filteredEntries, setFilteredEntries] = useState<InternalTransaction[]>(
    []
  );
  const [amount, setAmount] = useState<number | "">("");
  const [updateFlag, setUpdateFlag] = useState<boolean>(false);
  const [recipient, setRecipient] = useState<
    Customer | Procedure | realState | undefined
  >(undefined);
  const [details, setDetails] = useState<string>(""); // Placeholder for details
  // const [currency, setCurrency] = useState("دينار"); // Default currency
  const [selectedFromType, setSelectedFromType] = useState("شخصي"); // Default selection
  const [selectedToType, setSelectedToType] = useState("شخصي"); // Default selection
  const [realState, setRealState] = useState<realState[] | []>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  ); // Default to current date
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);
  const [sender, setSender] = useState<
    Customer | Procedure | realState | undefined
  >(undefined);

  const [customersAccounts, setCustomersAccounts] = useState<Customer[] | []>(
    []
  );
  const [procedures, setProcedures] = useState<Procedure[] | []>([]);

  const [entries, setEntries] = useState<InternalTransaction[]>([]);

  const fetchCustomersAccounts = async () => {
    const res = await window.electron.getAllCustomersAccounts();
    if (res) {
      // Ensure debit and credit fields exist for each customer
      const customersWithDebitCredit: Customer[] = res.map(
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
      );
      setCustomersAccounts(customersWithDebitCredit);
    } else {
      alert("Failed to fetch customer accounts");
    }
  };
  const fetchAllProcedures = async () => {
    const res = await window.electron.getAllProcedures();
    if (res) {
      setProcedures(res);
    }
  };

  const getAllInternalTransactions = async () => {
    const res = await window.electron.getAllInternalTransactions();
    if (res) {
      console.log("Fetched Internal Transactions:", res);
      setEntries(res);
    } else {
      alert("Failed to fetch internal transactions");
    }
  };

  const fetchAllRealStates = async () => {
    const res = await window.electron.getAllRealStates();
    if (res) {
      console.log("Fetched Real States:", res);
      // setRealStates(res);
      if (res) {
        setRealState(res);
      }
    } else {
      alert("Failed to fetch real states");
    }
  };
  useEffect(() => {
    //fetch all customers accounts from the server
    fetchCustomersAccounts();
    fetchAllProcedures();
    fetchAllRealStates();
    getAllInternalTransactions();
  }, [updateFlag]);

  const handleSave = async () => {
    if (!amount || !recipient || !sender) {
      alert("يرجى ملء جميع الحقول المطلوبة!");
      return;
    }

    const newEntry = {
      fromId: sender.id,
      toId: recipient.id,
      amount: amount,
      fromType: selectedFromType,
      toType: selectedToType,
      date: date, // Current date in
      details: details, // Placeholder for details
    };
    console.log("New Entry:", newEntry);
    try {
      const res = await window.electron.addInternalTransaction(newEntry);
      console.log(res);
      if (res) {
        alert("تم حفظ العملية بنجاح!");
      } else {
        alert("فشل في حفظ العملية!");
      }

      // setEntries([...entries, newEntry]);
      setUpdateFlag((prev) => !prev); // Trigger update
      setRecipient(undefined);
      setSender(undefined);
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]); // Reset to current date
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        console.log("Error saving internal transaction:", error.message);
        // Extract Arabic message after 'Error:'
        const msg = error.message.split("Error:")[1]?.trim() || error.message;
        alert("فشل في حفظ العملية! يرجى التحقق من البيانات المدخلة. " + msg);
      } else {
        console.log("Error saving internal transaction:", error);
        alert("فشل في حفظ العملية! يرجى التحقق من البيانات المدخلة.");
      }
    }
  };

  const handleDelete = (id: number) => {
    setEntryToDelete(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (entryToDelete !== null) {
      setEntries(entries.filter((entry) => entry.id !== entryToDelete));
      await window.electron.deleteInternalTransaction(entryToDelete);
      setEntryToDelete(null);
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    const filteredEntries = entries.filter((entry) => {
      // Find from/to names/types
      let fromName = "";
      if (entry.fromType === "شخصي") {
        const customer = customersAccounts.find(
          (account) => account.id === entry.fromId
        );
        fromName = customer ? customer.name : "";
      } else if (entry.fromType === "معاملة") {
        const procedure = procedures.find((p) => p.id === entry.fromId);
        fromName = procedure ? procedure.procedureName : "";
      } else if (entry.fromType === "عقار") {
        const rs = realState.find((p) => p.id === entry.fromId);
        fromName = rs ? rs.propertyTitle : "";
      }

      let toName = "";
      if (entry.toType === "شخصي") {
        const customer = customersAccounts.find(
          (account) => account.id === entry.toId
        );
        toName = customer ? customer.name : "";
      } else if (entry.toType === "معاملة") {
        const procedure = procedures.find((p) => p.id === entry.toId);
        toName = procedure ? procedure.procedureName : "";
      } else if (entry.toType === "عقار") {
        const rs = realState.find((p) => p.id === entry.toId);
        toName = rs ? rs.propertyTitle : "";
      }

      // Search in id, fromName, toName, amount, date, details
      const q = searchQuery.trim();
      return (
        !q ||
        entry.id?.toString().includes(q) ||
        fromName.includes(q) ||
        toName.includes(q) ||
        (entry.amount && entry.amount.toString().includes(q)) ||
        (entry.date && entry.date.includes(q)) ||
        (entry.details && entry.details.includes(q))
      );
    });
    setFilteredEntries(filteredEntries);
  }, [searchQuery, customersAccounts, entries, procedures, realState]);
  console.log("sender:", sender);

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
          <label>نوع الحساب</label>
          <select
            value={selectedFromType}
            onChange={(e) => setSelectedFromType(e.target.value)}>
            <option value="شخصي">شخصي</option>
            <option value="معاملة">معاملة</option>
            <option value="عقار">عقار</option>
          </select>
        </div>

        <div className="input-group">
          <label> من:</label>
          {selectedFromType === "شخصي" && (
            <select
              value={sender ? String(sender.id) : ""}
              onChange={(e) => {
                const selectedAccount = customersAccounts.find(
                  (account) => String(account.id) === e.target.value
                );
                console.log("Selected Account:", selectedAccount);

                setSender(selectedAccount);
              }}>
              <option value="">اختر اسم العميل</option>
              {customersAccounts.map((account) => {
                return (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                );
              })}
            </select>
          )}
          {selectedFromType === "معاملة" && (
            <select
              value={sender ? String(sender.id) : ""}
              onChange={(e) => {
                const selectedProcedure = procedures.find(
                  (p) => String(p.id) === e.target.value
                );
                console.log("Selected Account:", selectedProcedure);

                setSender(selectedProcedure);
              }}>
              <option value="">اختر معاملة</option>
              {procedures.map((p) => {
                return (
                  <option key={p.id} value={p.id}>
                    {p.procedureName}
                  </option>
                );
              })}
            </select>
          )}
          {selectedFromType === "عقار" && (
            <select
              value={sender ? String(sender.id) : ""}
              onChange={(e) => {
                const selectedRealState = realState.find(
                  (p) => String(p.id) === e.target.value
                );
                console.log("Selected Account:", selectedRealState);

                setSender(selectedRealState);
              }}>
              <option value="">اختر عقار</option>
              {realState?.map((rs) => {
                return (
                  <option key={rs.id} value={rs.id}>
                    {rs.propertyTitle}
                  </option>
                );
              })}
            </select>
          )}
          {/* <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          /> */}
        </div>

        <div className="input-group">
          <label>نوع الحساب</label>
          <select
            value={selectedToType}
            onChange={(e) => setSelectedToType(e.target.value)}>
            <option value="شخصي">شخصي</option>
            <option value="معاملة">معاملة</option>
            <option value="عقار">عقار</option>
          </select>
        </div>

        <div className="input-group">
          <label> الى:</label>
          {selectedToType === "شخصي" && (
            <select
              value={recipient ? String(recipient.id) : ""}
              onChange={(e) => {
                const selectedAccount = customersAccounts.find(
                  (account) => String(account.id) === e.target.value
                );
                console.log("Selected Account:", selectedAccount);

                setRecipient(selectedAccount);
              }}>
              <option value="">اختر اسم العميل</option>
              {customersAccounts.map((account) => {
                return (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                );
              })}
            </select>
          )}
          {selectedToType === "معاملة" && (
            <select
              value={recipient ? String(recipient.id) : ""}
              onChange={(e) => {
                const selectedProcedure = procedures.find(
                  (p) => String(p.id) === e.target.value
                );
                console.log("Selected Account:", selectedProcedure);

                setRecipient(selectedProcedure);
              }}>
              <option value="">اختر معاملة</option>
              {procedures.map((p) => {
                return (
                  <option key={p.id} value={p.id}>
                    {p.procedureName}
                  </option>
                );
              })}
            </select>
          )}
          {selectedToType === "عقار" && (
            <select
              value={recipient ? String(recipient.id) : ""}
              onChange={(e) => {
                const selectedRealState = realState.find(
                  (p) => String(p.id) === e.target.value
                );
                console.log("Selected Account:", selectedRealState);

                setRecipient(selectedRealState);
              }}>
              <option value="">اختر عقار</option>
              {realState?.map((rs) => {
                return (
                  <option key={rs.id} value={rs.id}>
                    {rs.propertyTitle}
                  </option>
                );
              })}
            </select>
          )}
        </div>
        <div className="input-group">
          <label>ادخل المبلغ</label>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>

        {/* <div className="input-group">
          <label>اختر التاريخ</label>
          <input
            style={{ maxWidth: "200px" }}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />{" "}
        </div> */}
        <div className="input-group">
          <label>التفاصيل</label>
          <textarea onChange={(e) => setDetails(e.target.value)} />
        </div>
        {/* <div className="input-group">
          <label>اختر العملة</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}>
            <option value="دينار">دينار</option>
            <option value="دولار">دولار</option>
          </select>
        </div> */}
      </div>

      {/* Display Entries Table */}
      <div className="entries-table">
        <table>
          <thead>
            <tr>
              <th>ت ع</th>
              <th>من</th>
              <th>الى</th>
              <th>المبلغ</th>
              <th>التاريخ</th>
              <th>التفاصيل</th>
              <th>خيارات</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries?.map((entry) => {
              console.log("Entry:", entry);
              let From = "";
              if (entry.fromType === "شخصي") {
                const customer = customersAccounts.find(
                  (account) => account.id === entry.fromId
                );
                From = customer ? customer.name + " (شخصي)" : "غير معروف";
                console.log("Customer:", customer?.name);
              }
              if (entry.fromType === "معاملة") {
                const procedure = procedures.find((p) => p.id === entry.fromId);
                From = procedure
                  ? procedure.procedureName + " (معاملة)"
                  : "غير معروف";
                console.log("Procedure:", procedure?.procedureName);
              }
              if (entry.fromType === "عقار") {
                const rs = realState.find((p) => p.id === entry.fromId);
                From = rs ? rs.propertyTitle + " (عقار)" : "غير معروف";
              }
              let To = "";
              if (entry.toType === "شخصي") {
                const customer = customersAccounts.find(
                  (account) => account.id === entry.toId
                );
                To = customer ? customer.name + " (شخصي)" : "غير معروف";
                console.log("Customer:", customer?.name);
              }
              if (entry.toType === "معاملة") {
                const procedure = procedures.find((p) => p.id === entry.toId);
                To = procedure
                  ? procedure.procedureName + "(معاملة)"
                  : "غير معروف";
                console.log("Procedure:", procedure?.procedureName);
              }
              if (entry.toType === "عقار") {
                const rs = realState.find((p) => p.id === entry.toId);
                To = rs ? rs.propertyTitle + "(عقار)" : "غير معروف";
              }

              return (
                <tr key={entry.id}>
                  <td>{entry.id}</td>
                  <td>{From}</td>
                  <td>{To}</td>
                  <td>{entry.amount}</td>
                  <td>{entry.date}</td>

                  <td>{entry.details}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(Number(entry?.id))}>
                      حذف
                    </button>
                    <button
                      className="details-button"
                      onClick={() =>
                        navigate(`/internal-transaction-details/${entry.id}`, {
                          state: {
                            from: location.pathname,
                            activeTab: activeTab,
                          },
                        })
                      }>
                      التفاصيل
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InternalTransactions;
