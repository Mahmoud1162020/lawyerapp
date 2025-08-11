import React from "react";
import CustomModal from "./CustomModal";

interface InfoModalProps {
  showModal: boolean;
  setShowModal: (value: boolean) => void;
  info: {
    realStates?: realState[];
    procedures: Procedure[];
    tenants: TenantResponse[];
    transactions: {
      proceduresTransactions?: Transaction[];
      personalTransactions?: PersonalTransaction[];
      internalTransactions?: InternalTransaction[];
    };
    customersAccounts?: Customer[]; // Optional, adjust as needed
  }; // Adjust type as needed
}

const InfoModal: React.FC<InfoModalProps> = ({
  showModal,
  setShowModal,
  info,
}) => {
  console.log("InfoModal rendered with props:", info);

  return (
    <CustomModal
      open={showModal}
      onClose={() => setShowModal(false)}
      title="معلومات"
      width="90vw">
      <div>
        {info.realStates && info.realStates.length > 0 && (
          <div>
            <h3>عقارات</h3>
            <table className="info-modal-table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>الموقع</th>
                  <th>التاريخ</th>
                  <th>تفاصيل</th>
                  <th>له</th>
                  <th>عليه</th>
                </tr>
              </thead>
              <tbody>
                {info.realStates.map((state, index) => (
                  <tr key={index}>
                    <td>{state.propertyTitle}</td>
                    <td>{state.address}</td>
                    <td>{state.date}</td>
                    <td>{state.details || "N/A"}</td>
                    <td>{state.credit}</td>
                    <td>{state.debit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {info.procedures && info.procedures.length > 0 && (
          <div>
            <h3>معاملات</h3>
            <table className="info-modal-table">
              <thead>
                <tr>
                  <th>رقم المعاملة</th>
                  <th>نوع المعاملة</th>
                  <th>التاريخ</th>
                  <th>تفاصيل</th>
                  <th>الحالة</th>
                  <th>له</th>
                  <th>عليه</th>
                </tr>
              </thead>
              <tbody>
                {info.procedures.map((state, index) => (
                  <tr key={index}>
                    <td>{state.procedureNumber}</td>
                    <td>{state.procedureName}</td>
                    <td>{state.date}</td>
                    <td>{state.description || "N/A"}</td>
                    <td>{state.status}</td>

                    <td>{state.credit}</td>
                    <td>{state.debit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {info.tenants && info.tenants.length > 0 && (
          <div>
            <h3>الإيجار</h3>
            <table className="info-modal-table">
              <thead>
                <tr>
                  <th>اسم العقار</th>
                  <th>الموقع</th>
                  <th>بداية العقد</th>
                  <th>نهاية العقد</th>
                  <th>الحالة</th>
                  <th>installmentCount</th>
                  <th>تفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {info.tenants.map((tenant, index) => (
                  <tr key={index}>
                    <td>{tenant.propertyDetails.propertyTitle}</td>
                    <td>{tenant.propertyDetails.address}</td>
                    <td>{tenant.startDate}</td>
                    <td>{tenant.endDate}</td>
                    <td>{tenant.contractStatus}</td>
                    <td>
                      <ul
                        style={{
                          margin: 0,
                          padding: 0,
                          listStyle: "none",
                          overflowY: "auto",
                          maxHeight: "50px",
                        }}>
                        {tenant.installmentsDue &&
                        tenant.installmentsDue.length > 0
                          ? (
                              (typeof tenant.installmentsDue === "string"
                                ? JSON.parse(tenant.installmentsDue)
                                : tenant.installmentsDue) as {
                                date: string;
                                isPaid: boolean;
                              }[]
                            ).map((i, idx) => (
                              <li key={idx}>
                                {i.date} - {i.isPaid ? "مدفوع" : "غير مدفوع"}
                              </li>
                            ))
                          : "N/A"}
                      </ul>
                    </td>

                    <td>{tenant.details || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CustomModal>
  );
};

export default InfoModal;
