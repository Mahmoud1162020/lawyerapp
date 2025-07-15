import React, { useState } from "react";

const ExportBackup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setResult(null);
    try {
      // Fetch all tables' data from your backend
      const users = await window.electron.getAllUsers();
      const transactions = await window.electron.getAllTransactions?.();
      const realstates = await window.electron.getAllRealStates?.();
      const procedures = await window.electron.getAllProcedures?.();
      const tenants = await window.electron.getAllTenants?.();
      const customers = await window.electron.getAllCustomersAccounts?.();

      // Map only needed fields for each table
      const exportUsers = users.map((u: any) => ({
        "اسم المستخدم": u.username,
        الدور: u.role,
        دائن: u.debit,
        مدين: u.credit,
      }));

      const exportTransactions = (transactions || []).map((t: any) => ({
        المستلم: t.recipient,
        المبلغ: t.amount,
        النوع: t.type,
        تاريخ: t.date,
      }));

      const exportRealstates = (realstates || []).map((r: any) => ({
        "اسم العقار": r.propertyTitle,
        "رقم العقار": r.propertyNumber,
        العنوان: r.address,
        السعر: r.price,
        تاريخ: r.date,
      }));

      const exportProcedures = (procedures || []).map((p: any) => ({
        "رقم المعاملة": p.procedureNumber,
        "اسم المعاملة": p.procedureName,
        الوصف: p.description,
        الحالة: p.status,
        تاريخ: p.date,
      }));

      const exportTenants = (tenants || []).map((t: any) => ({
        "رقم العقد": t.contractNumber,
        الحالة: t.contractStatus,
        "تاريخ البداية": t.startDate,
        "تاريخ النهاية": t.endDate,
        القيمة: t.entitlement,
      }));

      const exportCustomers = (customers || []).map((c: any) => ({
        الاسم: c.name,
        "رقم الحساب": c.accountNumber,
        الهاتف: c.phone,
        العنوان: c.address,
        "نوع الحساب": c.accountType,
      }));

      // Send all data to backend to generate Excel file
      const success = await window.electron.exportBackupToExcel({
        users: exportUsers,
        transactions: exportTransactions,
        realstates: exportRealstates,
        procedures: exportProcedures,
        tenants: exportTenants,
        customers: exportCustomers,
      });

      if (success) {
        setResult("تم تصدير النسخة الاحتياطية بنجاح!");
      } else {
        setResult("حدث خطأ أثناء التصدير.");
      }
    } catch (error) {
      setResult("حدث خطأ أثناء التصدير: " + error);
    }
    setLoading(false);
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
      <h2 style={{ color: "#1976d2", marginBottom: 24 }}>
        تصدير نسخة احتياطية
      </h2>
      <button
        onClick={handleExport}
        disabled={loading}
        style={{
          padding: "12px 32px",
          background: "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: "1.1rem",
          fontWeight: "bold",
          cursor: "pointer",
        }}>
        {loading ? "جاري التصدير..." : "تصدير إلى Excel"}
      </button>
      {result && (
        <div style={{ marginTop: 18, color: "#1976d2", fontWeight: "bold" }}>
          {result}
        </div>
      )}
    </div>
  );
};

export default ExportBackup;
