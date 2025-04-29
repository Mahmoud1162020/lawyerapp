import CustomersAccount from "../Tables/CutomersAccount";
import ProceduresTable from "../Tables/ProceduresTable";
import RealStatesTable from "../Tables/RealStatesTable";
import TenantsContractTable from "../Tables/TenantsContractTable";

interface TabContentProps {
  activeTab: string;
}

export default function TabContent({ activeTab }: TabContentProps) {
  const content = {
    customersAccount: (
      <div className="tab-content">
        <CustomersAccount />
      </div>
    ),
    realState: (
      <div className="tab-content">
        <RealStatesTable />
      </div>
    ),
    Procedures: (
      <div className="tab-content">
        <ProceduresTable />
      </div>
    ),
    Tenants: (
      <div className="tab-content">
        <TenantsContractTable />
      </div>
    ),
  };

  return content[activeTab as keyof typeof content] || null;
}
