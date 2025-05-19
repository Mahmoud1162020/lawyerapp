import React from "react";
import "./ProcedureTransactions.css";

interface ProcedureTransaction {
  id: number;
  procedureId: string;
  recipient: string;
  date: string;
  amount: number;
  currency: string;
}

interface Props {
  transactions: ProcedureTransaction[];
  onDelete: (id: number) => void;
}

const ProcedureTransactions: React.FC<Props> = ({
  transactions: allProcedures,
  onDelete,
}) => {
  console.log("allProcedures", allProcedures);

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
          {allProcedures?.map((t) => (
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
                  onClick={() => onDelete(t.id)}>
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
