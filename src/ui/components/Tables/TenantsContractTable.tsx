"use client";

import { useEffect, useState } from "react";
import "./TenantsContractTable.css";
import { IoIosRefresh } from "react-icons/io";
import ConfirmModal from "../Modal/ConfirmModal";
import { useNavigate } from "react-router-dom";
import FileUploader from "../FileUploader";
import { Select, Modal, List, Button, Tooltip, Collapse } from "antd";
import { FiPaperclip } from "react-icons/fi";
import { toast } from "react-toastify";

const { Option } = Select;
const { Panel } = Collapse;

export default function TenantsContractTable() {
  const navigate = useNavigate();

  // Form fields for adding a new tenant contract record (labels in Arabic)
  const [contractStatus, setContractStatus] = useState("جديد"); // الحالة
  const [startDate, setStartDate] = useState(""); // ادخل تاريخ بدء العقد
  const [tenantName, setTenantName] = useState<number[]>([]); // ادخل اسم المستأجر
  const [propertyNumber, setPropertyNumber] = useState(""); // ادخل رقم العقار
  const [endDate, setEndDate] = useState(""); // ادخل تاريخ نهاية العقد
  const [entitlement, setEntitlement] = useState(0); // ادخل الاستحقاق (مثال: الزراعي)
  const [contractNumber, setContractNumber] = useState(""); // ادخل رقم العقد
  const [installmentCount, setInstallmentCount] = useState(""); // عدد الدفعات
  const [leasedUsage, setLeasedUsage] = useState(""); // ادخل استخدام المأجور (مثال: الزراعي)
  const [propertyType, setPropertyType] = useState(""); // ادخل نوع العقار (مثال: عدد الدفعات)
  const [activeCollapse, setActiveCollapse] = useState<string[]>(["0"]);

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
  // Removed unused selectedRealState state
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
      propertyDetails?: { propertyTitle: string };
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
  const [savedAttachments, setSavedAttachments] = useState<string[]>([]);
  const [attachmentsModalVisible, setAttachmentsModalVisible] = useState(false);
  const [attachmentsForRecord, setAttachmentsForRecord] = useState<
    {
      id: number;
      entity_id?: number | null;
      entity_type?: string;
      path: string;
      created_at?: string;
    }[]
  >([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);

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

  // useEffect(() => {
  //   let isMounted = true;
  //   const handleError = (error: string) => {
  //     console.error("Error from Electron backend:", error);
  //     toast.error("رقم العقد موجود مسبقاً", { autoClose: 3000 });

  //     if (
  //       isMounted &&
  //       error.includes(
  //         "Error: SQLITE_CONSTRAINT: UNIQUE constraint failed: tenants.contractNumber"
  //       )
  //     ) {
  //       toast.error("رقم العقد موجود مسبقاً", { autoClose: 3000 });
  //     }
  //   };

  //   // Attach the error listener
  //   window.electron.onError(handleError);

  //   // Cleanup the listener on component unmount
  //   return () => {
  //     isMounted = false;
  //     window.electron.offError(handleError);
  //   };
  // }, []);
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

  const handleSearchChange = (field: string, value: string | string[]) => {
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
      // persist any uploaded attachments for the newly created tenant
      try {
        const newId = response?.id ?? response; // handle different return shapes
        if (savedAttachments && savedAttachments.length > 0 && newId) {
          for (const p of savedAttachments) {
            try {
              await window.electron.addAttachment("tenant", newId, p);
            } catch (err) {
              console.error("Failed to persist attachment", p, err);
            }
          }
          // refresh attachments modal or table if needed (we refreshed contracts above)
          setSavedAttachments([]);
        }
      } catch (err) {
        console.error("Error while saving attachments:", err);
      }

      // Clear form fields
      setContractStatus("جديد");
      setStartDate("");
      setTenantName([]);
      setPropertyNumber("");
      setEndDate("");
      setEntitlement(0);
      setContractNumber("");
      setInstallmentCount("");
      setLeasedUsage("");
      setPropertyType("");
    } catch (error) {
      toast.error("رقم العقد موجود مسبقاً");
      alert("رقم العقد موجود مسبقاً");

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
      <Collapse
        onChange={(key) => {
          setActiveCollapse(key);
        }}
        defaultActiveKey={["0"]}
        style={{ display: "flex", justifyContent: "space-between" }}>
        <Panel key="1" header="إدخال معلومات المعاملة" showArrow={true}>
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
                <label>ادخل اسم المستأجر</label>
                <Select
                  mode="multiple"
                  allowClear
                  showSearch // Enables search functionality
                  placeholder=""
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
                <label>ادخل تاريخ بدء العقد</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
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
                  type="number"
                  value={entitlement}
                  onChange={(e) => setEntitlement(Number(e.target.value))}
                  placeholder=""
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
                  placeholder=""
                />
              </div>
              <div className="contracts-form-group">
                <label>ادخل نوع العقار</label>
                <input
                  type="text"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  placeholder=""
                />
              </div>
            </div>
            <div className="contracts-form-buttons">
              <div style={{ marginBottom: 12 }}>
                <label>المرفقات (صور أو PDF)</label>
                <div>
                  <FileUploader
                    subfolder={`tenants/${Date.now()}`}
                    accept="image/*,application/pdf"
                    onSaved={(p) => setSavedAttachments((s) => [...s, p])}
                    label="أضف مرفق"
                  />
                </div>
                {savedAttachments.length > 0 && (
                  <div style={{ marginTop: 8, textAlign: "left" }}>
                    <strong>الملفات المرفوعة:</strong>
                    <ul>
                      {savedAttachments.map((p) => (
                        <li key={p} style={{ fontSize: 12 }}>
                          <code>{p}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div>
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
                contractNumber: "",
                tenantName: [],
                propertyNumber: "",
              })
            }>
            <IoIosRefresh />
          </button>
        )}
      </Collapse>

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
              <th>اسم العقار</th>
              <th>
                {focusedField === "tenantName" && (
                  <input
                    type="text"
                    placeholder="بحث"
                    value={
                      Array.isArray(searchFilters.tenantName)
                        ? searchFilters.tenantName.join(", ")
                        : searchFilters.tenantName
                    }
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
                <td>{row?.propertyDetails?.propertyTitle}</td>
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
                  <Tooltip title="مرفقات">
                    <Button
                      type="text"
                      icon={<FiPaperclip />}
                      onClick={async () => {
                        setAttachmentsLoading(true);
                        try {
                          const rows = await window.electron.getAttachments(
                            "tenant",
                            row.id
                          );
                          setAttachmentsForRecord(rows || []);
                          setAttachmentsModalVisible(true);
                        } catch (err) {
                          console.error("Failed to fetch attachments", err);
                        } finally {
                          setAttachmentsLoading(false);
                        }
                      }}
                    />
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Attachments Modal */}
      <Modal
        title="مرفقات العقد"
        open={attachmentsModalVisible}
        onCancel={() => setAttachmentsModalVisible(false)}
        footer={null}>
        <List
          loading={attachmentsLoading}
          dataSource={attachmentsForRecord}
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
                      if (res.deleted) {
                        setAttachmentsForRecord((rows) =>
                          rows.filter((r) => r.id !== item.id)
                        );
                      }
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
      </Modal>

      <ConfirmModal
        show={isModalOpen}
        message="هل أنت متأكد أنك تريد الحذف؟"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
