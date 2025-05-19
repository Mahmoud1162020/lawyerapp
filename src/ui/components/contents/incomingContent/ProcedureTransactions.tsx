import React from "react";
import "./ProcedureTransactions.css";

interface ProcedureTransaction {
  id: number;
  transactionId: string;
  recipient: string;
  date: string;
  amount: number;
  currency: string;
}

interface Props {
  transactions: ProcedureTransaction[];
  onDelete: (id: number) => void;
}

const ProcedureTransactions: React.FC<Props> = ({ transactions, onDelete }) => {
  return (
    <div className="procedure-transactions-table">
      <table>
        <thead>
          <tr>
            <th>ت ع</th>
            <th>رقم المعاملة</th>
            <th>الاسم</th>
            <th>التاريخ</th>
            <th>له</th>
            <th>عليه</th>
            <th>العملة</th>
            <th>خيارات</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.transactionId}</td>
              <td>{t.recipient}</td>
              <td>{t.date}</td>
              <td>{t.amount}</td>
              <td>-</td>
              <td>{t.currency}</td>
              <td>
                <button className="btn" onClick={() => onDelete(t.id)}>
                  حذف
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
