"use client";

import { useEffect, useState } from "react";
import "./TenantsContractTable.css";
import { IoIosRefresh } from "react-icons/io";
import ConfirmModal from "../Modal/ConfirmModal";
import { useNavigate } from "react-router-dom";
import { Select } from "antd";

const { Option } = Select;
export default function TenantsContractTable() {
  const navigate = useNavigate();

  // Form fields for adding a new tenant contract record (labels in Arabic)
  const [contractStatus, setContractStatus] = useState("جديد"); // الحالة
  const [startDate, setStartDate] = useState(""); // ادخل تاريخ بدء العقد
  const [tenantName, setTenantName] = useState<number[]>([]); // ادخل اسم المستأجر
  const [propertyNumber, setPropertyNumber] = useState(""); // ادخل رقم العقار
  const [endDate, setEndDate] = useState(""); // ادخل تاريخ نهاية العقد
  const [entitlement, setEntitlement] = useState(""); // ادخل الاستحقاق (مثال: الزراعي)
  const [contractNumber, setContractNumber] = useState(""); // ادخل رقم العقد
  const [installmentCount, setInstallmentCount] = useState(""); // عدد الدفعات
  const [leasedUsage, setLeasedUsage] = useState(""); // ادخل استخدام المأجور (مثال: الزراعي)
  const [propertyType, setPropertyType] = useState(""); // ادخل نوع العقار (مثال: عدد الدفعات)
  const [realStateData, setRealStateData] = useState<
    {
      id: number;
      propertyTitle: string;
      propertyNumber: string;
      address: string;
      price: number;
      date: string;
      details: string | null;
      owners: { id: number; name: string }[];
    }[]
  >([]);
  const [selectedRealState, setSelectedRealState] = useState<
    { id: number; name: string }[]
  >([]);
  // Table data and search/filter states
  const [tableData, setTableData] = useState<
    {
      id: number;
      endDate: string;
      startDate: string;
      entitlement: string;
      leasedUsage: string;
      propertyType: string;
      contractNumber: string;
      tenantName: string[];
      propertyNumber: string;
    }[]
  >([]);
  const [filteredData, setFilteredData] = useState(tableData);
  const [searchFilters, setSearchFilters] = useState({
    contractNumber: "",
    tenantName: [],
    propertyNumber: "",
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Modal state for delete confirmation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<number | null>(null);

  // Fetch tenant contract records on mount

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
  console.log("property number", propertyNumber);

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
      setRealStateData(realStates);
    } catch (error) {
      console.log("Error fetching data from the database:", error);
    }
  };
  useEffect(() => {
    getAllCustomersAccounts();
    getAllRealStates();
    const fetchContracts = async () => {
      try {
        const contracts = await window.electron.getAllTenants();
        console.log("Fetched tenant contracts:", contracts);
        setTableData(
          contracts.map((contract) => ({
            ...contract,
            entitlement: String(contract.entitlement), // Convert to string
            propertyNumber: String(contract?.propertyDetails?.propertyNumber), // Convert to string
            tenantName: contract.tenantNames, // Map tenantNames to tenantName
          }))
        );
        setFilteredData(
          contracts.map((contract) => ({
            id: contract.id,
            endDate: contract.endDate,
            startDate: contract.startDate,
            entitlement: String(contract.entitlement), // Convert to string
            leasedUsage: contract.leasedUsage,
            propertyType: contract.propertyType,
            contractNumber: contract.contractNumber,
            tenantName: contract.tenantNames, // Map tenantNames to tenantName
            propertyNumber: String(contract?.propertyDetails?.propertyNumber), // Convert to string
          }))
        );
      } catch (error) {
        console.error("Error fetching tenant contracts:", error);
      }
    };

    fetchContracts();
  }, []);

  // Filter table data based on search filters
  useEffect(() => {
    const filtered = tableData.filter((row) => {
      return (
        row.contractNumber
          .toLowerCase()
          .includes(searchFilters.contractNumber.toLowerCase()) &&
        searchFilters.tenantName.every((filterName) =>
          row.tenantName.some((name) => name.toLowerCase().includes(filterName))
        ) &&
        row.propertyNumber
          .toLowerCase()
          .includes(searchFilters.propertyNumber.toLowerCase())
      );
    });
    setFilteredData(filtered);
  }, [searchFilters, tableData]);

  // Blur search fields on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".contracts-search-trigger") &&
        !target.closest("input")
      ) {
        setFocusedField(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (field: string, value: string) => {
    setSearchFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearchFocus = (field: string) => {
    setFocusedField(field);
  };

  const handleSearchBlur = () => {
    setFocusedField(null);
  };
  console.log("tenantName", tenantName);

  // Save a new tenant contract record
  const handleSave = async () => {
    if (
      !startDate ||
      tenantName.length === 0 ||
      !propertyNumber ||
      !endDate ||
      !entitlement ||
      !contractNumber
    ) {
      alert("الرجاء ملء جميع الحقول");
      return;
    }
    try {
      const response = await window.electron.addTenant(
        contractStatus,
        startDate,
        tenantName,
        Number(propertyNumber),
        endDate,
        Number(entitlement),
        contractNumber,
        Number(installmentCount),
        leasedUsage,
        propertyType
      );
      console.log("Tenant contract added:", response);
      const updatedContracts = await window.electron.getAllTenants();
      console.log("Updated tenant contracts:", updatedContracts);

      setTableData(
        updatedContracts.map((contract) => ({
          ...contract,
          entitlement: String(contract.entitlement), // Convert to string
          propertyNumber: String(contract?.propertyDetails?.propertyNumber), // Convert to string
          tenantName: contract.tenantNames, // Map tenantNames to tenantName
        }))
      );
      setFilteredData(
        updatedContracts.map((contract) => ({
          id: contract.id,
          endDate: contract.endDate,
          startDate: contract.startDate,
          entitlement: String(contract.entitlement), // Convert to string
          leasedUsage: contract.leasedUsage,
          propertyType: contract.propertyType,
          contractNumber: contract.contractNumber,
          tenantName: contract.tenantNames.map((name: string) => name), // Ensure tenantNames is an array
          propertyNumber: String(contract?.propertyDetails?.propertyNumber), // Convert to string
        }))
      );

      // Clear form fields
      setContractStatus("جديد");
      setStartDate("");
      setTenantName([]);
      setPropertyNumber("");
      setEndDate("");
      setEntitlement("");
      setContractNumber("");
      setInstallmentCount("");
      setLeasedUsage("");
      setPropertyType("");
    } catch (error) {
      console.error("Error adding tenant contract:", error);
    }
  };

  const handleDelete = (id: number) => {
    setContractToDelete(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (contractToDelete !== null) {
      try {
        await window.electron.deleteTenant(contractToDelete);
        console.log(`Deleted tenant contract with id: ${contractToDelete}`);
        const updatedContracts = await window.electron.getAllTenants();
        setTableData(
          updatedContracts.map((contract) => ({
            ...contract,
            entitlement: String(contract.entitlement), // Convert to string
            propertyNumber: String(contract.propertyNumber), // Convert to string
            tenantName: contract.tenantNames, // Map tenantNames to tenantName
          }))
        );

        setFilteredData(
          updatedContracts.map((contract) => ({
            id: contract.id,
            endDate: contract.endDate,
            startDate: contract.startDate,
            entitlement: String(contract.entitlement), // Convert to string
            leasedUsage: contract.leasedUsage,
            propertyType: contract.propertyType,
            contractNumber: contract.contractNumber,
            tenantName: contract.tenantNames, // Map tenantNames to tenantName
            propertyNumber: String(contract.propertyNumber), // Convert to string
          }))
        );
      } catch (error) {
        console.error("Error deleting tenant contract:", error);
      } finally {
        setContractToDelete(null);
        setIsModalOpen(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setContractToDelete(null);
    setIsModalOpen(false);
  };

  return (
    <div className="contracts-container" dir="rtl">
      <div className="contracts-form-container">
        <div className="contracts-form-row">
          <div className="contracts-form-group">
            <label>الحالة</label>
            <input
              type="text"
              value={contractStatus}
              onChange={(e) => setContractStatus(e.target.value)}
              placeholder="جديد"
            />
          </div>
          <div className="contracts-form-group">
            <label>ادخل تاريخ بدء العقد</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="contracts-form-group">
            <label>ادخل اسم المستأجر</label>
            <Select
              mode="multiple"
              allowClear
              showSearch // Enables search functionality
              placeholder="اختر اصحاب العقار"
              value={tenantName}
              onChange={(values) => setTenantName(values)}
              filterOption={(input, option) =>
                String(option?.children)
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
            {/* <input
              type="text"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder="500"
            /> */}
          </div>
          <div className="contracts-form-group">
            <label>ادخل رقم العقار </label>
            <Select
              allowClear
              showSearch // Enables search functionality
              placeholder="اختر رقم العقار"
              value={
                realStateData
                  .filter((rs) => rs.id === Number(propertyNumber))
                  ?.find((rs) => rs.id === Number(propertyNumber))
                  ?.propertyTitle
              }
              onChange={(values) => {
                setPropertyNumber(values?.toString());
              }}
              filterOption={(input, option) =>
                typeof option?.children === "string"
                  ? option.children
                  : "".toLowerCase().includes(input.toLowerCase())
              } // Custom search logic
            >
              {realStateData.map((realstate) => (
                <Option key={realstate.id} value={realstate.id}>
                  {realstate.propertyTitle}
                </Option>
              ))}
            </Select>
            {/* <input
              type="text"
              value={propertyNumber}
              onChange={(e) => setPropertyNumber(e.target.value)}
              placeholder="07701234567"
            /> */}
          </div>
          <div className="contracts-form-group">
            <label>ادخل تاريخ نهاية العقد</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="contracts-form-group">
            <label>ادخل الاستحقاق</label>
            <input
              type="text"
              value={entitlement}
              onChange={(e) => setEntitlement(e.target.value)}
              placeholder="الزراعي"
            />
          </div>
          <div className="contracts-form-group">
            <label>ادخل رقم العقد</label>
            <input
              type="text"
              value={contractNumber}
              onChange={(e) => setContractNumber(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="contracts-form-group">
            <label>عدد الدفعات</label>
            <input
              type="number"
              value={installmentCount}
              onChange={(e) => setInstallmentCount(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="contracts-form-group">
            <label>ادخل استخدام المأجور</label>
            <input
              type="text"
              value={leasedUsage}
              onChange={(e) => setLeasedUsage(e.target.value)}
              placeholder="الزراعي"
            />
          </div>
          <div className="contracts-form-group">
            <label>ادخل نوع العقار</label>
            <input
              type="text"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              placeholder="عدد الدفعات"
            />
          </div>
        </div>
        <div className="contracts-form-buttons">
          <button className="contracts-save-button" onClick={handleSave}>
            حفظ
          </button>
          <button
            className="contracts-save-button"
            onClick={() =>
              setSearchFilters({
                contractNumber: "",
                tenantName: [],
                propertyNumber: "",
              })
            }>
            <IoIosRefresh />
          </button>
        </div>
      </div>

      <div className="contracts-table-container">
        <table className="contracts-data-table">
          <thead>
            <tr>
              <th>
                {focusedField === "propertyNumber" && (
                  <input
                    type="text"
                    placeholder="بحث"
                    value={searchFilters.propertyNumber}
                    onBlur={handleSearchBlur}
                    onChange={(e) =>
                      handleSearchChange("propertyNumber", e.target.value)
                    }
                  />
                )}
                <div
                  className="contracts-search-trigger"
                  onClick={() => handleSearchFocus("propertyNumber")}>
                  رقم العقار
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
                      handleSearchChange(
                        "tenantName",
                        e.target.value.split(",").map((name) => name.trim())
                      )
                    }
                  />
                )}
                <div
                  className="contracts-search-trigger"
                  onClick={() => handleSearchFocus("tenantName")}>
                  اسم المستأجر
                </div>
              </th>
              <th>
                {focusedField === "contractNumber" && (
                  <input
                    type="text"
                    placeholder="بحث"
                    value={searchFilters.contractNumber}
                    onBlur={handleSearchBlur}
                    onChange={(e) =>
                      handleSearchChange("contractNumber", e.target.value)
                    }
                  />
                )}
                <div
                  className="contracts-search-trigger"
                  onClick={() => handleSearchFocus("contractNumber")}>
                  رقم العقد
                </div>
              </th>
              <th>نوع العقار</th>
              <th>استخدام المأجور</th>
              <th>الاستحقاق</th>
              <th>تاريخ بدء العقد</th>
              <th>تاريخ نهاية العقد</th>
              <th>خيارات</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row.id}>
                <td>{row.propertyNumber}</td>
                <td>{row.tenantName?.join(", ")}</td>
                {/* Join tenant names with a comma */}
                <td>{row.contractNumber}</td>
                <td>{row.propertyType}</td>
                <td>{row.leasedUsage}</td>
                <td>{row.entitlement}</td>
                <td>{row.startDate}</td>
                <td>{row.endDate}</td>
                <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(row.id)}>
                    حذف
                  </button>
                  <button
                    className="details-button"
                    onClick={() => navigate(`/tenantContract/${row.id}`)}>
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
