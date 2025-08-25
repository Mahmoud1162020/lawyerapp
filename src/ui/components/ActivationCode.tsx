import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

const ActivationCode: React.FC = () => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [selectionId, setSelectionId] = useState<number | null>(null);

  const handleActivate = async () => {
    setLoading(true);
    setResult(null);
    try {
      // Replace with your actual Electron API call
      //   const newCode = await window.electron.generateActivationCode(
      //     Number(userId)
      //   );
      //   setCode(newCode);
      const activationStatus = await axios.post(
        "http://localhost:8080/api/activate",
        {
          code: code,
          user: user,
        }
      );

      if (activationStatus && activationStatus.data) {
        const res = await window.electron.createActivationCode(
          activationStatus.data.code.code,
          activationStatus.data.code.duration,
          activationStatus.data.code.status,
          activationStatus.data.code.activatedBy.id
        );
        console.log("====================================");
        console.log(res);
        console.log("====================================");
      }

      setResult("تم  التفعيل بنجاح");
      toast("تم  التفعيل بنجاح");
      setCode("");
    } catch (error) {
      setResult("حدث خطأ أثناء  التفعيل" + error);
      toast("حدث خطأ أثناء  التفعيل" + error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await window.electron.getAllUsers();
        if (users && users.length > 0) {
          // Ensure each user has the required properties
          users.filter((u) => u.role === "admin");

          setUser(users[0]); // Set the first user as default
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, []);

  const content = [
    {
      id: 1,
      title: " كود تفعيل",
    },
  ];

  return (
    <div>
      <ToastContainer/>
      <div
        style={{
          textAlign: "center",
          marginBottom: 24,
          display: "flex",
          justifyContent: "center",
        }}>
        {content.map((item) => (
          <div
            key={item.id}
            className="superadmin-card"
            onClick={() => setSelectionId(item.id)}>
            {item.title}
          </div>
        ))}
      </div>
      {selectionId === 1 && (
        <div
          style={{
            maxWidth: 400,
            margin: "40px auto",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 24px #0001",
            padding: 32,
            textAlign: "center",
          }}>
          <h2 style={{ color: "#1976d2", marginBottom: 24 }}> تفعيل</h2>
          <input
            placeholder="كود التفعيل"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid #b0bec5",
              borderRadius: 6,
              fontSize: "1rem",
              marginBottom: 16,
              width: "100%",
            }}
          />
          <button
            onClick={handleActivate}
            style={{
              padding: "10px 0",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: "1.1rem",
              fontWeight: "bold",
              cursor: "pointer",
              width: "100%",
              marginBottom: 20,
            }}>
            {loading ? "جاري التفعيل..." : " تفعيل"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivationCode;
