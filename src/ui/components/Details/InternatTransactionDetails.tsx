import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "./InternalTransactionDetails.css";

const InternalTransactionDetails: React.FC = () => {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [transaction, setTransaction] = useState<InternalTransaction | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const result = await window.electron.getInternalTransactionById(
          Number(transactionId)
        );
        if (result) {
          setTransaction(result);
        }
      } catch (error) {
        console.log("Error fetching transaction:", error);

        alert("حدث خطأ أثناء جلب تفاصيل العملية");
      }
    };
    fetchTransaction();
  }, [transactionId]);

  const handleChange = (
    field: keyof InternalTransaction,
    value: string | number | undefined
  ) => {
    if (transaction) setTransaction({ ...transaction, [field]: value });
  };

  const handleSave = async () => {
    if (!transaction) {
      alert("لا توجد بيانات عملية لحفظها.");
      return;
    }
    try {
      console.log("transaction before save:", transaction);

      await window.electron.updateInternalTransaction(
        Number(transactionId),
        transaction
      );
      setIsEditing(false);
      alert("تم حفظ التعديلات بنجاح");
    } catch (error) {
      console.log("Error saving transaction:", error);

      alert("فشل في حفظ التعديلات! يرجى التحقق من البيانات المدخلة.");
    }
  };

  if (!transaction) return <div>جاري التحميل...</div>;

  return (
    <div className="internal-transaction-details-container" dir="rtl">
      <h2>تفاصيل العملية الداخلية</h2>
      <table className="internal-transaction-table">
        <tbody>
          <tr>
            <th>رقم العملية</th>
            <td>{transaction.id}</td>
          </tr>
          <tr>
            <th>من نوع</th>
            <td>
              {isEditing ? (
                <input
                  className="internal-transaction-form-group"
                  value={transaction.fromType}
                  onChange={(e) => handleChange("fromType", e.target.value)}
                />
              ) : (
                transaction.fromType
              )}
            </td>
          </tr>
          <tr>
            <th>من (ID)</th>
            <td>
              {isEditing ? (
                <input
                  className="internal-transaction-form-group"
                  type="number"
                  value={transaction.fromId}
                  onChange={(e) =>
                    handleChange("fromId", Number(e.target.value))
                  }
                />
              ) : (
                transaction.fromId
              )}
            </td>
          </tr>
          <tr>
            <th>إلى نوع</th>
            <td>
              {isEditing ? (
                <input
                  className="internal-transaction-form-group"
                  value={transaction.toType}
                  onChange={(e) => handleChange("toType", e.target.value)}
                />
              ) : (
                transaction.toType
              )}
            </td>
          </tr>
          <tr>
            <th>إلى (ID)</th>
            <td>
              {isEditing ? (
                <input
                  className="internal-transaction-form-group"
                  type="number"
                  value={transaction.toId}
                  onChange={(e) => handleChange("toId", Number(e.target.value))}
                />
              ) : (
                transaction.toId
              )}
            </td>
          </tr>
          <tr>
            <th>المبلغ</th>
            <td>
              {isEditing ? (
                <input
                  className="internal-transaction-form-group"
                  type="number"
                  value={transaction.amount}
                  onChange={(e) =>
                    handleChange("amount", Number(e.target.value))
                  }
                />
              ) : (
                transaction.amount
              )}
            </td>
          </tr>
          <tr>
            <th>التاريخ</th>
            <td>
              {isEditing ? (
                <input
                  className="internal-transaction-form-group"
                  type="date"
                  value={transaction.date?.slice(0, 10)}
                  onChange={(e) => handleChange("date", e.target.value)}
                />
              ) : (
                transaction.date?.slice(0, 10)
              )}
            </td>
          </tr>
          <tr>
            <th>تفاصيل إضافية</th>
            <td>
              {isEditing ? (
                <textarea
                  className="internal-transaction-form-group"
                  value={transaction.details || ""}
                  onChange={(e) => handleChange("details", e.target.value)}
                />
              ) : (
                transaction.details || "لا يوجد"
              )}
            </td>
          </tr>
        </tbody>
      </table>
      <div>
        {isEditing ? (
          <>
            <button
              className="internal-transaction-save-button"
              onClick={handleSave}>
              حفظ
            </button>
            <button
              className="internal-transaction-cancel-button"
              onClick={() => setIsEditing(false)}>
              إلغاء
            </button>
          </>
        ) : (
          <button
            className="internal-transaction-edit-button"
            onClick={() => setIsEditing(true)}>
            تعديل
          </button>
        )}
        <button
          className="internal-transaction-back-button"
          onClick={() =>
            navigate(location.state.from, {
              state: {
                activeTab: location.state?.activeTab,
              },
            })
          }>
          العودة
        </button>
      </div>
    </div>
  );
};

export default InternalTransactionDetails;
