import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./styles/TransactionDetailsStyle.css"; // Import the CSS file

const TransactionDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item;

  const [editableItem, setEditableItem] = useState(item || {});
  const [showModal, setShowModal] = useState(false);
  const [tempAmount, setTempAmount] = useState("");

  if (!item) {
    return (
      <div className="transaction-container">
        <h2>المعاملة غير موجودة</h2>
        <p>يرجى الرجوع للخلف وتحديد معاملة.</p>
      </div>
    );
  }
  console.log("====================================");
  console.log(item);
  console.log("====================================");
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditableItem({ ...editableItem, [e.target.name]: e.target.value });
  };

  const handleConfirmAmount = () => {
    setEditableItem({ ...editableItem, amount: tempAmount });
    setShowModal(false);
  };

  const handleSave = () => {
    console.log("Saving transaction:", editableItem);
    alert("تم حفظ التغييرات بنجاح!");
  };

  return (
    <div className="transaction-container">
      <h1>تفاصيل المعاملة</h1>

      <table className="transactions-table">
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
          <tr>
            <td>{editableItem.id}</td>
            <td>
              <input
                type="text"
                name="recipient"
                value={editableItem.recipient || ""}
                onChange={handleChange}
              />
            </td>
            <td>
              <input
                type="text"
                name="transactionNumber"
                value={editableItem.transactionId || ""}
                onChange={handleChange}
              />
            </td>
            <td>
              <button className="btn" onClick={() => setShowModal(true)}>
                المبلغ
              </button>
            </td>
            <td>
              <textarea
                name="report"
                rows={4}
                value={editableItem.report || ""}
                onChange={handleChange}></textarea>
            </td>
            <td>
              <input
                type="date"
                name="date"
                value={
                  new Date(editableItem.date).toISOString().slice(0, 10) || ""
                }
                onChange={handleChange}
              />
            </td>
            <td>
              <button className="btn save-btn" onClick={handleSave}>
                حفظ
              </button>
              <button className="btn" onClick={() => navigate(-1)}>
                إلغاء
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Confirm Amount Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>تأكيد المبلغ</h3>
            <input
              type="number"
              value={tempAmount}
              onChange={(e) => setTempAmount(e.target.value)}
            />
            <button className="btn" onClick={handleConfirmAmount}>
              تأكيد
            </button>
            <button className="btn" onClick={() => setShowModal(false)}>
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetails;
