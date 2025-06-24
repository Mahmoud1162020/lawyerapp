import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../outgoingContent/OutgoingContent.css";
import ConfirmModal from "../../Modal/ConfirmModal";
import { useLocation } from "react-router-dom";
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
interface IncomingPageProps {
  activeTab: string;
}

const IncomingPage: React.FC<IncomingPageProps> = ({ activeTab }) => {
  const [amount, setAmount] = useState<number | "">("");
  const location = useLocation();
  const [customer, setCustomer] = useState<number>();
  // const [currency, setCurrency] = useState("دينار"); // Default currency
  const [selectedType, setSelectedType] = useState("شخصي"); // Default selection
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [report, setReport] = useState("");
  const [updateFlag, setUpdateFlag] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(
    null
  );
  const [contractId, setContractId] = useState<number | null>(null);
  interface RealState {
    id: number;
    propertyTitle: string;
    propertyNumber: string;
    address: string;
    price: number;
    date: string;
    details: string | null;
    owners: { id: number; name: string }[];
  }

  const [realStates, setRealStates] = useState<RealState[]>([]);
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [customersAccount, setCustomersAccount] = React.useState<
    CustomerAccount[]
  >([]);
  const [personalTransactions, setPersonalTransactions] = React.useState<
    PersonalTransaction[]
  >([]);
  const [tenansTransactions, setTenansTransactions] = useState<
    TenantTransaction[] | TenantResponse[]
  >([]); // Assuming Transaction type is defined elsewhere

  interface TenantResponse {
    id: number;
    contractStatus: string;
    startDate: string;
    tenantNames: string[];
    propertyNumber: number;
    endDate: string;
    entitlement: number;
    contractNumber: string;
    installmentCount: number;
    leasedUsage: string;
    propertyType: string;
    propertyDetails: {
      id: number;
      propertyTitle: string;
      propertyNumber: string;
      address: string;
      price: number;
      date: string;
      details: string | null;
    };
    propertyId: number;
    installmentAmount?: number;
    installmentsDue?: string; // Add this property as string (JSON)
  }

  const [tenants, setTenants] = useState<TenantResponse[]>([]); // Now TenantResponse includes installmentsDue
  const [userInfo, setUserInfo] = useState<User | null>();
  const [realStateValue, setRealStateValue] = useState<number | null>(null);

  // const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allProcedures, setAllProcedures] = useState<Procedure[]>();
  const [procedurId, setProcedureId] = useState<number | null>(null);
  const [procedureTransactions, setProcedureTransactions] = useState<
    Transaction[]
  >([]);
  const [customerObject, setCustomerObject] = useState<CustomerAccount | null>(
    null
  );
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
  }, [location.state]);

  useEffect(() => {
    const fetchAllTenantsTransactions = async () => {
      try {
        const response = await window.electron.getAllTenantTransactions();
        console.log("Fetched all tenants transactions:", response);
        setTenansTransactions(response);
      } catch (error) {
        console.error("Error fetching all tenants transactions:", error);
        toast.error(
          "حدث خطأ أثناء جلب معاملات المستأجرين. يرجى المحاولة مرة أخرى.",
          {
            autoClose: 3000,
          }
        );
      }
    };
    fetchAllTenantsTransactions();
  }, [updateFlag]);

  useEffect(() => {
    const fetchPersonalTransactions = async () => {
      try {
        const rawTransactions =
          await window.electron.getAllPersonalTransactions();

        // First, map to ensure all required fields are present for PersonalTransaction type
        const mappedTransactions = rawTransactions.map(
          (t: PersonalTransaction | unknown) => ({
            ...(t as PersonalTransaction),
            type: (t as PersonalTransaction).type ?? "personal",
            transactionType:
              (t as PersonalTransaction).transactionType ?? "incoming",
          })
        );

        // Then filter transactions with transactionType "incoming" and type "personal"
        const filteredTransactions = mappedTransactions.filter(
          (t: PersonalTransaction) =>
            t.transactionType === "incoming" && t.type === "personal"
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

  console.log("====================================");
  console.log(customer);
  console.log("====================================");

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

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response: {
          id: number;
          contractStatus: string;
          startDate: string;
          tenantNames: string[];
          propertyNumber: number;
          endDate: string;
          entitlement: number;
          contractNumber: string;
          installmentCount: number;
          leasedUsage: string;
          propertyType: string;
          propertyDetails: {
            id: number;
            propertyTitle: string;
            propertyNumber: string;
            address: string;
            price: number;
            date: string;
            details: string | null;
          };
        }[] = await window.electron.getAllTenants();
        console.log("Fetched tenants transactions:", response);
        // Ensure propertyId is present for each tenant object
        setTenants(
          response.map((tenant) => ({
            ...tenant,
            propertyId:
              tenant.propertyDetails?.id ?? tenant.propertyNumber ?? 0,
          }))
        );
      } catch (error) {
        console.error("Error fetching tenants transactions:", error);
        toast.error(
          "حدث خطأ أثناء جلب معاملات المستأجرين. يرجى المحاولة مرة أخرى.",
          {
            autoClose: 3000,
          }
        );
      }
    };
    const fetchRealState = async () => {
      try {
        const response = await window.electron.getAllRealStates();
        console.log("Fetched real state transactions:", response);
        setRealStates(response);
      } catch (error) {
        console.error("Error fetching real state transactions:", error);
        toast.error(
          "حدث خطأ أثناء جلب معاملات العقارات. يرجى المحاولة مرة أخرى.",
          {
            autoClose: 3000,
          }
        );
      }
    };

    fetchTenants();
    fetchRealState();
  }, [updateFlag]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSave(); // Trigger the save function when Enter is pressed
    }
  };

  const handleSave = async () => {
    console.log("Saving transaction...");

    try {
      console.log("this is try of saving ", amount);

      if (amount === "" || amount === 0) {
        alert("يرجى ملء جميع الحقول المطلوبة!");
        return;
      }

      if (selectedType === "شخصي") {
        // userId: number, customer_id: number, amount: number, report: string, transactionType: "incoming" | "outgoing", date: string
        const userId = userInfo?.id ?? 0;
        const customer_id = customer ?? 0;
        const transactionAmount = Number(amount);
        const transactionReport = report;
        const transactionType = "incoming";

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
      } else if (selectedType === "ايجار") {
        console.log("Saving tenant transaction...");
        const userId = userInfo?.id ?? 0;
        const customer_id = customerObject?.id ?? 0;
        const transactionAmount = Number(amount);
        const transactionReport = report;
        const transactionType = "incoming";
        const propertyId = realStateValue ?? 0;
        const contractIdValue = contractId ?? 0;
        console.log("newTenantTransaction", {
          userId,
          customer_id,
          transactionAmount,
          transactionReport,
          transactionType,
          transactionDate,
          propertyId,
          contractId: contractIdValue,
        });

        // Call addTenantTransaction with correct arguments
        const result = await window.electron.addTenantTransaction(
          contractId ?? 0,
          realStateValue ?? 0,
          customerObject?.id ?? 0,
          {
            amount: Number(amount),
            date: transactionDate,
            isPaid: true, // Default to unpaid
            isCredit: false, // Default to not credit
          }
        );
        console.log("Tenant transaction added:", result);
        alert(`تمت إضافة معاملة الإيجار بنجاح!`);
      }

      setCustomerName("");
      setAmount("");
      setProcedureId(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "حدث خطأ غير متوقع!";
      toast.error(`❌ خطأ: ${errorMessage}`);
      alert("Error saving transaction:" + errorMessage);
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
      } else if (selectedType === "ايجار") {
        console.log("Deleting tenant transaction:", transactionToDelete);

        await window.electron.deleteTenantTransaction(transactionToDelete);
      }

      // Show success toast after deletion is complete
      toast.success("تم حذف المعاملة بنجاح!", { autoClose: 3000 });
      // Reset deletion state
      setTransactionToDelete(null);
      setIsModalOpen(false);
      setUpdateFlag(!updateFlag); // Trigger update to refresh the list
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

  console.log("====================================");
  console.log("customerObject", customerObject);
  console.log("realStateValue", realStates);
  console.log("tenants", tenants);

  console.log("====================================");

  // Find related real states for the selected customerObject

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
          <button className="save-btn" onClick={handleSave}>
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
          {/* <div className="input-group">
            <label>اختر العملة</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}>
              <option value="دينار">دينار</option>
              <option value="دولار">دولار</option>
            </select>
          </div> */}
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
          {selectedType !== "ايجار" && (
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
          )}

          {selectedType === "ايجار" && (
            <div className="input-group">
              <label>ادخل اسم المستأجر</label>
              <Select
                allowClear
                value={customerObject?.name}
                onChange={(value) => {
                  console.log(customersAccount);

                  const result = customersAccount.filter((ca) => {
                    return ca.id === Number(value);
                  });
                  console.log(result);

                  setCustomerObject(result[0]);
                }}>
                {customersAccount.map((ca) => (
                  <Option key={ca.id} value={ca.id}>
                    {ca.name}
                  </Option>
                ))}
              </Select>
            </div>
          )}

          {selectedType === "ايجار" && (
            <div className="input-group">
              <label> رقم العقار </label>
              <Select
                allowClear
                value={realStateValue}
                onChange={(value) => setRealStateValue(value as number)}>
                {realStates
                  .filter((rs) =>
                    tenants.some(
                      (t) =>
                        t.propertyId === rs.id &&
                        Array.isArray(t.tenantNames) &&
                        customerObject?.name !== undefined &&
                        t.tenantNames.includes(customerObject.name)
                    )
                  )
                  .map((rs) => {
                    return (
                      <Option key={rs.id} value={rs.id}>
                        {rs.propertyTitle}
                      </Option>
                    );
                  })}
              </Select>
            </div>
          )}
          {selectedType === "ايجار" && (
            <div className="input-group">
              <label> رقم العقد </label>
              <Select
                allowClear
                value={contractId}
                onChange={(value) => {
                  setContractId(value as number);
                  console.log("value", value);
                }}>
                {tenants
                  .filter(
                    (t) =>
                      customerObject?.name !== undefined &&
                      t.tenantNames.includes(customerObject.name) &&
                      t.propertyId === realStateValue
                  )
                  .map((t) => {
                    return (
                      <Option key={t.id} value={t.id}>
                        {t.contractNumber}
                      </Option>
                    );
                  })}
              </Select>
            </div>
          )}
          {selectedType === "ايجار" && (
            <div className="input-group">
              <label> ‏تاريخ الاستحقاق</label>
              {tenants
                .filter((t) => t.id === contractId)
                .map((t) => {
                  console.log("tenants", t);

                  // Assume installmentsDue is a JSON string array of objects with isPaid and dueDate
                  type Installment = {
                    isPaid: boolean;
                    date?: string;
                    amount?: number;
                  };
                  let unpaidInstallments: Installment[] = [];
                  try {
                    unpaidInstallments =
                      JSON.parse(
                        (t as TenantResponse).installmentsDue || "[]"
                      )?.filter((i: Installment) => !i.isPaid) || [];
                  } catch (e) {
                    console.log("Error parsing installmentsDue:", e);

                    unpaidInstallments = [];
                  }
                  // Render an input for each unpaid installment's due date (or a placeholder if not available)
                  return (
                    <Select
                      allowClear
                      placeholder="اختر تاريخ الاستحقاق"
                      style={{ width: "100%" }}
                      // You may want to store the selected installment index or date in state if needed
                    >
                      {unpaidInstallments.map((inst) => (
                        <Option key={inst.date} value={inst.date}>
                          {inst.date
                            ? `${inst.date} ${
                                inst.isPaid === false ? "غير مدفوع" : "مدفوع"
                              }`
                            : "بدون تاريخ"}
                        </Option>
                      ))}
                    </Select>
                  );
                })}
            </div>
          )}
          {selectedType === "ايجار" && (
            <div className="input-group">
              <label> ‏مبلغ الاستحقاق</label>
              {tenants
                .filter((t) => {
                  return (
                    customerObject?.name !== undefined &&
                    t.tenantNames.includes(customerObject.name) &&
                    t.propertyId === realStateValue
                  );
                })
                .map((t) => {
                  return <input disabled={true} value={t.installmentAmount} />;
                })}
            </div>
          )}

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
          tenansTransactions={tenansTransactions}
          onDelete={handleDelete}
          selectedType={selectedType}
          activeTab={activeTab}
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
