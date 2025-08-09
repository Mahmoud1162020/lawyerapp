import React from "react";
import "./styles.css";
import OutgoingConten from "../contents/outgoingContent/OutgoingContent";
import IncomingContent from "../contents/incomingContent/IncomingContent";
import InternalTransactions from "../contents/internalContent/InternalTransactions";
import { useAuthUser } from "../../helper/useAuthUser";
import NoPermission from "../NoPermission";

interface TabContentProps {
  activeTab: string;
}

export default function TabContent({ activeTab }: TabContentProps) {
  const userPermission = useAuthUser();
  console.log("====================================");
  console.log(userPermission);
  console.log("====================================");

  const content: Record<string, JSX.Element> = {
    outgoing: (
      <div className="tab-content">
        {userPermission.permissions.outgoing ? (
          <OutgoingConten activeTab={activeTab} />
        ) : (
          <NoPermission />
        )}
      </div>
    ),
    incoming: (
      <div className="tab-content">
        {userPermission.permissions.incoming ? (
          <IncomingContent activeTab={activeTab} />
        ) : (
          <NoPermission />
        )}
      </div>
    ),
    internal: (
      <div className="tab-content">
        {userPermission.permissions.internal ? (
          <InternalTransactions activeTab={activeTab} />
        ) : (
          <NoPermission />
        )}
      </div>
    ),
  };

  return content[activeTab] || null;
}
