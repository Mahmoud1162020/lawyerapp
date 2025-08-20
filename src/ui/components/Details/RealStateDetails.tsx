import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Input, Button, Select, List, message } from "antd";
import FileUploader from "../FileUploader";
import "./RealStateDetailsStyle.css";

const { Option } = Select;
const { TextArea } = Input;

export default function RealStateDetails() {
  const { id } = useParams(); // Get the record ID from the URL
  const navigate = useNavigate();
  const [customerAccounts, setCustomersAccounts] = useState<
    {
      id: number;
      name: string;
      accountNumber: string;
      accountType: string;
      phone: string;
      address: string;
      date: string;
      details: string | null;
    }[]
  >([]);
  const [record, setRecord] = useState({
    propertyTitle: "عقار 1",
    propertyNumber: "123",
    owners: ["مالك 1"],
    address: "بغداد",
    price: "100000",
    date: "2023-01-01",
    details: "تفاصيل العقار",
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

  const fetchAttachments = async (realStateId: number) => {
    setAttachmentsLoading(true);
    try {
      const rows = await window.electron.getAttachments(
        "realstate",
        realStateId
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
      setCustomersAccounts(customersAccounts);
    } catch (error) {
      console.log("Error fetching data from the database:", error);
    }
  };

  const getRealStateById = async (id: number) => {
    try {
      const response = await window.electron.getRealStateById(id);
      console.log("resa", response);

      if (response) {
        setRecord({
          propertyTitle: response.propertyTitle,
          propertyNumber: response.propertyNumber,
          owners: response.owners.map((owner) => String(owner.id)),
          address: response.address,
          price: String(response.price),
          date: response.date.slice(0, 10), // Extract YYYY-MM-DD
          details: response.details ?? "",
        });
      } else {
        console.error("Record not found");
      }
    } catch (error) {
      console.error("Error fetching record:", error);
    }
  };

  useEffect(() => {
    console.log("Record ID:", id);
    getRealStateById(Number(id));
    getAllCustomersAccounts();
    if (id) fetchAttachments(Number(id));
  }, [id]);

  const handleSave = () => {
    console.log("Updated Record:", record);

    // Save the updated record to the database
    window.electron
      .updateRealState(Number(id), "propertyTitle", record.propertyTitle)
      .then(() => {
        console.log("Property title updated successfully");
      })
      .catch((error) => {
        console.error("Error updating property title:", error);
      });

    window.electron
      .updateRealState(Number(id), "propertyNumber", record.propertyNumber)
      .then(() => {
        console.log("Property number updated successfully");
      })
      .catch((error) => {
        console.error("Error updating property number:", error);
      });

    window.electron
      .updateRealState(Number(id), "address", record.address)
      .then(() => {
        console.log("Address updated successfully");
      })
      .catch((error) => {
        console.error("Error updating address:", error);
      });

    window.electron
      .updateRealState(Number(id), "price", Number(record.price))
      .then(() => {
        console.log("Price updated successfully");
      })
      .catch((error) => {
        console.error("Error updating price:", error);
      });

    window.electron
      .updateRealState(Number(id), "date", record.date)
      .then(() => {
        console.log("Date updated successfully");
      })
      .catch((error) => {
        console.error("Error updating date:", error);
      });

    window.electron
      .updateRealState(Number(id), "details", record.details)
      .then(() => {
        console.log("Details updated successfully");
      })
      .catch((error) => {
        console.error("Error updating details:", error);
      });

    // Update owners
    const validOwners = record.owners.filter(
      (ownerId) => ownerId !== null && ownerId !== undefined
    ); // Ensure only valid IDs
    console.log("Valid Owners:", validOwners);

    window.electron
      .updateRealStateOwners(
        Number(id),
        record.owners.map((ownerId) => Number(ownerId))
      ) // Convert owner IDs to numbers
      .then(() => {
        console.log("Owners updated successfully");
      })
      .catch((error) => {
        console.error("Error updating owners:", error);
      });

    // Show success message
    alert("تم حفظ التعديلات بنجاح");
    navigate(-1); // Navigate back to the previous page
  };
  console.log("record------", record);

  return (
    <div className="real-state-details-container">
      <h2>تفاصيل العقار: {id}</h2>
      <div className="real-state-form-group">
        <label>اسم العقار</label>
        <Input
          value={record.propertyTitle}
          onChange={(e) =>
            setRecord({ ...record, propertyTitle: e.target.value })
          }
        />
      </div>
      <div className="real-state-form-group">
        <label>رقم العقار</label>
        <Input
          value={record.propertyNumber}
          onChange={(e) =>
            setRecord({ ...record, propertyNumber: e.target.value })
          }
        />
      </div>
      <div className="real-state-form-group">
        <label>اصحاب العقار</label>
        <Select
          mode="tags"
          allowClear
          value={record.owners} // Display owners as strings
          onChange={(values) => {
            console.log("Selected Owners:", values);
            setRecord({ ...record, owners: values }); // Update owners with selected values
          }}
          style={{ width: "100%" }}>
          {customerAccounts.map((account) => (
            <Option key={account.id} value={account.id}>
              {account.name}
            </Option>
          ))}
        </Select>
      </div>
      <div className="real-state-form-group">
        <label>عنوان العقار</label>
        <Input
          value={record.address}
          onChange={(e) => setRecord({ ...record, address: e.target.value })}
        />
      </div>
      <div className="real-state-form-group">
        <label>السعر</label>
        <Input
          value={record.price}
          onChange={(e) => setRecord({ ...record, price: e.target.value })}
        />
      </div>
      <div className="real-state-form-group">
        <label>التاريخ</label>
        <input
          type="date"
          value={record.date}
          onChange={(e) => setRecord({ ...record, date: e.target.value })}
        />
      </div>
      <div className="real-state-form-group">
        <label>الملاحظات</label>
        <TextArea
          value={record.details}
          onChange={(e) => setRecord({ ...record, details: e.target.value })}
          rows={4}
        />
      </div>
      <div style={{ marginTop: 12 }} className="real-state-form-group">
        <label>المرفقات (صورة أو PDF)</label>
        <div style={{ marginBottom: 8 }}>
          <FileUploader
            subfolder={id ? `realstates/${id}` : `realstates/temp`}
            accept="image/*,application/pdf"
            onSaved={async (savedPath) => {
              try {
                if (id) {
                  await window.electron.addAttachment(
                    "realstate",
                    Number(id),
                    savedPath
                  );
                  await fetchAttachments(Number(id));
                  message.success("تم إضافة المرفق");
                } else {
                  message.info("احفظ العقار أولاً ثم أضف المرفقات");
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
        <Button className="real-state-save-button" onClick={handleSave}>
          حفظ التعديلات
        </Button>
        <Button
          className="real-state-cancel-button"
          onClick={() => navigate(-1)}>
          إلغاء
        </Button>
      </div>
    </div>
  );
}
