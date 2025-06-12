import React from "react";
import "./styles.css";
import OutgoingConten from "../contents/outgoingContent/OutgoingContent";
import IncomingContent from "../contents/incomingContent/IncomingContent";
import InternalEntry from "../contents/internalContent/InternalEntry";

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
        <InternalEntry />
      </div>
    ),
  };

  return content[activeTab] || null;
}
