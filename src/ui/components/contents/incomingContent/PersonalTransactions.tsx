import React, { useEffect } from "react";
import "./PersonalTransactions.css";
import { toast, ToastContainer } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

interface Props {
  personalTransactions: PersonalTransaction[];
  setPersonalTransactions: React.Dispatch<
    React.SetStateAction<PersonalTransaction[]>
  >;
  onDelete: (id: number) => void;
  selectedType: string;
  activeTab: string;
}

const PersonalTransactions: React.FC<Props> = ({
  personalTransactions,
  setPersonalTransactions,
  onDelete,
  selectedType,
  activeTab,
}) => {
  // Define the correct type for customer accounts based on the returned structure
  const navigate = useNavigate();
  const location = useLocation();
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
                  onClick={() =>
                    navigate(`/personalTransaction-incoming-details/${t.id}`, {
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

export default PersonalTransactions;
