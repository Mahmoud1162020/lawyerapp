import React from "react";
import "./styles.css";
import OutgoingConten from "../contents/outgoingContent/OutgoingContent";
import IncomingPage from "../contents/incomingContent/IncomingContent";
import InternalEntry from "../contents/internalContent/InternalEntry";

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
        <IncomingPage />
      </div>
    ),
    internal: (
      <div className="tab-content">
        <InternalEntry />
      </div>
    ),
  };

  return content[activeTab] || null;
}
