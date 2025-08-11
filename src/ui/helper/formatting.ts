
  // Parse a formatted number (remove commas)
export const parseNumber = (value: string): number => {
    return Number(value.replace(/,/g, "")); // Remove commas and convert to number
  };

  export const removeCommas = (value: string): string => {
    return value.replace(/,/g, ""); // Remove all commas
  };

  // Remove commas and ensure the number is valid
// Format a number with commas and preserve the decimal part
export const formatNumberWithCommas = (value: string): string => {
    const [integerPart, decimalPart] = value.split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };
  
  // Sanitize input to allow only numbers, a single period, and remove commas
  export const sanitizeNumberInput = (value: string): string => {
    return value.replace(/,/g, "").replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1");
  };