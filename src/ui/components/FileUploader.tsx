import React, { useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

interface Props {
  subfolder?: string; // optional subfolder under attachments
  accept?: string; // e.g. "image/*,application/pdf"
  onSaved?: (savedPath: string) => void;
  label?: string;
}

export default function FileUploader({
  subfolder,
  accept = "image/*,application/pdf",
  onSaved,
  label = "رفع مرفق",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedPath, setSavedPath] = useState<string | null>(null);

  const handleSelect = () => {
    inputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const buffer = await file.arrayBuffer();
      const res = await window.electron.saveFile(file.name, buffer, subfolder);
      setSavedPath(res.path);
      onSaved?.(res.path);
    } catch (err) {
      console.error("Failed to save file:", err);
      toast("فشل رفع الملف");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={onFileChange}
      />
      <button onClick={handleSelect} className="save-btn">
        {saving ? "جارٍ الرفع..." : label}
      </button>
      {/* {savedPath && (
        <div style={{ marginTop: 8 }}>
          تم الحفظ: <code style={{ fontSize: 12 }}>{savedPath}</code>
        </div>
      )} */}
    </div>
  );
}
