import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Input, Button } from "antd";
import { toast } from "react-toastify";
import "./ProcedureIncomingDetails.css";

interface ProcedureTransaction {
  id: number;
  procedureId: string;
  recipient: string;
  date: string;
  amount: number;
  currency: string;
  report: string;
}

const ProcedureIncomingDetails: React.FC = () => {
  const { id } = useParams(); // Get the transaction ID from the URL
  const navigate = useNavigate();
  const location = useLocation();
  const [transaction, setTransaction] = useState<ProcedureTransaction | null>(
    null
  );

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      try {
        const details = await window.electron.getTransactionById(Number(id));
        if (details) {
          setTransaction(details);
        } else {
          toast.error("لم يتم العثور على المعاملة", { autoClose: 3000 });
        }
      } catch (error) {
        console.error("Error fetching transaction details:", error);
        toast.error("خطأ في جلب التفاصيل", { autoClose: 3000 });
      }
    };

    fetchTransactionDetails();
  }, [id]);

  const handleSave = async () => {
    try {
      if (!transaction) return;

      await window.electron.updateTransaction(
        transaction.id,
        "amount",
        transaction.amount
      );
      await window.electron.updateTransaction(
        transaction.id,
        "report",
        transaction.report
      );
      await window.electron.updateTransaction(
        transaction.id,
        "date",
        transaction.date
      );

      toast.success("تم حفظ التعديلات بنجاح", { autoClose: 3000 });
      navigate(location.state?.from || "/cash", {
        state: {
          selectedType: location.state?.selectedType,
          activeTab: location.state?.activeTab,
        },
      });
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error("فشل حفظ التعديلات", { autoClose: 3000 });
    }
  };

  return (
    <div className="procedure-details-container">
      <h2>تفاصيل المعاملة: {transaction?.id}</h2>
      <div className="form-group">
        <label>رقم الإجراء</label>
        <Input value={transaction?.procedureId} disabled />
      </div>
      <div className="form-group">
        <label>الاسم</label>
        <Input value={transaction?.recipient} disabled />
      </div>
      <div className="form-group">
        <label>المبلغ</label>
        <Input
          type="number"
          value={transaction?.amount}
          onChange={(e) =>
            setTransaction((prev) =>
              prev ? { ...prev, amount: Number(e.target.value) } : prev
            )
          }
        />
      </div>
      <div className="form-group">
        <label>التاريخ</label>
        <Input
          type="date"
          value={transaction?.date?.slice(0, 10)}
          onChange={(e) =>
            setTransaction((prev) =>
              prev ? { ...prev, date: e.target.value } : prev
            )
          }
        />
      </div>
      <div className="form-group">
        <label>التقرير</label>
        <Input
          value={transaction?.report}
          onChange={(e) =>
            setTransaction((prev) =>
              prev ? { ...prev, report: e.target.value } : prev
            )
          }
        />
      </div>
      <div className="buttons">
        <Button className="save-button" onClick={handleSave}>
          حفظ التعديلات
        </Button>
        <Button
          className="cancel-button"
          onClick={() =>
            navigate(location.state?.from || "/cash", {
              state: {
                selectedType: location.state?.selectedType,
                activeTab: location.state?.activeTab,
              },
            })
          }>
          إلغاء
        </Button>
      </div>
    </div>
  );
};

export default ProcedureIncomingDetails;
