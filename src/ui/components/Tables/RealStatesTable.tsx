import { useEffect, useState } from "react";
import { Select, Input, Button, DatePicker, Table, Collapse } from "antd";
import "./RealStatesTable.css"; // Add your custom styles here
import { useNavigate } from "react-router-dom";
import { IoIosRefresh } from "react-icons/io";
import ConfirmModal from "../Modal/ConfirmModal";
import {
  formatNumberWithCommas,
  sanitizeNumberInput,
} from "../../helper/formatting";

const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

export default function RealStatesTable() {
  const navigate = useNavigate();

  // Form fields for adding a new real state record
  const [propertyTitle, setPropertyTitle] = useState(""); // اسم العقار
  const [propertyNumber, setPropertyNumber] = useState(""); // رقم العقار
  const [selectedOwners, setSelectedOwners] = useState<number[]>([]); // Multi-select for owners
  const [address, setAddress] = useState(""); // عنوان العقار
  const [price, setPrice] = useState(""); // السعر
  const [date, setDate] = useState(""); // التاريخ
  const [details, setDetails] = useState(""); // الملاحظات
  const [customersAccounts, setCustomersAccounts] = useState<
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
  const [activeCollapse, setActiveCollapse] = useState<
    string | string[] | number | number[]
  >(["0"]);

  // Table data
  const [tableData, setTableData] = useState<
    {
      key: number;
      propertyTitle: string;
      propertyNumber: string;
      owners: string;
      address: string;
      price: string;
      date: string;
      details: string;
    }[]
  >([]);
  const getAllCustomersAccounts = async () => {
    try {
      const customersAccounts = await window.electron.getAllCustomersAccounts();
      console.log("Fetched Customers Accounts:", customersAccounts);
      setCustomersAccounts(customersAccounts);
    } catch (error) {
      console.log("Error fetching data from the database:", error);
    }
  };

  const getAllRealStates = async () => {
    try {
      const realStates = await window.electron.getAllRealStates();
      console.log("Fetched Real States:", realStates);
      setTableData(
        realStates.map((realState) => ({
          key: realState.id,
          propertyTitle: realState.propertyTitle,
          propertyNumber: realState.propertyNumber,
          owners: realState.owners.map((owner) => owner.name).join(", "),
          address: realState.address,
          price: realState.price.toString(),
          date: realState.date,
          details: realState.details || "",
        }))
      );
    } catch (error) {
      console.log("Error fetching data from the database:", error);
    }
  };
  //fetching data from the database
  useEffect(() => {
    // get the customers accounts from the database
    getAllCustomersAccounts();
    console.log("this is fetching data from db");
    getAllRealStates();
  }, []);

  // Search filters
  const [searchFilters, setSearchFilters] = useState({
    propertyTitle: "",
    propertyNumber: "",
    owners: "",
    address: "",
    price: "",
    date: "",
  });

  const [focusedField, setFocusedField] = useState<string | null>(null); // Tracks the currently focused column for search

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);

  const handleSearchChange = (field: string, value: string) => {
    setSearchFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  const handleSearchFocus = (field: string) => {
    setFocusedField(field);
  };

  const handleSearchBlur = () => {
    setFocusedField(null);
  };

  const filteredData = tableData.filter((row) => {
    return (
      row.propertyTitle.includes(searchFilters.propertyTitle) &&
      row.propertyNumber.includes(searchFilters.propertyNumber) &&
      row.owners.includes(searchFilters.owners) &&
      row.address.includes(searchFilters.address) &&
      row.date.includes(searchFilters.date)
    );
  });

  const handleSave = async () => {
    if (
      propertyTitle.trim() === "" ||
      propertyNumber.trim() === "" ||
      selectedOwners.length === 0 || // Ensure at least one owner is selected
      address.trim() === "" ||
      price.trim() === "" ||
      date.trim() === ""
    ) {
      alert("الرجاء ملء جميع الحقول");
      return;
    }

    try {
      // Prepare the new record data
      const newRecord = {
        propertyTitle,
        propertyNumber,
        address,
        price: parseFloat(price), // Ensure price is stored as a number
        date,
        details,
        owners: selectedOwners, // Array of owner IDs
        customerId: selectedOwners[0], // Use the first owner as the customer_id
      };
      console.log("New Record Data:", newRecord);

      // Send the new record to the backend via IPC
      const addedRealState = await window.electron.addRealState(
        newRecord.propertyTitle,
        newRecord.propertyNumber,
        newRecord.address,
        newRecord.price, // Convert price to a number for backend
        newRecord.details,
        newRecord.owners // Array of owner IDs
      );

      // Add the new record to the table data
      setTableData([
        ...tableData,
        {
          key: addedRealState.id, // Use the ID returned from the backend
          ...newRecord,
          price: newRecord.price.toString(), // Ensure price is a string
          owners: newRecord.owners.join(", "), // Convert owners array to a comma-separated string for display
        },
      ]);

      // Clear form fields
      setPropertyTitle("");
      setPropertyNumber("");
      setSelectedOwners([]);
      setAddress("");
      setPrice("");
      setDate("");
      setDetails("");

      console.log("New RealState Added:", addedRealState);
    } catch (error) {
      console.error("Failed to save real state:", error);
      alert("حدث خطأ أثناء حفظ العقار. يرجى المحاولة مرة أخرى.");
    }
  };

  const handleDelete = (key: number) => {
    setRecordToDelete(key);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (recordToDelete !== null) {
      const updatedData = tableData.filter((row) => row.key !== recordToDelete);
      console.log("deletion:", recordToDelete);
      window.electron
        .deleteRealState(recordToDelete)
        .then((response) => {
          if (response.deleted) {
            console.log("Record deleted successfully");
          } else {
            console.error("Failed to delete record");
          }
        })
        .catch((error) => {
          console.error("Error deleting record:", error);
        });
      // Update the table data state

      setTableData(updatedData);
    }
    setIsModalOpen(false);
    setRecordToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false);
    setRecordToDelete(null);
  };

  // Table columns with hover or click-based search
  const columns = [
    {
      title: (
        <div>
          {focusedField === "propertyTitle" ? (
            <Input
              placeholder="بحث"
              value={searchFilters.propertyTitle}
              onBlur={handleSearchBlur}
              onChange={(e) =>
                handleSearchChange("propertyTitle", e.target.value)
              }
            />
          ) : (
            <div
              className="search-trigger"
              onClick={() => handleSearchFocus("propertyTitle")}>
              اسم العقار
            </div>
          )}
        </div>
      ),
      dataIndex: "propertyTitle",
      key: "propertyTitle",
    },
    {
      title: (
        <div>
          {focusedField === "propertyNumber" ? (
            <Input
              placeholder="بحث"
              value={searchFilters.propertyNumber}
              onBlur={handleSearchBlur}
              onChange={(e) =>
                handleSearchChange("propertyNumber", e.target.value)
              }
            />
          ) : (
            <div
              className="search-trigger"
              onClick={() => handleSearchFocus("propertyNumber")}>
              رقم العقار
            </div>
          )}
        </div>
      ),
      dataIndex: "propertyNumber",
      key: "propertyNumber",
    },
    {
      title: (
        <div>
          {focusedField === "owners" ? (
            <Input
              placeholder="بحث"
              value={searchFilters.owners}
              onBlur={handleSearchBlur}
              onChange={(e) => handleSearchChange("owners", e.target.value)}
            />
          ) : (
            <div
              className="search-trigger"
              onClick={() => handleSearchFocus("owners")}>
              اصحاب العقار
            </div>
          )}
        </div>
      ),
      dataIndex: "owners",
      key: "owners",
    },
    {
      title: (
        <div>
          {focusedField === "address" ? (
            <Input
              placeholder="بحث"
              value={searchFilters.address}
              onBlur={handleSearchBlur}
              onChange={(e) => handleSearchChange("address", e.target.value)}
            />
          ) : (
            <div
              className="search-trigger"
              onClick={() => handleSearchFocus("address")}>
              عنوان العقار
            </div>
          )}
        </div>
      ),
      dataIndex: "address",
      key: "address",
    },
    {
      title: "السعر",
      dataIndex: "price",
      key: "price",
    },
    {
      title: "التاريخ",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "الملاحظات",
      dataIndex: "details",
      key: "details",
    },
    {
      title: "خيارات",
      key: "actions",
      render: (_: unknown, record: { key: number }) => {
        console.log("Record:", record.key);

        return (
          <div style={{ display: "flex", gap: "10px" }}>
            <Button
              type="primary"
              danger
              onClick={() => handleDelete(record.key)}>
              حذف
            </Button>
            <Button
              type="default"
              onClick={() => navigate(`/real-state-details/${record.key}`)}>
              تفاصيل
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="real-states-data-table-container">
      <Collapse
        onChange={(key) => {
          setActiveCollapse(key);
        }}
        defaultActiveKey={["0"]}
        style={{ display: "flex", justifyContent: "space-between" }}>
        <Panel
          style={{ fontSize: "18px" }}
          header="إدخال معلومات العقار"
          key="1">
          <div className="real-states-form-container">
            <div className="real-states-form-row">
              <div className="real-states-form-group">
                <label>ادخل اسم العقار</label>
                <Input
                  value={propertyTitle}
                  onChange={(e) => setPropertyTitle(e.target.value)}
                  placeholder="اسم العقار"
                />
              </div>
              <div className="real-states-form-group">
                <label>ادخل رقم العقار</label>
                <Input
                  value={propertyNumber}
                  onChange={(e) => setPropertyNumber(e.target.value)}
                  placeholder="رقم العقار"
                />
              </div>
              <div className="real-states-form-group">
                <label>ادخل اصحاب العقار</label>
                <Select
                  mode="multiple"
                  allowClear
                  showSearch // Enables search functionality
                  placeholder="اختر اصحاب العقار"
                  value={selectedOwners}
                  onChange={(values) => setSelectedOwners(values)}
                  filterOption={(input, option) =>
                    (typeof option?.children === "string"
                      ? option.children
                      : option?.children?.toString() || ""
                    )
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  } // Custom search logic
                >
                  {customersAccounts.map((owner) => (
                    <Option key={owner.id} value={owner.id}>
                      {owner.name}
                    </Option>
                  ))}
                </Select>
              </div>
              <div className="real-states-form-group">
                <label>ادخل عنوان العقار</label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="عنوان العقار"
                />
              </div>
              <div className="real-states-form-group">
                <label>السعر</label>
                <Input
                  value={price} // Format for display
                  onChange={(e) => setPrice(e.target.value)} // Store plain number
                  placeholder="السعر"
                />
              </div>
              <div className="real-states-form-group">
                <label>التاريخ</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="real-states-form-group real-states-full-width">
                <label>الملاحظات</label>
                <TextArea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="الملاحظات"
                  rows={2}
                />
              </div>
            </div>
            <Button
              type="primary"
              onClick={handleSave}
              className="real-states-save-button">
              حفظ
            </Button>
          </div>
        </Panel>
        {Array.isArray(activeCollapse) && activeCollapse[1] !== "1" && (
          <button
            className="real-states-refresh-button"
            onClick={() =>
              setSearchFilters({
                propertyTitle: "",
                propertyNumber: "",
                owners: "",
                address: "",
                price: "",
                date: "",
              })
            }>
            <IoIosRefresh />
          </button>
        )}
      </Collapse>

      {/* Table Section */}
      <div className="real-states-table-container">
        <Table
          dataSource={filteredData}
          columns={columns}
          pagination={{ pageSize: 5 }}
          bordered
        />
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        show={isModalOpen}
        message="هل أنت متأكد أنك تريد الحذف؟"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
