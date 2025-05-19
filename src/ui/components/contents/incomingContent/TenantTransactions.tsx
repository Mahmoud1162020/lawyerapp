import React from "react";
import "./TenantTransactions.css";

interface TenantTransaction {
  id: number;
  name: string;
  date: string;
  amount: number;
  balance: number;
  details: string;
}

interface Props {
  transactions: TenantTransaction[];
  onDelete: (id: number) => void;
}

const TenantTransactions: React.FC<Props> = ({ transactions, onDelete }) => {
  return (
    <div className="tenant-transactions-table">
      <table>
        <thead>
          <tr>
            <th>ت ع</th>
            <th>الاسم</th>
            <th>التاريخ</th>
            <th>له</th>
            <th>عليه</th>
            <th>الرصيد</th>
            <th>التفاصيل</th>
            <th>حذف</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.name}</td>
              <td>{t.date}</td>
              <td>{t.amount}</td>
              <td>-</td>
              <td>{t.balance}</td>
              <td>{t.details}</td>
              <td>
                <button className="delete-btn" onClick={() => onDelete(t.id)}>
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

export default TenantTransactions;
