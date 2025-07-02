import React from "react";
import "./CustomModal.css";

type CustomModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: string | number;
};

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  onClose,
  title,
  children,
  width = 400,
}) => {
  if (!open) return null;

  return (
    <div className="custom-modal-overlay" onClick={onClose}>
      <div
        className="custom-modal-content"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}>
        <button className="custom-modal-close" onClick={onClose}>
          ×
        </button>
        {title && <h2 className="custom-modal-title">{title}</h2>}
        <div className="custom-modal-body">{children}</div>
      </div>
    </div>
  );
};

export default CustomModal;
