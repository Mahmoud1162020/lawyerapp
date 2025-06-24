import React from "react";
import "./styles.css";
import OutgoingConten from "../contents/outgoingContent/OutgoingContent";
import IncomingContent from "../contents/incomingContent/IncomingContent";
import InternalTransactions from "../contents/internalContent/InternalTransactions";

interface TabContentProps {
  activeTab: string;
}

export default function TabContent({ activeTab }: TabContentProps) {
  const content: Record<string, JSX.Element> = {
    outgoing: (
      <div className="tab-content">
        <OutgoingConten activeTab={activeTab} />
      </div>
    ),
    incoming: (
      <div className="tab-content">
        <IncomingContent activeTab={activeTab} />
      </div>
    ),
    internal: (
      <div className="tab-content">
        <InternalTransactions activeTab={activeTab} />
      </div>
    ),
  };

  return content[activeTab] || null;
}
