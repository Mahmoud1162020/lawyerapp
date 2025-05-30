import React from "react";
import "./ProcedureTransactions.css";
import { useNavigate } from "react-router-dom";

interface ProcedureTransaction {
  id: number;
  procedureId: string;
  recipient: string;
  date: string;
  amount: number;
  currency: string;
}

interface ProcedureTransactionsProps {
  procedureTransactions: Transaction[];
  onDelete: (id: number) => void;
  selectedType?: string;
  activeTab?: string;
}

const ProcedureTransactions: React.FC<ProcedureTransactionsProps> = ({
  procedureTransactions,
  onDelete,
  selectedType,
  activeTab,
}) => {
  console.log("allProcedures", procedureTransactions);
  const navigate = useNavigate();
  return (
    <div className="procedure-transactions-table">
      <table>
        <thead>
          <tr>
            <th>ت ع</th>
            <th>رقم المعاملة</th>
            <th>الاسم</th>
            <th>المبلغ</th>
            <th>التاريخ</th>
            <th>خيارات</th>
          </tr>
        </thead>
        <tbody>
          {procedureTransactions?.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.procedureId}</td>
              <td>{t.recipient}</td>
              <td>{t.amount}</td>
              <td>{t.date}</td>

              <td>
                <button
                  className="delete-button"
                  onClick={() => onDelete(t.id)}>
                  حذف
                </button>{" "}
                <button
                  className="details-button"
                  onClick={() =>
                    navigate(`/procedure-incoming-details/${t.id}`, {
                      state: {
                        selectedType,
                        from: location.pathname,
                        activeTab: activeTab,
                      },
                    })
                  }>
                  تفاصيل
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProcedureTransactions;
