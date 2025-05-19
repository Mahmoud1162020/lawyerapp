import React, { useEffect } from "react";
import "./PersonalTransactions.css";
import { toast, ToastContainer } from "react-toastify";

interface Props {
  personalTransactions: PersonalTransaction[];
  setPersonalTransactions: React.Dispatch<
    React.SetStateAction<PersonalTransaction[]>
  >;
  onDelete: (id: number) => void;
}

const PersonalTransactions: React.FC<Props> = ({
  personalTransactions,
  setPersonalTransactions,
  onDelete,
}) => {
  // Define the correct type for customer accounts based on the returned structure

  const [updateFlag, setUpdateFlag] = React.useState(false);

  useEffect(() => {
    //fetch customersAccount
  }, []);

  return (
    <div className="personal-transactions-table">
      <ToastContainer />
      <table>
        <thead>
          <tr>
            <th>ت ع</th>
            <th>الاسم</th>
            <th>المبلغ</th>
            <th>له</th>
            <th>عليه</th>
            <th>الرصيد</th>
            <th>التاريخ</th>

            <th>التفاصيل</th>
            <th>خيارات</th>
          </tr>
        </thead>
        <tbody>
          {personalTransactions?.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.customer_name}</td>
              <td>{t.transactionType === "incoming" ? t.amount : 0}</td>
              <td>{t.customer_credit}</td>
              <td>{t.customer_debit}</td>
              <td>{(t.customer_credit ?? 0) - (t.customer_debit ?? 0)}</td>
              <td>{t.date}</td>

              <td>{t.report}</td>
              <td>
                <button
                  className="delete-button"
                  onClick={() => onDelete(t.id)}>
                  حذف
                </button>
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

export default PersonalTransactions;
