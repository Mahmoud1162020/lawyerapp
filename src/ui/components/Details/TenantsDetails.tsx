import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { Input, Button, Select, List } from "antd";
import FileUploader from "../FileUploader";
import "./TenantsDetailsStyle.css";

const { Option } = Select;

export default function TenantsDetails() {
  const { id } = useParams(); // Get the tenant ID from the URL
  const navigate = useNavigate();
  const [customersAccounts, setCustomersAccounts] = useState<
    {
      id: number;
      name: string;
    }[]
  >([]);
  const [record, setRecord] = useState<{
    tenantName: { id: number; name: string }[];
    contractNumber: string;
    startDate: string;
    endDate: string;
    entitlement: string;
    leasedUsage: string;
    propertyType: string;
  }>({
    tenantName: [{ id: 0, name: "" }], // Initialize with an empty object
    contractNumber: "",
    startDate: "",
    endDate: "",
    entitlement: "",
    leasedUsage: "",
    propertyType: "",
  });
  console.log("====================================");
  console.log(record);
  console.log("====================================");
  type Attachment = {
    id: number;
    realstate_id: number | null;
    procedure_id?: number | null;
    tenant_id?: number | null;
    path: string;
    created_at?: string;
  };

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const getAllCustomersAccounts = async () => {
    try {
      const customersAccounts = await window.electron.getAllCustomersAccounts();
      console.log("Fetched Customers Accounts:", customersAccounts);
      setCustomersAccounts(customersAccounts);
    } catch (error) {
      console.log("Error fetching data from the database:", error);
    }
  };

  const getTenantById = async (id: number) => {
    try {
      const response = await window.electron.getTenantById(id);
      console.log("response", response);

      if (response) {
        setRecord({
          tenantName: response.tenantNames, // Map strings to objects with id and name
          contractNumber: response.contractNumber,
          startDate: response.startDate.slice(0, 10), // Extract YYYY-MM-DD
          endDate: response.endDate.slice(0, 10), // Extract YYYY-MM-DD
          entitlement: String(response.entitlement),
          leasedUsage: response.leasedUsage,
          propertyType: response.propertyType,
        });
      } else {
        console.error("Tenant not found");
      }
    } catch (error) {
      console.error("Error fetching tenant:", error);
    }
  };

  const fetchAttachments = useCallback(async () => {
    if (!id) return;
    setAttachmentsLoading(true);
    try {
      const rows = await window.electron.getAttachments(Number(id));
      setAttachments((rows as Attachment[]) || []);
    } catch (err) {
      console.error("Failed to fetch attachments", err);
    } finally {
      setAttachmentsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    console.log("Tenant ID:", id);
    getTenantById(Number(id));
    getAllCustomersAccounts();
    fetchAttachments();
  }, [id, fetchAttachments]);

  const handleSave = () => {
    console.log("Updated Tenant Record:", record);

    // Save the updated tenant record to the database
    window.electron
      .updateTenant(Number(id), "contractNumber", record.contractNumber)
      .then(() => {
        console.log("Contract number updated successfully");
      })
      .catch((error) => {
        console.error("Error updating contract number:", error);
      });

    window.electron
      .updateTenant(Number(id), "startDate", record.startDate)
      .then(() => {
        console.log("Start date updated successfully");
      })
      .catch((error) => {
        console.error("Error updating start date:", error);
      });

    window.electron
      .updateTenant(Number(id), "endDate", record.endDate)
      .then(() => {
        console.log("End date updated successfully");
      })
      .catch((error) => {
        console.error("Error updating end date:", error);
      });

    window.electron
      .updateTenant(Number(id), "entitlement", Number(record.entitlement))
      .then(() => {
        console.log("Entitlement updated successfully");
      })
      .catch((error) => {
        console.error("Error updating entitlement:", error);
      });

    window.electron
      .updateTenant(Number(id), "leasedUsage", record.leasedUsage)
      .then(() => {
        console.log("Leased usage updated successfully");
      })
      .catch((error) => {
        console.error("Error updating leased usage:", error);
      });

    window.electron
      .updateTenant(Number(id), "propertyType", record.propertyType)
      .then(() => {
        console.log("Property type updated successfully");
      })
      .catch((error) => {
        console.error("Error updating property type:", error);
      });

    // Update tenant names
    const validTenantNames = record.tenantName.filter(
      (tenantId) => tenantId !== null && tenantId !== undefined
    ); // Ensure only valid IDs
    console.log(
      "Valid Tenant Names:",
      validTenantNames.map((tn) => tn.id)
    );

    console.log(
      "Tenant ID:=====",
      id,
      "Name:",
      validTenantNames.map((tn) => tn.id)
    );
    window.electron
      .updateTenantNames(
        Number(id),
        validTenantNames.map((tn) => Number(tn.id))
      )
      .then(() => {
        console.log("Property type updated successfully");
      })
      .catch((error) => {
        console.error("Error updating property type:", error);
      });
    // Promise.all()
    //   .then(() => {
    //     console.log("Tenant names updated successfully");
    //   })
    //   .catch((error) => {
    //     console.error("Error updating tenant names:", error);
    //   });

    // Show success message
    alert("تم حفظ التعديلات بنجاح");
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <div className="tenants-details-container">
      <h2>تفاصيل المستأجر: {id}</h2>
      <div className="tenants-form-group">
        <label>اسم المستأجر</label>
        <Select
          mode="multiple"
          allowClear
          value={record.tenantName.map((tn) => {
            console.log("====================================");
            console.log(tn);
            console.log("====================================");
            return tn.id;
          })} // Use IDs for the dropdown value
          onChange={(values) => {
            console.log("Selected Tenant IDs:", values);
            // Update tenantName with selected IDs and their corresponding names
            const updatedTenantNames = values
              .map((id) => {
                console.log("====================================");
                console.log("Selected Tenant ID:", id);
                console.log("====================================");
                const tenant = customersAccounts.find(
                  (account) => account.id === id
                );
                return tenant ? { id: tenant.id, name: tenant.name } : null;
              })
              .filter((tenant) => tenant !== null); // Filter out invalid entries
            setRecord({ ...record, tenantName: updatedTenantNames });
          }}
          style={{ width: "100%" }}>
          {customersAccounts.map((account) => {
            console.log("====================================");
            console.log("Account:", account);
            console.log("====================================");
            return (
              <Option key={account.id} value={account.id}>
                {account.name}
              </Option>
            );
          })}
        </Select>
      </div>
      <div className="tenants-form-group">
        <label>رقم العقد</label>
        <Input
          value={record.contractNumber}
          onChange={(e) =>
            setRecord({ ...record, contractNumber: e.target.value })
          }
        />
      </div>
      <div className="tenants-form-group">
        <label>تاريخ بدء العقد</label>
        <input
          type="date"
          value={record.startDate}
          onChange={(e) => setRecord({ ...record, startDate: e.target.value })}
        />
      </div>
      <div className="tenants-form-group">
        <label>تاريخ نهاية العقد</label>
        <input
          type="date"
          value={record.endDate}
          onChange={(e) => setRecord({ ...record, endDate: e.target.value })}
        />
      </div>
      <div className="tenants-form-group">
        <label>الاستحقاق</label>
        <Input
          value={record.entitlement}
          onChange={(e) =>
            setRecord({ ...record, entitlement: e.target.value })
          }
        />
      </div>
      <div className="tenants-form-group">
        <label>استخدام المأجور</label>
        <Input
          value={record.leasedUsage}
          onChange={(e) =>
            setRecord({ ...record, leasedUsage: e.target.value })
          }
        />
      </div>
      <div className="tenants-form-group">
        <label>نوع العقار</label>
        <Input
          value={record.propertyType}
          onChange={(e) =>
            setRecord({ ...record, propertyType: e.target.value })
          }
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <label>مرفقات</label>
        <div style={{ margin: "8px 0" }}>
          <FileUploader
            subfolder={`tenants/${id}`}
            accept="image/*,application/pdf"
            onSaved={async (p) => {
              try {
                await window.electron.addAttachment(Number(id), p);
                fetchAttachments();
              } catch (err) {
                console.error("Failed to add attachment", err);
              }
            }}
          />
        </div>

        <List
          loading={attachmentsLoading}
          dataSource={attachments}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  type="link"
                  onClick={async () => {
                    try {
                      await window.electron.openFile(item.path);
                    } catch (err) {
                      console.error("Failed to open file", err);
                    }
                  }}>
                  فتح
                </Button>,
                <Button
                  type="link"
                  danger
                  onClick={async () => {
                    try {
                      const res = await window.electron.deleteAttachment(
                        item.id
                      );
                      if (res.deleted) fetchAttachments();
                    } catch (err) {
                      console.error("Failed to delete attachment", err);
                    }
                  }}>
                  حذف
                </Button>,
              ]}>
              <code style={{ fontSize: 12 }}>{item.path}</code>
            </List.Item>
          )}
        />

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <Button className="tenants-save-button" onClick={handleSave}>
            حفظ التعديلات
          </Button>
          <Button
            className="tenants-cancel-button"
            onClick={() => navigate(-1)}>
            إلغاء
          </Button>
        </div>
      </div>
    </div>
  );
}
