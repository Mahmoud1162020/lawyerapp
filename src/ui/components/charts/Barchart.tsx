import { BarChart } from "@mui/x-charts";
import React from "react";

interface BarchartProps {
  barData: Array<{
    month: string;
    available: number;
    sold: number;
    rented: number;
  }>;
}

const Barchart: React.FC<BarchartProps> = ({ barData }) => {
  function valueFormatter(value: number | null) {
    return `${value}`;
  }
  return (
    <BarChart
      dataset={barData}
      xAxis={[{ dataKey: "month" }]}
      series={[
        { dataKey: "available", label: "متاح", valueFormatter },
        { dataKey: "sold", label: "مباع", valueFormatter },
        { dataKey: "rented", label: "مؤجر", valueFormatter },
      ]}
      height={300}
      width={600}
      sx={{ width: "100%" }}
      // Responsive width
    />
  );
};

export default Barchart;
