import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Input, Button, Select } from "antd";
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
      if (response) {
        setRecord({
          propertyTitle: response.propertyTitle,
          propertyNumber: response.propertyNumber,
          owners: response.owners.map((owner) => owner.id),
          address: response.address,
          price: response.price,
          date: response.date.slice(0, 10), // Extract YYYY-MM-DD
          details: response.details,
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
      .updateRealStateOwners(Number(id), record.owners) // Convert owner IDs to numbers
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
  console.log("record------", record.owners);

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
