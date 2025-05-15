import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Input, Button, Select } from "antd";
import "./OutgoingTransactionDetailsStyle.css";

const { Option } = Select;

export default function OutgoingTransactionDetails() {
  const { id } = useParams(); // Get the transaction ID from the URL
  console.log("ID------>", id);
  const location = useLocation();

  const navigate = useNavigate();
  const [user, setUser] = useState<
    {
      id: number;
      username: string;
    }[]
  >([]);
  const [record, setRecord] = useState<Transaction>({
    id: 1,
    userId: 1,
    recipient: "",
    amount: 1,
    report: "",
    procedureId: 1,
    type: "procedure",
    date: "",
  });

  const getTransactionById = async (id: number) => {
    try {
      const response = await window.electron.getTransactionById(id); // Fetch transaction by ID
      console.log("Fetched Transaction:", response);

      if (response) {
        setRecord({
          id: response.id, // Include the id property
          userId: response.userId,
          recipient: response.recipient,
          amount: response.amount,
          report: response.report || "",
          procedureId: response.procedureId,
          type: response.type,
          date: response.date.slice(0, 10), // Extract YYYY-MM-DD
        });
      } else {
        console.error("Transaction not found");
      }
    } catch (error) {
      console.error("Error fetching transaction:", error);
    }
  };

  useEffect(() => {
    console.log("Transaction ID:", id);
    getTransactionById(Number(id));
  }, [id]);

  const handleSave = () => {
    console.log("Updated Transaction Record:", record);

    // Save the updated transaction record to the database

    window.electron
      .updateTransaction(Number(id), "recipient", record.recipient)
      .then(() => {
        console.log("Recipient updated successfully");
      })
      .catch((error) => {
        console.error("Error updating recipient:", error);
      });

    window.electron
      .updateTransaction(Number(id), "amount", Number(record.amount))
      .then(() => {
        console.log("Amount updated successfully");
      })
      .catch((error) => {
        console.error("Error updating amount:", error);
      });

    window.electron
      .updateTransaction(Number(id), "report", record.report)
      .then(() => {
        console.log("Report updated successfully");
      })
      .catch((error) => {
        console.error("Error updating report:", error);
      });

    window.electron
      .updateTransaction(Number(id), "procedureId", record.procedureId)
      .then(() => {
        console.log("Procedure ID updated successfully");
      })
      .catch((error) => {
        console.error("Error updating procedure ID:", error);
      });

    window.electron
      .updateTransaction(Number(id), "type", record.type)
      .then(() => {
        console.log("Type updated successfully");
      })
      .catch((error) => {
        console.error("Error updating type:", error);
      });

    // Show success message
    alert("تم حفظ التعديلات بنجاح");
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="transaction-details-container">
      <h2>تفاصيل المعاملة: {id}</h2>
      <div className="transaction-form-group"></div>
      <div className="transaction-form-group">
        <label>المستلم</label>
        <Input
          value={record.recipient}
          onChange={(e) => setRecord({ ...record, recipient: e.target.value })}
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
      {/* <div className="transaction-form-group">
        <label>التقرير</label>
        <Input
          value={record.report}
          onChange={(e) => setRecord({ ...record, report: e.target.value })}
        />
      </div> */}
      <div className="transaction-form-group">
        <label>رقم المعاملة</label>
        <Input
          type="number"
          value={record.procedureId || ""}
          onChange={(e) =>
            setRecord({ ...record, procedureId: Number(e.target.value) })
          }
        />
      </div>
      <div className="transaction-form-group">
        <label>النوع</label>
        <Select
          value={record.type}
          onChange={(value) => setRecord({ ...record, type: value })}
          style={{ width: "100%", height: "60px" }}>
          <Option value="procedure">معاملة</Option>
          <Option value="personal">شخصي</Option>
        </Select>
      </div>
      <div className="transaction-form-group">
        <label>التاريخ</label>
        <input
          type="date"
          value={record.date}
          onChange={(e) => setRecord({ ...record, date: e.target.value })}
        />
      </div>
      <div className="transaction-form-group">
        <label>التقرير</label>
        <Input.TextArea
          rows={4}
          value={record.report}
          onChange={(e) => setRecord({ ...record, report: e.target.value })}
        />
      </div>

      <div style={{ textAlign: "center" }}>
        <Button className="transaction-save-button" onClick={handleSave}>
          حفظ التعديلات
        </Button>
        <Button
          className="transaction-cancel-button"
          onClick={() =>
            navigate("/cash", {
              state: { selectedType: location.state?.selectedType },
            })
          }>
          إلغاء
        </Button>
      </div>
    </div>
  );
}
