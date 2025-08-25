import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./CustomerDetails.css";
import { toast, ToastContainer } from "react-toastify";

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [account, setAccount] = useState<{
    id: number;
    name: string;
    accountNumber: string;
    accountType: string;
    phone: string;
    address: string;
    date: string;
    details: string | null;
  } | null>(null);

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const accountDetails = await window.electron.getCustomersAccountById(
          Number(id)
        );
        console.log("Account Details:", accountDetails);

        setAccount(accountDetails);
      } catch (error) {
        console.error("Error fetching account details:", error);
      }
    };

    fetchAccountDetails();
  }, [id]);

  const handleSave = async () => {
    try {
      if (account) {
        await window.electron.updateCustomersAccount(
          account.id,
          "name",
          account.name
        );
        await window.electron.updateCustomersAccount(
          account.id,
          "accountNumber",
          account.accountNumber
        );
        await window.electron.updateCustomersAccount(
          account.id,
          "accountType",
          account.accountType
        );
        await window.electron.updateCustomersAccount(
          account.id,
          "phone",
          account.phone
        );
        await window.electron.updateCustomersAccount(
          account.id,
          "address",
          account.address
        );
        await window.electron.updateCustomersAccount(
          account.id,
          "date",
          account.date
        );
        await window.electron.updateCustomersAccount(
          account.id,
          "details",
          account.details || ""
        );
        toast("تم تحديث الحساب بنجاح!");
        navigate(-1);
      }
    } catch (error) {
      console.error("Error updating account:", error);
      toast("حدث خطأ أثناء تحديث الحساب!");
    }
  };

  if (!account) {
    return <div>Loading...</div>;
  }

  return (
    <div className="customer-details-container">
      <ToastContainer />
      <h2 className="customer-details-title">تفاصيل الحساب</h2>
      {/* <div className="customer-details-form-group">
        <label>رقم الحساب</label>
        <input
          type="text"
          value={account.accountNumber}
          onChange={(e) =>
            setAccount({ ...account, accountNumber: e.target.value })
          }
        />
      </div> */}
      <div className="customer-details-form-group">
        <label>الاسم</label>
        <input
          type="text"
          value={account.name}
          onChange={(e) => setAccount({ ...account, name: e.target.value })}
        />
      </div>
      <div className="customer-details-form-group">
        <label>نوع الحساب</label>
        <select
          value={account.accountType}
          onChange={(e) =>
            setAccount({ ...account, accountType: e.target.value })
          }>
          <option value="">اختر نوع الحساب</option>
          <option value="محامي">محامي</option>
          <option value="موظف">موظف</option>
          <option value="شخصي">شخصي</option>
          <option value="مستأجر">مستأجر</option>
          <option value="موكل">موكل</option>
        </select>
      </div>
      <div className="customer-details-form-group">
        <label>رقم الهاتف</label>
        <input
          type="text"
          value={account.phone}
          onChange={(e) => setAccount({ ...account, phone: e.target.value })}
        />
      </div>
      <div className="customer-details-form-group">
        <label>العنوان</label>
        <input
          type="text"
          value={account.address}
          onChange={(e) => setAccount({ ...account, address: e.target.value })}
        />
      </div>
      {/* <div className="customer-details-form-group">
        <label>التاريخ</label>
        <input
          type="date"
          value={account.date}
          onChange={(e) => setAccount({ ...account, date: e.target.value })}
        />
      </div> */}
      <div className="customer-details-form-group">
        <label>تفاصيل إضافية</label>
        <textarea
          value={account.details || ""}
          onChange={(e) => setAccount({ ...account, details: e.target.value })}
        />
      </div>
      <button className="customer-details-save-button" onClick={handleSave}>
        حفظ
      </button>
      <button
        className="customer-details-cancel-button"
        onClick={() => navigate(-1)}>
        إلغاء
      </button>
    </div>
  );
}
