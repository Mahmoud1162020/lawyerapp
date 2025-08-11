import { useEffect, useState } from "react";
import "./CustomersAccount.css";
import { toast } from "react-toastify";
import { IoIosRefresh } from "react-icons/io";
import ConfirmModal from "../Modal/ConfirmModal";
import { useNavigate } from "react-router-dom";

export default function DataTable() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] = useState("");
  const [details, setDetails] = useState("");
  const [accountNumber, setAccountNumber] = useState(""); // Added state for accountNumber
  const [showDropdown, setShowDropdown] = useState(false);
  const [tableData, setTableData] = useState<
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
  const [filteredData, setFilteredData] = useState(tableData); // State for filtered data
  const [searchFilters, setSearchFilters] = useState({
    name: "",
    accountNumber: "",
    accountType: "",
    phone: "",
    address: "",
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<number | null>(null);

  useEffect(() => {
    const fetchCustomersAccounts = async () => {
      try {
        const accounts = await window.electron.getAllCustomersAccounts();
        console.log("Fetched accounts:", accounts);
        setTableData(accounts); // Update state with fetched accounts
        setFilteredData(accounts); // Initialize filtered data
      } catch (error) {
        console.error("Error fetching customer accounts:", error);
      }
    };

    fetchCustomersAccounts();
  }, []);

  // Filter table data based on search filters
  useEffect(() => {
    const filtered = tableData.filter((row) => {
      return (
        (row.name?.toLowerCase() || "").includes(
          searchFilters.name.toLowerCase()
        ) &&
        (row.accountNumber?.toLowerCase() || "").includes(
          searchFilters.accountNumber.toLowerCase()
        ) &&
        (row.accountType?.toLowerCase() || "").includes(
          searchFilters.accountType.toLowerCase()
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
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".search-trigger") && !target.closest("input")) {
        setFocusedField(null); // Reset the focused field
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {}, []);
  const handleSearchChange = (field: string, value: string) => {
    setSearchFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  const handleSearchFocus = (field: string) => {
    setFocusedField(field); // Set the focused field
  };

  const handleSearchBlur = () => {
    setFocusedField(null); // Reset the focused field when input loses focus
  };

  const accountTypes = [
    { id: 1, name: "محامي" },
    { id: 3, name: "موظف" },
    { id: 4, name: "شخصي" },
    { id: 5, name: "مستأجر" },
    { id: 6, name: "موكل" },
  ];

  const handleSave = async () => {
    if (
      name.trim() === "" ||
      accountType.trim() === "" ||
      phone.trim() === "" ||
      address.trim() === ""
    ) {
      // Show an alert if any field is empty
      toast("الرجاء ملء جميع الحقول");
      return;
    }
    try {
      const response = await window.electron.addCustomersAccount(
        name,
        accountNumber,
        accountType,
        phone,
        address,
        details
      );
      console.log("Account added:", response);

      // Refresh the table after adding a new account
      const updatedAccounts = await window.electron.getAllCustomersAccounts();
      setTableData(updatedAccounts);
      setFilteredData(updatedAccounts);

      // Clear the form fields
      setName("");
      setAddress("");
      setPhone("");
      setAccountType("");
      setDetails("");
      setAccountNumber(""); // Clear accountNumber
    } catch (error) {
      console.error("Error adding account:", error);
    }
  };

  const handleDelete = async (id: number) => {
    setAccountToDelete(id); // Set the account to delete
    setIsModalOpen(true); // Open the confirmation modal
  };

  const handleConfirmDelete = async () => {
    if (accountToDelete !== null) {
      try {
        await window.electron.deleteCustomersAccount(accountToDelete);
        console.log(`Deleted account with id: ${accountToDelete}`);

        // Refresh the table after deleting an account
        const updatedAccounts = await window.electron.getAllCustomersAccounts();
        setTableData(updatedAccounts);
        setFilteredData(updatedAccounts);
      } catch (error) {
        console.error("Error deleting account:", error);
      } finally {
        setAccountToDelete(null); // Reset the account to delete
        setIsModalOpen(false); // Close the modal
      }
    }
  };

  const handleCancelDelete = () => {
    setAccountToDelete(null); // Reset the account to delete
    setIsModalOpen(false); // Close the modal
  };

  const selectAccountType = (type: string) => {
    setAccountType(type);
    setShowDropdown(false);
  };

  return (
    <div className="data-table-container">
      <div className="form-container">
        <div className="form-row">
          {/* <div className="form-group">
            <label>رقم الحساب</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="123456"
            />
          </div> */}

          <div className="form-group">
            <label>ادخل الاسم</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="محمد"
            />
          </div>

          <div className="form-group">
            <label>العنوان</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="موصل/حي الصديق"
            />
          </div>

          <div className="form-group">
            <label>رقم الهاتف</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07712345678"
            />
          </div>

          <div className="form-group dropdown-container">
            <label>نوع الحساب</label>
            <div
              className="dropdown-button"
              onClick={() => setShowDropdown(!showDropdown)}>
              <span>
                {accountType ? accountType : "محامي/موظف/شخصي/مستأجر/موكل"}{" "}
              </span>
              <span className="arrow-down">▼</span>
            </div>
            {showDropdown && (
              <div className="dropdown-menu">
                {accountTypes.map((type) => (
                  <div
                    key={type.id}
                    className="dropdown-item"
                    onClick={() => selectAccountType(type.name)}>
                    {type.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="save-button" onClick={handleSave}>
            حفظ
          </button>
          <button
            className="save-button"
            onClick={() =>
              setSearchFilters({
                name: "",
                accountNumber: "",
                accountType: "",
                phone: "",
                address: "",
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
              {/* <th>
                {focusedField === "accountNumber" && (
                  <input
                    type="text"
                    placeholder="بحث"
                    value={searchFilters.accountNumber}
                    onBlur={handleSearchBlur} // Hide input on blur
                    onChange={(e) =>
                      handleSearchChange("accountNumber", e.target.value)
                    }
                  />
                )}
                <div
                  className="search-trigger"
                  onClick={() => handleSearchFocus("accountNumber")}>
                  رقم الحساب
                </div>
              </th> */}
              <th>
                {focusedField === "name" && (
                  <input
                    type="text"
                    placeholder="بحث"
                    value={searchFilters.name}
                    onBlur={handleSearchBlur} // Hide input on blur
                    onChange={(e) => handleSearchChange("name", e.target.value)}
                  />
                )}
                <div
                  className="search-trigger"
                  onClick={() => handleSearchFocus("name")}>
                  الاسم
                </div>
              </th>
              <th>
                {focusedField === "accountType" && (
                  <input
                    type="text"
                    placeholder="بحث"
                    value={searchFilters.accountType}
                    onBlur={handleSearchBlur} // Hide input on blur
                    onChange={(e) =>
                      handleSearchChange("accountType", e.target.value)
                    }
                  />
                )}
                <div
                  className="search-trigger"
                  onClick={() => handleSearchFocus("accountType")}>
                  نوع الحساب
                </div>
              </th>
              <th>
                {focusedField === "phone" && (
                  <input
                    type="text"
                    placeholder="بحث"
                    value={searchFilters.phone}
                    onBlur={handleSearchBlur} // Hide input on blur
                    onChange={(e) =>
                      handleSearchChange("phone", e.target.value)
                    }
                  />
                )}
                <div
                  className="search-trigger"
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
                    onBlur={handleSearchBlur} // Hide input on blur
                    onChange={(e) =>
                      handleSearchChange("address", e.target.value)
                    }
                  />
                )}
                <div
                  className="search-trigger"
                  onClick={() => handleSearchFocus("address")}>
                  العنوان
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
                {/* <td>{row.accountNumber}</td> */}
                <td>{row.name}</td>
                <td>{row.accountType}</td>
                <td>{row.phone}</td>
                <td>{row.address}</td>
                <td>{row.date}</td>
                <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(row.id)}>
                    حذف
                  </button>
                  <button
                    className="details-button"
                    onClick={() => navigate(`/details/${row.id}`)}>
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
