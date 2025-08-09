import { useAuthUser } from "../../helper/useAuthUser";
import { useAppSelector } from "../../store";
import Admin from "../Admin";
import NoPermission from "../NoPermission";
import CustomersAccount from "../Tables/CutomersAccount";
import ProceduresTable from "../Tables/ProceduresTable";
import RealStatesTable from "../Tables/RealStatesTable";
import TenantsContractTable from "../Tables/TenantsContractTable";

interface TabContentProps {
  activeTab: string;
}

export default function ManageTabContent({ activeTab }: TabContentProps) {
  const userPermission = useAuthUser();
  const { subNavState } = useAppSelector((state) => state.subNav);
  activeTab = subNavState.toString();
  const content = {
    customersAccount: (
      <div className="tab-content">
        {userPermission?.permissions.users ? (
          <CustomersAccount />
        ) : (
          <NoPermission />
        )}
      </div>
    ),
    realState: (
      <div className="tab-content">
        {userPermission?.permissions.realstate ? (
          <RealStatesTable />
        ) : (
          <NoPermission />
        )}
      </div>
    ),
    Procedures: (
      <div className="tab-content">
        {userPermission?.permissions.procedures ? (
          <ProceduresTable />
        ) : (
          <NoPermission />
        )}
      </div>
    ),
    Tenants: (
      <div className="tab-content">
        {userPermission?.permissions.tenants ? (
          <TenantsContractTable />
        ) : (
          <NoPermission />
        )}
      </div>
    ),
    admin: (
      <div className="tab-content">
        {userPermission?.permissions.dashboard ? <Admin /> : <NoPermission />}
      </div>
    ),
  };

  return content[activeTab as keyof typeof content] || null;
}
