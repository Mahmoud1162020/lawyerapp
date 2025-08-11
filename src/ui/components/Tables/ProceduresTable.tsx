"use client";

import { useEffect, useState } from "react";
import "./ProceduresTable.css"; // Use the updated CSS file below
import { IoIosRefresh } from "react-icons/io";
import ConfirmModal from "../Modal/ConfirmModal";
import { useNavigate } from "react-router-dom";
import { Collapse, Select } from "antd";
const { Panel } = Collapse;
const { Option } = Select;
export default function ProceduresTable() {
  const navigate = useNavigate();
  const [selectedOwners, setSelectedOwners] = useState<number[]>([]); // Multi-select for owners
  const [activeCollapse, setActiveCollapse] = useState<string[]>(["0"]);
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
  // Form fields for adding a new procedure record (labels in Arabic)
  const [procedureNumber, setProcedureNumber] = useState(""); // رقم المعاملة
  const [procedureName, setProcedureName] = useState(""); // اسم المعاملة
  const [description, setDescription] = useState(""); // وصف المعاملة
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // تاريخ المعاملة
  const [status, setStatus] = useState(""); // الحالة
  const [phone, setPhone] = useState(""); // رقم الهاتف

  // Table data and search/filter states
  const [tableData, setTableData] = useState<
    {
      id: number;
      procedureNumber: string;
      procedureName: string;
      description: string;
      date: string;
      status: string;
      phone: string;
    }[]
  >([]);
  const [filteredData, setFilteredData] = useState(tableData);
  const [searchFilters, setSearchFilters] = useState({
    procedureNumber: "",
    procedureName: "",
    description: "",
    status: "",
    phone: "",
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Modal states for delete confirmation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [procedureToDelete, setProcedureToDelete] = useState<number | null>(
    null
  );

  // Fetch procedure records on mount
  const getAllCustomersAccounts = async () => {
    try {
      const customersAccounts = await window.electron.getAllCustomersAccounts();
      console.log("Fetched Customers Accounts:", customersAccounts);
      setCustomersAccounts(customersAccounts);
    } catch (error) {
      console.log("Error fetching data from the database:", error);
    }
  };

  useEffect(() => {
    getAllCustomersAccounts();
    const fetchProcedures = async () => {
      try {
        const procedures = await window.electron.getAllProcedures();
        console.log("Fetched procedures:", procedures);
        setTableData(procedures);
        setFilteredData(procedures);
      } catch (error) {
        console.error("Error fetching procedures:", error);
      }
    };

    fetchProcedures();
  }, []);

  // Filter table data based on search filters
  useEffect(() => {
    const filtered = tableData.filter((row) => {
      return (
        (row.procedureNumber?.toLowerCase() || "").includes(
          searchFilters.procedureNumber.toLowerCase()
        ) &&
        (row.procedureName?.toLowerCase() || "").includes(
          searchFilters.procedureName.toLowerCase()
        ) &&
        (row.description?.toLowerCase() || "").includes(
          searchFilters.description.toLowerCase()
        ) &&
        (row.status?.toLowerCase() || "").includes(
          searchFilters.status.toLowerCase()
        )
      );
    });
    setFilteredData(filtered);
  }, [searchFilters, tableData]);

  // Blur search fields on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".procedures-search-trigger") &&
        !target.closest("input")
      ) {
        setFocusedField(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  // Save a new procedure record
  const handleSave = async () => {
    if (
      procedureNumber.trim() === "" ||
      procedureName.trim() === "" ||
      description.trim() === "" ||
      date.trim() === "" ||
      status.trim() === "" ||
      phone.trim() === ""
    ) {
      alert("الرجاء ملء جميع الحقول");
      return;
    }
    try {
      const response = await window.electron.addProcedure(
        procedureNumber, // رقم المعاملة
        procedureName, // اسم المعاملة
        description, // وصف المعاملة
        date, // تاريخ المعاملة
        status, // الحالة
        phone, // رقم الهاتف
        selectedOwners // المالكين (owners) - Provide an empty array or appropriate data
      );
      console.log("Procedure added:", response);
      const updatedProcedures = await window.electron.getAllProcedures();
      setTableData(updatedProcedures);
      setFilteredData(updatedProcedures);

      // Clear form fields
      setProcedureNumber("");
      setProcedureName("");
      setDescription("");
      setDate("");
      setStatus("");
      setSelectedOwners([]);
    } catch (error) {
      console.error("Error adding procedure:", error);
    }
  };

  const handleDelete = (id: number) => {
    setProcedureToDelete(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (procedureToDelete !== null) {
      try {
        await window.electron.deleteProcedure(procedureToDelete);
        console.log(`Deleted procedure with id: ${procedureToDelete}`);
        const updatedProcedures = await window.electron.getAllProcedures();
        setTableData(updatedProcedures);
        setFilteredData(updatedProcedures);
      } catch (error) {
        console.error("Error deleting procedure:", error);
      } finally {
        setProcedureToDelete(null);
        setIsModalOpen(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setProcedureToDelete(null);
    setIsModalOpen(false);
  };

  return (
    <div className="procedures-container" dir="rtl">
      <Collapse
        onChange={(key) => {
          setActiveCollapse(key);
        }}
        defaultActiveKey={["0"]}
        style={{ display: "flex", justifyContent: "space-between" }}>
        <Panel key="1" header="إدخال معلومات المعاملة" showArrow={false}>
          <div className="procedures-form-container">
            <div className="procedures-form-row">
              <div className="procedures-form-group">
                <label>ادخل رقم المعاملة</label>
                <input
                  type="text"
                  value={procedureNumber}
                  onChange={(e) => setProcedureNumber(e.target.value)}
                  placeholder="مثال: 500"
                />
              </div>
              <div className="procedures-form-group">
                <label>ادخل صاحب المعاملة</label>
                <Select
                  mode="multiple"
                  allowClear
                  showSearch // Enables search functionality
                  placeholder="اختر اصحاب المعاملة"
                  value={selectedOwners}
                  onChange={(values) => setSelectedOwners(values)}
                  filterOption={(input, option) =>
                    (typeof option?.children === "string"
                      ? String(option.children).toLowerCase()
                      : ""
                    ).includes(input.toLowerCase())
                  } // Custom search logic
                >
                  {customersAccounts.map((owner) => (
                    <Option key={owner.id} value={owner.id}>
                      {owner.name}
                    </Option>
                  ))}
                </Select>
              </div>
              <div className="procedures-form-group">
                <label>ادخل اسم المعاملة</label>
                <input
                  type="text"
                  value={procedureName}
                  onChange={(e) => setProcedureName(e.target.value)}
                  placeholder="مثال: صورة قيد"
                />
              </div>
              <div className="procedures-form-group">
                <label>ادخل رقم الهاتف</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثال: 07701213457"
                />
              </div>
              <div className="procedures-form-group">
                <label>ادخل الملاحظات</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder=""
                />
              </div>
              <div className="procedures-form-group">
                <label>الحالة</label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  placeholder="مثال: جديد/مكتمل"
                />
              </div>
              {/* <div className="procedures-form-group">
                <label>التاريخ</label>
                <input
                  style={{ maxWidth: "200px" }}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div> */}
            </div>
            {/* New container for buttons under the inputs */}
            <div className="procedures-form-buttons">
              <button className="procedures-save-button" onClick={handleSave}>
                حفظ
              </button>
            </div>
          </div>
        </Panel>
        {activeCollapse[1] !== "1" && (
          <button
            className="real-states-refresh-button"
            onClick={() =>
              setSearchFilters({
                procedureNumber: "",
                procedureName: "",
                description: "",
                status: "",
                phone: "",
              })
            }>
            <IoIosRefresh />
          </button>
        )}
      </Collapse>

      <div className="procedures-table-container">
        <table className="procedures-data-table">
          <thead>
            <tr>
              <th>رقم</th>
              <th>
                {focusedField === "procedureNumber" && (
                  <input
                    type="text"
                    placeholder="بحث"
                    value={searchFilters.procedureNumber}
                    onBlur={handleSearchBlur}
                    onChange={(e) =>
                      handleSearchChange("procedureNumber", e.target.value)
                    }
                  />
                )}
                <div
                  className="procedures-search-trigger"
                  onClick={() => handleSearchFocus("procedureNumber")}>
                  رقم المعاملة
                </div>
              </th>
              <th>
                {focusedField === "procedureName" && (
                  <input
                    type="text"
                    placeholder="بحث"
                    value={searchFilters.procedureName}
                    onBlur={handleSearchBlur}
                    onChange={(e) =>
                      handleSearchChange("procedureName", e.target.value)
                    }
                  />
                )}
                <div
                  className="procedures-search-trigger"
                  onClick={() => handleSearchFocus("procedureName")}>
                  اسم المعاملة
                </div>
              </th>
              <th>
                {focusedField === "description" && (
                  <input
                    type="text"
                    placeholder="بحث"
                    value={searchFilters.description}
                    onBlur={handleSearchBlur}
                    onChange={(e) =>
                      handleSearchChange("description", e.target.value)
                    }
                  />
                )}
                <div
                  className="procedures-search-trigger"
                  onClick={() => handleSearchFocus("description")}>
                  وصف المعاملة
                </div>
              </th>
              <th>
                {focusedField === "status" && (
                  <input
                    type="text"
                    placeholder="بحث"
                    value={searchFilters.status}
                    onBlur={handleSearchBlur}
                    onChange={(e) =>
                      handleSearchChange("status", e.target.value)
                    }
                  />
                )}
                <div
                  className="procedures-search-trigger"
                  onClick={() => handleSearchFocus("status")}>
                  الحالة
                </div>
              </th>
              <th>التاريخ</th>
              <th>خيارات</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.procedureNumber}</td>
                <td>{row.procedureName}</td>
                <td>{row.description}</td>
                <td>{row.status}</td>
                <td>{row.date}</td>
                <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(row.id)}>
                    حذف
                  </button>
                  <button
                    className="details-button"
                    onClick={() => navigate(`/procedure-details/${row.id}`)}>
                    تفاصيل
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        show={isModalOpen}
        message="هل أنت متأكد أنك تريد الحذف؟"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
