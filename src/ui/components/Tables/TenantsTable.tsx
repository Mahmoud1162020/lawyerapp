"use client";

import { useEffect, useState } from "react";
import "./TenantsTable.css";
import { IoIosRefresh } from "react-icons/io";
import ConfirmModal from "../Modal/ConfirmModal";
import { useNavigate } from "react-router-dom";

export default function TenantsTable() {
  const navigate = useNavigate();

  // Form fields for adding a new tenant record (labels in Arabic)
  const [tenantNumber, setTenantNumber] = useState(""); // رقم المستأجر
  const [tenantName, setTenantName] = useState(""); // اسم المستأجر
  const [phone, setPhone] = useState(""); // رقم الهاتف
  const [address, setAddress] = useState(""); // العنوان
  const [notes, setNotes] = useState(""); // الملاحظات

  // Table data and search/filter states
  const [tableData, setTableData] = useState<
    {
      id: number;
      tenantNumber: string;
      tenantName: string;
      phone: string;
      address: string;
      notes: string;
    }[]
  >([]);
  const [filteredData, setFilteredData] = useState(tableData);
  const [searchFilters, setSearchFilters] = useState({
    tenantNumber: "",
    tenantName: "",
    phone: "",
    address: "",
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Modal states for delete confirmation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<number | null>(null);

  // Fetch tenant records on mount
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        // Replace with your actual Electron API call
        const tenants = await window.electron.getAllTenants();
        console.log("Fetched tenants:", tenants);
        setTableData(tenants);
        setFilteredData(tenants);
      } catch (error) {
        console.error("Error fetching tenants:", error);
      }
    };

    fetchTenants();
  }, []);

  // Filter table data based on search filters
  useEffect(() => {
    const filtered = tableData.filter((row) => {
      return (
        (row.tenantNumber?.toLowerCase() || "").includes(
          searchFilters.tenantNumber.toLowerCase()
        ) &&
        (row.tenantName?.toLowerCase() || "").includes(
          searchFilters.tenantName.toLowerCase()
        ) &&
        (row.phone?.toLowerCase() || "").includes(
          searchFilters.phone.toLowerCase()
        ) &&
        (row.address?.toLowerCase() || "").includes(
          searchFilters.address.toLowerCase()
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
        !target.closest(".tenants-search-trigger") &&
        !target.closest("input")
      ) {
        setFocusedField(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  // Save a new tenant record
  const handleSave = async () => {
    if (
      tenantNumber.trim() === "" ||
      tenantName.trim() === "" ||
      phone.trim() === "" ||
      address.trim() === ""
    ) {
      alert("الرجاء ملء جميع الحقول");
      return;
    }
    try {
      const response = await window.electron.addTenant(
        tenantNumber, // رقم المستأجر
        tenantName, // اسم المستأجر
        phone, // رقم الهاتف
        address, // العنوان
        notes // الملاحظات
      );
      console.log("Tenant added:", response);
      const updatedTenants = await window.electron.getAllTenants();
      setTableData(updatedTenants);
      setFilteredData(updatedTenants);

      // Clear form fields
      setTenantNumber("");
      setTenantName("");
      setPhone("");
      setAddress("");
      setNotes("");
    } catch (error) {
      console.error("Error adding tenant:", error);
    }
  };

  const handleDelete = (id: number) => {
    setTenantToDelete(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (tenantToDelete !== null) {
      try {
        await window.electron.deleteTenant(tenantToDelete);
        console.log(`Deleted tenant with id: ${tenantToDelete}`);
        const updatedTenants = await window.electron.getAllTenants();
        setTableData(updatedTenants);
        setFilteredData(updatedTenants);
      } catch (error) {
        console.error("Error deleting tenant:", error);
      } finally {
        setTenantToDelete(null);
        setIsModalOpen(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setTenantToDelete(null);
    setIsModalOpen(false);
  };

  return (
    <div className="tenants-container" dir="rtl">
      <div className="tenants-form-container">
        <div className="tenants-form-row">
          <div className="tenants-form-group">
            <label>ادخل رقم المعاملة</label>
            <input
              type="text"
              value={tenantNumber}
              onChange={(e) => setTenantNumber(e.target.value)}
              placeholder="مثال: 500"
            />
          </div>
          <div className="tenants-form-group">
            <label>ادخل صاحب المعاملة</label>
            <input
              type="text"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder="مثال: رحيم مصطفى"
            />
          </div>
          <div className="tenants-form-group">
            <label>ادخل رقم الهاتف</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="مثال: 07701234567"
            />
          </div>
          <div className="tenants-form-group">
            <label>ادخل العنوان</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="الملاحظات"
            />
          </div>
          <div className="tenants-form-group">
            <label>ادخل الملاحظات</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>
        <div className="tenants-form-buttons">
          <button className="tenants-save-button" onClick={handleSave}>
            حفظ
          </button>
          <button
            className="tenants-save-button"
            onClick={() =>
              setSearchFilters({
                tenantNumber: "",
                tenantName: "",
                phone: "",
                address: "",
              })
            }>
            <IoIosRefresh />
          </button>
        </div>
      </div>

      <div className="tenants-table-container">
        <table className="tenants-data-table">
          <thead>
            <tr>
              <th>رقم</th>
              <th>
                {focusedField === "tenantNumber" && (
                  <input
                    type="text"
                    placeholder="بحث"
                    value={searchFilters.tenantNumber}
                    onBlur={handleSearchBlur}
                    onChange={(e) =>
                      handleSearchChange("tenantNumber", e.target.value)
                    }
                  />
                )}
                <div
                  className="tenants-search-trigger"
                  onClick={() => handleSearchFocus("tenantNumber")}>
                  رقم المعاملة
                </div>
              </th>
              <th>
                {focusedField === "tenantName" && (
                  <input
                    type="text"
                    placeholder="بحث"
                    value={searchFilters.tenantName}
                    onBlur={handleSearchBlur}
                    onChange={(e) =>
                      handleSearchChange("tenantName", e.target.value)
                    }
                  />
                )}
                <div
                  className="tenants-search-trigger"
                  onClick={() => handleSearchFocus("tenantName")}>
                  صاحب المعاملة
                </div>
              </th>
              <th>
                {focusedField === "phone" && (
                  <input
                    type="text"
                    placeholder="بحث"
                    value={searchFilters.phone}
                    onBlur={handleSearchBlur}
                    onChange={(e) =>
                      handleSearchChange("phone", e.target.value)
                    }
                  />
                )}
                <div
                  className="tenants-search-trigger"
                  onClick={() => handleSearchFocus("phone")}>
                  رقم الهاتف
                </div>
              </th>
              <th>
                {focusedField === "address" && (
                  <input
                    type="text"
                    placeholder="بحث"
                    value={searchFilters.address}
                    onBlur={handleSearchBlur}
                    onChange={(e) =>
                      handleSearchChange("address", e.target.value)
                    }
                  />
                )}
                <div
                  className="tenants-search-trigger"
                  onClick={() => handleSearchFocus("address")}>
                  العنوان
                </div>
              </th>
              <th>الملاحظات</th>
              <th>خيارات</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.tenantNumber}</td>
                <td>{row.tenantName}</td>
                <td>{row.phone}</td>
                <td>{row.address}</td>
                <td>{row.notes}</td>
                <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(row.id)}>
                    حذف
                  </button>
                  <button
                    className="details-button"
                    onClick={() => navigate(`/tenant/${row.id}`)}>
                    تفاصيل
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        show={isModalOpen}
        message="هل أنت متأكد أنك تريد الحذف؟"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
