import React, { useState } from "react";
import JSZip from "jszip";

const ExportBackup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setResult(null);
    try {
      // Fetch all tables' data via preload-exposed IPC
      const users = await window.electron.getAllUsers?.();
      const transactions = await window.electron.getAllTransactions?.();
      const personalTransactions =
        await window.electron.getAllPersonalTransactions?.();
      const realstates = await window.electron.getAllRealStates?.();
      const procedures = await window.electron.getAllProcedures?.();
      const tenants = await window.electron.getAllTenants?.();
      const tenantTransactions =
        await window.electron.getAllTenantTransactions?.();
      const customers = await window.electron.getAllCustomersAccounts?.();
      const internalTransactions =
        await window.electron.getAllInternalTransactions?.();

      const backup = {
        metadata: {
          exportedAt: new Date().toISOString(),
          app: "CaseFlow",
        },
        users: users || [],
        transactions: transactions || [],
        personalTransactions: personalTransactions || [],
        realstates: realstates || [],
        procedures: procedures || [],
        tenants: tenants || [],
        tenantTransactions: tenantTransactions || [],
        customers: customers || [],
        internalTransactions: internalTransactions || [],
      };

      // create zip with each table as separate json file
      const zip = new JSZip();
      for (const key of Object.keys(backup)) {
        if (key === "metadata") continue;
        zip.file(
          `${key}.json`,
          JSON.stringify((backup as any)[key] || [], null, 2)
        );
      }
      zip.file("metadata.json", JSON.stringify(backup.metadata, null, 2));
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      a.href = url;
      a.download = `caseflow-backup-${timestamp}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setResult("تم تصدير النسخة الاحتياطية بنجاح!");
    } catch (error: any) {
      setResult("حدث خطأ أثناء التصدير: " + (error?.message || String(error)));
    }
    setLoading(false);
  };

  const handleImport = async (file: File | null) => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const backup: any = { metadata: {} };
      if (zip.file("metadata.json")) {
        const metaText = await zip.file("metadata.json")!.async("string");
        backup.metadata = JSON.parse(metaText);
      }
      const tableFiles = [
        "users.json",
        "transactions.json",
        "personalTransactions.json",
        "realstates.json",
        "procedures.json",
        "tenants.json",
        "tenantTransactions.json",
        "customers.json",
        "internalTransactions.json",
      ];
      for (const name of tableFiles) {
        const f = zip.file(name);
        if (f) {
          const txt = await f.async("string");
          const key = name.replace(".json", "");
          try {
            backup[key] = JSON.parse(txt);
          } catch (e) {
            backup[key] = [];
          }
        }
      }

      // Ask main to restore (this will backup the current DB before applying)
      if (!window.electron.restoreBackup) {
        setResult(
          "ميزة الاستعادة غير متاحة حالياً — أعد تشغيل التطبيق لتطبيق التغييرات"
        );
        setLoading(false);
        return;
      }

      const res = await window.electron.restoreBackup(backup as any);
      if (res?.restored) {
        let msg = res.message || "تمت الاستعادة بنجاح";
        if (res.summary) {
          const parts = Object.keys(res.summary || {}).map(
            (t) => `${t}: ${res.summary?.[t] ?? 0} صف`
          );
          msg += " — ملخص: " + parts.join(", ");
        }
        if (
          res.warnings &&
          Array.isArray(res.warnings) &&
          res.warnings.length > 0
        ) {
          msg += " — تحذيرات: " + res.warnings.slice(0, 5).join("; ");
          if (res.warnings.length > 5)
            msg += `; ...و ${res.warnings.length - 5} تحذيرات إضافية`;
        }
        setResult(msg);
      } else {
        // show returned payload for debugging
        setResult(
          "فشل الاستعادة: " +
            (res ? JSON.stringify(res) : "لا يوجد رد من المعالج")
        );
      }
    } catch (error: any) {
      setResult(
        "حدث خطأ أثناء الاستيراد: " + (error?.message || String(error))
      );
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
        {loading ? "جاري التصدير..." : "تصدير  "}
      </button>
      <div style={{ marginTop: 12 }}>
        <label
          style={{
            display: "inline-block",
            padding: "8px 14px",
            background: "#eee",
            borderRadius: 8,
            cursor: "pointer",
          }}>
          استيراد نسخة احتياطية
          <input
            type="file"
            accept=".zip"
            style={{ display: "none" }}
            onChange={(e) =>
              handleImport(e.target.files ? e.target.files[0] : null)
            }
            disabled={loading}
          />
        </label>
      </div>
      {result && (
        <div style={{ marginTop: 18, color: "#1976d2", fontWeight: "bold" }}>
          {result}
        </div>
      )}
    </div>
  );
};

export default ExportBackup;
