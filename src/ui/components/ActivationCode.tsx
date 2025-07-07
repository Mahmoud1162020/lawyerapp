import React, { useState } from "react";

const ActivationCode: React.FC = () => {
  const [userId, setUserId] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    try {
      // Replace with your actual Electron API call
      //   const newCode = await window.electron.generateActivationCode(
      //     Number(userId)
      //   );
      //   setCode(newCode);
      setResult("تم إنشاء كود التفعيل بنجاح");
    } catch (error) {
      setResult("حدث خطأ أثناء إنشاء كود التفعيل");
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setResult("تم نسخ الكود");
  };

  return (
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
      <h2 style={{ color: "#1976d2", marginBottom: 24 }}>توليد كود تفعيل</h2>
      <input
        type="number"
        placeholder="معرف المستخدم"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
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
        onClick={handleGenerate}
        disabled={loading || !userId}
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
        {loading ? "جاري التوليد..." : "توليد الكود"}
      </button>
      {code && (
        <div style={{ margin: "16px 0" }}>
          <div
            style={{
              fontSize: "1.3rem",
              background: "#f5f7fa",
              padding: "12px 0",
              borderRadius: 6,
              marginBottom: 8,
              letterSpacing: 2,
              fontWeight: "bold",
            }}>
            {code}
          </div>
          <button
            onClick={handleCopy}
            style={{
              padding: "6px 18px",
              background: "#388e3c",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: "1rem",
              cursor: "pointer",
            }}>
            نسخ الكود
          </button>
        </div>
      )}
      {result && (
        <div style={{ marginTop: 12, color: "#1976d2", fontWeight: "bold" }}>
          {result}
        </div>
      )}
    </div>
  );
};

export default ActivationCode;
