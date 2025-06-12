import React from "react";
import "./TenantTransactions.css";
import { useNavigate } from "react-router-dom";

interface Props {
  tenansTransactions?: TenantTransaction[] | TenantResponse[];
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
          {tenansTransactions?.map((t, idx) => {
            // Type guard to check if t has transactionId
            const transactionId = (t as TenantTransaction).transactionId ?? idx;
            return (
              <tr key={transactionId}>
                <td>{(t as TenantTransaction).transactionId ?? "-"}</td>
                <td>{(t as TenantTransaction).customerName ?? "-"}</td>
                <td>{(t as TenantTransaction).amount ?? "-"}</td>
                <td>{(t as TenantTransaction).date ?? "-"}</td>
                {/* <td>-</td> */}
                {/* <td>{t.balance}</td> */}
                <td>{(t as TenantTransaction).description ?? "-"}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() =>
                      onDelete((t as TenantTransaction).transactionId ?? idx)
                    }>
                    حذف
                  </button>{" "}
                  <button
                    className="delete-btn"
                    style={{ backgroundColor: "green" }}
                    onClick={() =>
                      navigate(
                        `/tenant-transaction-details/${
                          (t as TenantTransaction).transactionId
                        }`,
                        {
                          state: {
                            selectedType,
                            from: location.pathname,
                            activeTab: activeTab,
                          },
                        }
                      )
                    }>
                    تفاصيل
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TenantTransactions;
