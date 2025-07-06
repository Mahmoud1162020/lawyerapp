import React from "react";
import { useAppSelector } from "../../store";
export default function FinancialTable() {
  const { totalCredit, totalDebit } = useAppSelector((state) => state.finance);

  return (
    <table className="financial-table">
      <tbody>
        <tr>
          <td>{totalDebit}</td>
          <td>عليه</td>
          <td>{totalCredit}</td>
          <td>له</td>
          <td>صندوق دينار</td>
        </tr>
        <tr>
          <td>-</td>
          <td>عليه</td>
          <td>-</td>
          <td>له</td>
          <td>صندوق دولار</td>
        </tr>
      </tbody>
    </table>
  );
}
