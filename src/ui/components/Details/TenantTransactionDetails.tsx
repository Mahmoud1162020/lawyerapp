import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import "./TenantTransactionDetails.css";

interface TenantTransactionDetailsProps {
  transactionId: number;
  customerName: string;
  date: string;
  amount: number;
  isPaid: boolean;
  description: string;
  propertyTitle: string;
  propertyNumber: string;
  propertyAddress: string;
  propertyPrice: number;
  tenantContractNumber: string;
  tenantStartDate: string;
  tenantEndDate: string;
  tenantLeasedUsage: string;
}

const TenantTransactionDetails: React.FC = () => {
  const { id: transactionId } = useParams<{ transactionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [transactionDetails, setTransactionDetails] =
    useState<TenantTransactionDetailsProps | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Fetch transaction details from the backend
    const fetchTransactionDetails = async () => {
      try {
        const response = await window.electron.getTenatnTransactionById(
          Number(transactionId)
        );
        setTransactionDetails(response);
        console.log("Fetched transaction details:", response);
      } catch (error) {
        console.error("Error fetching transaction details:", error);
      }
    };

    fetchTransactionDetails();
  }, [transactionId]);

  const handleInputChange = (
    field: keyof TenantTransactionDetailsProps,
    value: string | number | boolean
  ) => {
    if (transactionDetails) {
      setTransactionDetails({ ...transactionDetails, [field]: value });
    }
  };

  const handleSave = async () => {
    try {
      await window.electron.updateTenantTransaction(
        transactionDetails.transactionId,
        {
          amount: transactionDetails.amount,
          date: transactionDetails.date,
          isPaid: transactionDetails.isPaid,
        }
      );
      setIsEditing(false);
      alert("تم حفظ التعديلات بنجاح");
    } catch (error) {
      console.error("Error saving transaction details:", error);
      alert("حدث خطأ أثناء حفظ التعديلات");
    }
  };

  if (!transactionDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="tenant-transaction-details" dir="rtl">
      <h2>تفاصيل المعاملة</h2>
      <table>
        <tbody>
          <tr>
            <th>رقم المعاملة</th>
            <td>{transactionDetails.transactionId}</td>
          </tr>
          <tr>
            <th>اسم العميل</th>
            <td> {transactionDetails.customerName}</td>
          </tr>
          <tr>
            <th>التاريخ</th>
            <td>
              {isEditing ? (
                <input
                  type="date"
                  value={transactionDetails.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              ) : (
                transactionDetails.date
              )}
            </td>
          </tr>
          <tr>
            <th>المبلغ</th>
            <td>
              {isEditing ? (
                <input
                  type="number"
                  value={transactionDetails.amount}
                  onChange={(e) =>
                    handleInputChange("amount", Number(e.target.value))
                  }
                />
              ) : (
                transactionDetails.amount
              )}
            </td>
          </tr>
          <tr>
            <th>مدفوع</th>
            <td>
              {isEditing ? (
                <select
                  value={transactionDetails.isPaid ? "1" : "0"}
                  onChange={(e) =>
                    handleInputChange("isPaid", e.target.value === "1")
                  }>
                  <option value="1">نعم</option>
                  <option value="0">لا</option>
                </select>
              ) : transactionDetails.isPaid ? (
                "نعم"
              ) : (
                "لا"
              )}
            </td>
          </tr>
          <tr>
            <th>الوصف</th>
            <td>
              {isEditing ? (
                <textarea
                  value={transactionDetails.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                />
              ) : (
                transactionDetails.description || "لا يوجد"
              )}
            </td>
          </tr>
          <tr>
            <th>عنوان العقار</th>
            <td>{transactionDetails.propertyTitle}</td>
          </tr>
          <tr>
            <th>رقم العقار</th>
            <td>{transactionDetails.propertyNumber}</td>
          </tr>
          <tr>
            <th>عنوان العقار</th>
            <td>{transactionDetails.propertyAddress}</td>
          </tr>
          <tr>
            <th>سعر العقار</th>
            <td>{transactionDetails.propertyPrice}</td>
          </tr>
          <tr>
            <th>رقم العقد</th>
            <td>{transactionDetails.tenantContractNumber}</td>
          </tr>
          <tr>
            <th>تاريخ بدء العقد</th>
            <td>{transactionDetails.tenantStartDate}</td>
          </tr>
          <tr>
            <th>تاريخ انتهاء العقد</th>
            <td>{transactionDetails.tenantEndDate}</td>
          </tr>
          <tr>
            <th>استخدام العقار</th>
            <td>{transactionDetails.tenantLeasedUsage}</td>
          </tr>
        </tbody>
      </table>
      <div className="actions">
        {isEditing ? (
          <>
            <button className="save-btn" onClick={handleSave}>
              حفظ
            </button>
            <button className="cancel-btn" onClick={() => setIsEditing(false)}>
              إلغاء
            </button>
          </>
        ) : (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            تعديل
          </button>
        )}
        <button
          className="back-btn"
          onClick={() =>
            navigate(location.state?.from || "/cash", {
              state: {
                selectedType: location.state?.selectedType,
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

export default TenantTransactionDetails;
