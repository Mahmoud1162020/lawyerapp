import { useEffect, useState } from "react";
import "./RealStatesTable.css"; // Create a corresponding CSS file (see below)
import { IoIosRefresh } from "react-icons/io";
import ConfirmModal from "../Modal/ConfirmModal";
import { useNavigate } from "react-router-dom";

export default function RealStatesTable() {
  const navigate = useNavigate();

  // Form fields for adding a new real state record (labels in Arabic)
  const [propertyTitle, setPropertyTitle] = useState(""); // اسم العقار
  const [propertyNumber, setPropertyNumber] = useState(""); // رقم العقار
  const [agentName, setAgentName] = useState(""); // اصحاب العقار (اسم المالك أو بالعربية)
  const [address, setAddress] = useState(""); // عنوان العقار
  const [price, setPrice] = useState(""); // السعر
  const [date, setDate] = useState(""); // التاريخ
  const [details, setDetails] = useState(""); // الملاحظات

  // Table data and search/filter states
  const [tableData, setTableData] = useState<
    {
      id: number;
      propertyNumber: string;
      title: string;
      agentName: string;
      address: string;
      price: string;
      date: string;
      details: string | null;
    }[]
  >([]);
  const [filteredData, setFilteredData] = useState(tableData);
  const [searchFilters, setSearchFilters] = useState({
    propertyNumber: "",
    title: "",
    agentName: "",
    address: "",
    price: "",
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Modal states for delete confirmation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<number | null>(null);

  // Fetch real state records on mount
  useEffect(() => {
    const fetchRealStates = async () => {
      try {
        // This should fetch real state records from your backend
        const properties = await window.electron.getAllRealStates();
        console.log("Fetched real states:", properties);
        setTableData(properties);
        setFilteredData(properties);
      } catch (error) {
        console.error("Error fetching real states:", error);
      }
    };

    fetchRealStates();
  }, []);

  // Filter table data based on search filters
  useEffect(() => {
    const filtered = tableData.filter((row) => {
      return (
        (row.propertyNumber?.toLowerCase() || "").includes(
          searchFilters.propertyNumber.toLowerCase()
        ) &&
        (row.title?.toLowerCase() || "").includes(
          searchFilters.title.toLowerCase()
        ) &&
        (row.agentName?.toLowerCase() || "").includes(
          searchFilters.agentName.toLowerCase()
        ) &&
        (row.address?.toLowerCase() || "").includes(
          searchFilters.address.toLowerCase()
        ) &&
        (row.price?.toLowerCase() || "").includes(
          searchFilters.price.toLowerCase()
        )
      );
    });
    setFilteredData(filtered);
  }, [searchFilters, tableData]);

  // Blur search fields on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".search-trigger") && !target.closest("input")) {
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

  // Save a new real state record with Arabic placeholders/labels
  const handleSave = async () => {
    if (
      propertyTitle.trim() === "" ||
      propertyNumber.trim() === "" ||
      agentName.trim() === "" ||
      address.trim() === "" ||
      price.trim() === "" ||
      date.trim() === ""
    ) {
      alert("الرجاء ملء جميع الحقول");
      return;
    }
    try {
      const response = await window.electron.addRealState(
        propertyTitle, // اسم العقار
        propertyNumber, // رقم العقار
        agentName, // اصحاب العقار
        address, // عنوان العقار
        price, // السعر
        date, // التاريخ
        details // الملاحظات
      );
      console.log("Real state added:", response);
      const updatedProperties = await window.electron.getAllRealStates();
      setTableData(updatedProperties);
      setFilteredData(updatedProperties);

      // Clear form fields
      setPropertyTitle("");
      setPropertyNumber("");
      setAgentName("");
      setAddress("");
      setPrice("");
      setDate("");
      setDetails("");
    } catch (error) {
      console.error("Error adding real state:", error);
    }
  };

  const handleDelete = (id: number) => {
    setPropertyToDelete(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (propertyToDelete !== null) {
      try {
        await window.electron.deleteRealState(propertyToDelete);
        console.log(`Deleted real state with id: ${propertyToDelete}`);
        const updatedProperties = await window.electron.getAllRealStates();
        setTableData(updatedProperties);
        setFilteredData(updatedProperties);
      } catch (error) {
        console.error("Error deleting real state:", error);
      } finally {
        setPropertyToDelete(null);
        setIsModalOpen(false);
      }
    }
  };

  const handleCancelDelete = () => {
    setPropertyToDelete(null);
    setIsModalOpen(false);
  };

  return (
    <div className="data-table-container">
      <div className="form-container">
        <div className="form-row">
          <div className="form-group">
            <label>ادخل اسم العقار</label>
            <input
              type="text"
              value={propertyTitle}
              onChange={(e) => setPropertyTitle(e.target.value)}
              placeholder="500"
            />
          </div>
          <div className="form-group">
            <label>ادخل رقم العقار</label>
            <input
              type="text"
              value={propertyNumber}
              onChange={(e) => setPropertyNumber(e.target.value)}
              placeholder="07701234567"
            />
          </div>
          <div className="form-group">
            <label>ادخل اصحاب العقار</label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="الزراعي"
            />
          </div>
          <div className="form-group">
            <label>ادخل عنوان العقار</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="الملاحظات"
            />
          </div>
          <div className="form-group">
            <label>السعر</label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1500"
            />
          </div>
          <div className="form-group">
            <label>التاريخ</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>الملاحظات</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="الملاحظات"
            />
          </div>

          <button className="save-button" onClick={handleSave}>
            حفظ
          </button>
          <button
            className="save-button"
            onClick={() =>
              setSearchFilters({
                propertyNumber: "",
                title: "",
                agentName: "",
                address: "",
                price: "",
              })
            }>
            <IoIosRefresh />
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>رقم</th>
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
                  className="search-trigger"
                  onClick={() => handleSearchFocus("propertyNumber")}>
                  رقم العقار
                </div>
              </th>
              <th>
                {focusedField === "title" && (
                  <input
                    type="text"
                    placeholder="بحث"
                    value={searchFilters.title}
                    onBlur={handleSearchBlur}
                    onChange={(e) =>
                      handleSearchChange("title", e.target.value)
                    }
                  />
                )}
                <div
                  className="search-trigger"
                  onClick={() => handleSearchFocus("title")}>
                  اسم العقار
                </div>
              </th>
              <th>
                {focusedField === "agentName" && (
                  <input
                    type="text"
                    placeholder="بحث"
                    value={searchFilters.agentName}
                    onBlur={handleSearchBlur}
                    onChange={(e) =>
                      handleSearchChange("agentName", e.target.value)
                    }
                  />
                )}
                <div
                  className="search-trigger"
                  onClick={() => handleSearchFocus("agentName")}>
                  اصحاب العقار
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
                  className="search-trigger"
                  onClick={() => handleSearchFocus("address")}>
                  عنوان العقار
                </div>
              </th>
              <th>
                {focusedField === "price" && (
                  <input
                    type="text"
                    placeholder="بحث"
                    value={searchFilters.price}
                    onBlur={handleSearchBlur}
                    onChange={(e) =>
                      handleSearchChange("price", e.target.value)
                    }
                  />
                )}
                <div
                  className="search-trigger"
                  onClick={() => handleSearchFocus("price")}>
                  السعر
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
                <td>{row.propertyNumber}</td>
                <td>{row.title}</td>
                <td>{row.agentName}</td>
                <td>{row.address}</td>
                <td>{row.price}</td>
                <td>{row.date}</td>
                <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(row.id)}>
                    حذف
                  </button>
                  <button
                    className="details-button"
                    onClick={() => navigate(`/realstate/${row.id}`)}>
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
