import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Input, Button, Select, List, message } from "antd";
import FileUploader from "../FileUploader";
import "./ProcedureDetailsStyle.css";
import { toast, ToastContainer } from "react-toastify";

const { Option } = Select;
const { TextArea } = Input;

export default function ProcedureDetails() {
  const { id } = useParams(); // Get the procedure ID from the URL
  const navigate = useNavigate();
  const [customerAccounts, setCustomerAccounts] = useState<Customer[]>([]);
  const [record, setRecord] = useState({
    procedureNumber: "",
    procedureName: "",
    description: "",
    date: "",
    status: "",
    phone: "",
    owners: [] as number[], // Array of owner IDs
  });
  const [attachments, setAttachments] = useState<
    {
      id: number;
      entity_id?: number | null;
      entity_type?: string;
      path: string;
      created_at?: string;
    }[]
  >([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);

  const fetchAttachments = async (procedureId: number) => {
    setAttachmentsLoading(true);
    try {
      const rows = await window.electron.getAttachments(
        "procedure",
        procedureId
      );
      setAttachments(rows || []);
    } catch (err) {
      console.error("Failed to fetch attachments", err);
    } finally {
      setAttachmentsLoading(false);
    }
  };

  const getAllCustomersAccounts = async () => {
    try {
      const customersAccounts = await window.electron.getAllCustomersAccounts();
      console.log("Fetched Customers Accounts:", customersAccounts);
      setCustomerAccounts(
        customersAccounts.map(
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
        )
      );
    } catch (error) {
      console.log("Error fetching data from the database:", error);
    }
  };

  const getProcedureById = async (id: number) => {
    try {
      const response = await window.electron.getProcedureById(id);
      if (response) {
        setRecord({
          procedureNumber: response.procedureNumber,
          procedureName: response.procedureName,
          description: response.description,
          date: response.date.slice(0, 10), // Extract YYYY-MM-DD
          status: response.status,
          phone: response.phone,
          owners: response.owners.map((owner) => owner.id), // Map owners to their IDs
        });
      } else {
        console.error("Record not found");
      }
    } catch (error) {
      console.error("Error fetching record:", error);
    }
  };

  useEffect(() => {
    console.log("Procedure ID:", id);
    getProcedureById(Number(id));
    getAllCustomersAccounts();
    if (id) fetchAttachments(Number(id));
  }, [id]);

  const handleSave = () => {
    console.log("Updated Record:", record);

    // Save the updated record to the database
    window.electron
      .updateProcedure(Number(id), "procedureNumber", record.procedureNumber)
      .then(() => {
        console.log("Procedure number updated successfully");
      })
      .catch((error) => {
        console.error("Error updating procedure number:", error);
      });

    window.electron
      .updateProcedure(Number(id), "procedureName", record.procedureName)
      .then(() => {
        console.log("Procedure name updated successfully");
      })
      .catch((error) => {
        console.error("Error updating procedure name:", error);
      });

    window.electron
      .updateProcedure(Number(id), "description", record.description)
      .then(() => {
        console.log("Description updated successfully");
      })
      .catch((error) => {
        console.error("Error updating description:", error);
      });

    window.electron
      .updateProcedure(Number(id), "date", record.date)
      .then(() => {
        console.log("Date updated successfully");
      })
      .catch((error) => {
        console.error("Error updating date:", error);
      });

    window.electron
      .updateProcedure(Number(id), "status", record.status)
      .then(() => {
        console.log("Status updated successfully");
      })
      .catch((error) => {
        console.error("Error updating status:", error);
      });

    window.electron
      .updateProcedure(Number(id), "phone", record.phone)
      .then(() => {
        console.log("Phone updated successfully");
      })
      .catch((error) => {
        console.error("Error updating phone:", error);
      });

    // Update owners
    const validOwners = record.owners.filter(
      (ownerId) => ownerId !== null && ownerId !== undefined
    ); // Ensure only valid IDs
    console.log("Valid Owners:", validOwners);

    window.electron
      .updateProcedureOwners(Number(id), validOwners)
      .then(() => {
        console.log("Owners updated successfully");
      })
      .catch((error) => {
        console.error("Error updating owners:", error);
      });

    // Show success message
    toast("تم حفظ التعديلات بنجاح");
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="procedure-details-container">
      <ToastContainer />
      <h2>تفاصيل المعاملة: {id}</h2>
      <div className="procedure-form-group">
        <label>رقم المعاملة</label>
        <Input
          value={record.procedureNumber}
          onChange={(e) =>
            setRecord({ ...record, procedureNumber: e.target.value })
          }
        />
      </div>
      <div className="procedure-form-group">
        <label>اسم المعاملة</label>
        <Input
          value={record.procedureName}
          onChange={(e) =>
            setRecord({ ...record, procedureName: e.target.value })
          }
        />
      </div>
      <div className="procedure-form-group">
        <label>الوصف</label>
        <TextArea
          value={record.description}
          onChange={(e) =>
            setRecord({ ...record, description: e.target.value })
          }
          rows={4}
        />
      </div>
      <div className="procedure-form-group">
        <label>التاريخ</label>
        <input
          type="date"
          value={record.date}
          onChange={(e) => setRecord({ ...record, date: e.target.value })}
        />
      </div>
      <div className="procedure-form-group">
        <label>الحالة</label>
        <Input
          value={record.status}
          onChange={(e) => setRecord({ ...record, status: e.target.value })}
        />
      </div>
      <div className="procedure-form-group">
        <label>الهاتف</label>
        <Input
          value={record.phone}
          onChange={(e) => setRecord({ ...record, phone: e.target.value })}
        />
      </div>
      <div className="procedure-form-group">
        <label>اصحاب المعاملة</label>
        <Select
          mode="multiple"
          allowClear
          value={record.owners}
          onChange={(values) => setRecord({ ...record, owners: values })}
          style={{ width: "100%" }}>
          {customerAccounts.map((account) => (
            <Option key={account.id} value={account.id}>
              {account.name}
            </Option>
          ))}
        </Select>
      </div>
      <div style={{ marginTop: 12 }} className="procedure-form-group">
        <label>المرفقات (صورة أو PDF)</label>
        <div style={{ marginBottom: 8 }}>
          <FileUploader
            subfolder={id ? `procedures/${id}` : `procedures/temp`}
            accept="image/*,application/pdf"
            onSaved={async (savedPath) => {
              try {
                if (id) {
                  await window.electron.addAttachment(
                    "procedure",
                    Number(id),
                    savedPath
                  );
                  await fetchAttachments(Number(id));
                  message.success("تم إضافة المرفق");
                } else {
                  message.info("احفظ المعاملة أولاً ثم أضف المرفقات");
                }
              } catch (err) {
                console.error("Failed to persist attachment", err);
                message.error("فشل حفظ المرفق");
              }
            }}
          />
        </div>

        <List
          loading={attachmentsLoading}
          dataSource={attachments}
          locale={{ emptyText: "لا توجد مرفقات" }}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  onClick={async () => {
                    try {
                      await window.electron.openFile(item.path);
                    } catch (err) {
                      console.error("Failed to open attachment", err);
                      message.error("فشل فتح الملف");
                    }
                  }}>
                  فتح
                </Button>,
                <Button
                  type="link"
                  danger
                  onClick={async () => {
                    const ok = window.confirm(
                      "هل أنت متأكد من حذف هذا المرفق؟"
                    );
                    if (!ok) return;
                    try {
                      const res = await window.electron.deleteAttachment(
                        item.id
                      );
                      if (res.deleted) {
                        setAttachments((rows) =>
                          rows.filter((r) => r.id !== item.id)
                        );
                        message.success("تم حذف المرفق");
                      } else {
                        message.error("فشل حذف المرفق");
                      }
                    } catch (err) {
                      console.error("Failed to delete attachment", err);
                      message.error("فشل حذف المرفق");
                    }
                  }}>
                  حذف
                </Button>,
              ]}>
              <code style={{ fontSize: 13 }}>
                {item.path.split(/[\\/]/).pop()}
              </code>
            </List.Item>
          )}
        />
      </div>
      <div style={{ textAlign: "center" }}>
        <Button className="procedure-save-button" onClick={handleSave}>
          حفظ التعديلات
        </Button>
        <Button
          className="procedure-cancel-button"
          onClick={() => navigate(-1)}>
          إلغاء
        </Button>
      </div>
    </div>
  );
}
