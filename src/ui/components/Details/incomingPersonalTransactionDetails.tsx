import {
  useParams,
  useNavigate,
  useLocation,
  NavigateFunction,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { Input, Button } from "antd";
import { toast } from "react-toastify";
import "./IncomingPersonalTransactionDetails.css";

export default function IncomingPersonalTransactionDetails() {
  const { id } = useParams(); // Get the transaction ID from the URL
  const location = useLocation();
  console.log("Transaction ID:", id, location.state);

  const navigate: NavigateFunction = useNavigate();
  const [record, setRecord] = useState<PersonalTransaction>(
    {} as PersonalTransaction
  );

  useEffect(() => {
    async function fetchDetails() {
      try {
        const details = await window.electron.getPersonalTransactionById(
          Number(id)
        );
        console.log("Fetched details:", details);

        if (details) setRecord(details);
        else toast.error("لم يتم العثور على المعاملة");
      } catch (error) {
        toast.error("خطأ في جلب التفاصيل");
      }
    }
    fetchDetails();
  }, [id]);

  const handleSave = async () => {
    try {
      await window.electron.updatePersonalTransaction(
        record.id,
        "amount",
        Number(record.amount)
      );
      await window.electron.updatePersonalTransaction(
        record.id,
        "report",
        record.report
      );

      await window.electron.updatePersonalTransaction(
        record.id,
        "date",
        record.date
      );
      toast.success("تم حفظ التعديلات بنجاح");
      navigate(location.state?.from || "/cash", {
        state: { selectedType: location.state?.selectedType },
      });
    } catch (error) {
      toast.error("فشل حفظ التعديلات");
    }
  };

  return (
    <div className="transaction-details-container">
      <h2>تفاصيل المعاملة: {record.id}</h2>
      <div className="transaction-form-group">
        <label>الاسم</label>
        <Input
          value={record.customer_name}
          // onChange={(e) => setRecord({ ...record, recipient: e.target.value })}
        />
      </div>

      <div className="transaction-form-group">
        <label>رقم الحساب</label>
        <Input
          value={record.customer_accountNumber}
          // onChange={(e) => setRecord({ ...record, recipient: e.target.value })}
        />
      </div>
      <div className="transaction-form-group">
        <label>المبلغ</label>
        <Input
          type="number"
          value={record.amount}
          onChange={(e) =>
            setRecord({ ...record, amount: Number(e.target.value) })
          }
        />
      </div>
      <div className="transaction-form-group">
        <label> له </label>
        <Input
          value={record.customer_credit}
          // onChange={(e) => setRecord({ ...record, recipient: e.target.value })}
        />
      </div>
      <div className="transaction-form-group">
        <label>عليه</label>
        <Input
          value={record.customer_debit}
          // onChange={(e) => setRecord({ ...record, recipient: e.target.value })}
        />
      </div>

      <div className="transaction-form-group">
        <label>التقرير</label>
        <Input
          value={record.report}
          onChange={(e) => setRecord({ ...record, report: e.target.value })}
        />
      </div>
      <div className="transaction-form-group">
        <label>التاريخ</label>
        <Input
          type="date"
          value={record.date?.slice(0, 10)}
          onChange={(e) => setRecord({ ...record, date: e.target.value })}
        />
      </div>
      <div style={{ textAlign: "center" }}>
        <Button className="transaction-save-button" onClick={handleSave}>
          حفظ التعديلات
        </Button>
        <Button
          className="transaction-cancel-button"
          onClick={() =>
            navigate(location.state.from || "/cash", {
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
}
