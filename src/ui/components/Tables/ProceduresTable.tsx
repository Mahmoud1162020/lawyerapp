"use client";

import { useEffect, useState } from "react";
import "./ProceduresTable.css"; // Use the updated CSS file below
import { IoIosRefresh } from "react-icons/io";
import ConfirmModal from "../Modal/ConfirmModal";
import { useNavigate } from "react-router-dom";

export default function ProceduresTable() {
  const navigate = useNavigate();

  // Form fields for adding a new procedure record (labels in Arabic)
  const [procedureNumber, setProcedureNumber] = useState(""); // رقم الإجراء
  const [procedureName, setProcedureName] = useState(""); // اسم الإجراء
  const [description, setDescription] = useState(""); // وصف الإجراء
  const [date, setDate] = useState(""); // تاريخ الإجراء
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
    }[]
  >([]);
  const [filteredData, setFilteredData] = useState(tableData);
  const [searchFilters, setSearchFilters] = useState({
    procedureNumber: "",
    procedureName: "",
    description: "",
    status: "",
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Modal states for delete confirmation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [procedureToDelete, setProcedureToDelete] = useState<number | null>(
    null
  );

  // Fetch procedure records on mount
  useEffect(() => {
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
      status.trim() === ""
    ) {
      alert("الرجاء ملء جميع الحقول");
      return;
    }
    try {
      const response = await window.electron.addProcedure(
        procedureNumber, // رقم الإجراء
        procedureName, // اسم الإجراء
        description, // وصف الإجراء
        date, // تاريخ الإجراء
        status // الحالة
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
            <input
              type="text"
              value={procedureName}
              onChange={(e) => setProcedureName(e.target.value)}
              placeholder="مثال: 07701234567"
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
              placeholder="0"
            />
          </div>
          <div className="procedures-form-group">
            <label>الحالة</label>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="مثال: جديد/لا/نعم/مكتمل"
            />
          </div>
          <div className="procedures-form-group">
            <label>التاريخ</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>
        {/* New container for buttons under the inputs */}
        <div className="procedures-form-buttons">
          <button className="procedures-save-button" onClick={handleSave}>
            حفظ
          </button>
          <button
            className="procedures-save-button"
            onClick={() =>
              setSearchFilters({
                procedureNumber: "",
                procedureName: "",
                description: "",
                status: "",
              })
            }>
            <IoIosRefresh />
          </button>
        </div>
      </div>

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
                  رقم الإجراء
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
                  اسم الإجراء
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
                  وصف الإجراء
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
                    onClick={() => navigate(`/procedure/${row.id}`)}>
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
