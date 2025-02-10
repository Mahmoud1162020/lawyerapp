import React from "react";
import "./styles.css";
import OutgoingConten from "../contents/outgoingContent/OutgoingContent";

interface TabContentProps {
  activeTab: string;
}

export default function TabContent({ activeTab }: TabContentProps) {
  const content: Record<string, JSX.Element> = {
    outgoing: (
      <div className="tab-content">
        <OutgoingConten />
      </div>
    ),
    incoming: (
      <div className="tab-content">
        <h2 className="tab-title">محتوى الوارد</h2>
        <p>هنا يمكنك عرض المعلومات المتعلقة بالوثائق والمراسلات الواردة.</p>
      </div>
    ),
    internal: (
      <div className="tab-content">
        <h2 className="tab-title">محتوى القيد الداخلي</h2>
        <p>هنا يمكنك عرض المعلومات المتعلقة بالسجلات والوثائق الداخلية.</p>
      </div>
    ),
  };

  return content[activeTab] || null;
}
