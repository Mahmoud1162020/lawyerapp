import React from "react";
import "./TenantTransactions.css";
import { useNavigate } from "react-router-dom";

interface TenantTransaction {
  transactionId: number;
  customerName: string;
  date: string;
  amount: number;
  balance: number;
  details: string;
  description: string;
}

interface Props {
  tenansTransactions: TenantTransaction[];
  onDelete: (id: number) => void;
  selectedType: string;
  activeTab: string;
}

const TenantTransactions: React.FC<Props> = ({
  tenansTransactions,
  onDelete,
  selectedType,
  activeTab,
}) => {
  const navigate = useNavigate();
  console.log("TenantTransactions component rendered with props:", {
    tenansTransactions,
  });

  return (
    <div className="tenant-transactions-table">
      <table>
        <thead>
          <tr>
            <th>ت ع</th>
            <th>الاسم</th>
            <th>المبلغ</th>
            <th>التاريخ</th>
            {/* <th>الرصيد</th> */}
            {/* <th>المدين</th>
            {/* <th>له</th>
            <th>عليه</th> */}
            {/* <th>الرصيد</th> */}
            <th>التفاصيل</th>
            <th>خيارات</th>
          </tr>
        </thead>
        <tbody>
          {tenansTransactions?.map((t) => (
            <tr key={t.transactionId}>
              <td>{t.transactionId}</td>
              <td>{t.customerName}</td>
              <td>{t.amount}</td>
              <td>{t.date}</td>
              {/* <td>-</td> */}
              {/* <td>{t.balance}</td> */}
              <td>{t.description}</td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => onDelete(t.transactionId)}>
                  حذف
                </button>{" "}
                <button
                  className="delete-btn"
                  style={{ backgroundColor: "green" }}
                  onClick={() =>
                    navigate(`/tenant-transaction-details/${t.transactionId}`, {
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

export default TenantTransactions;
