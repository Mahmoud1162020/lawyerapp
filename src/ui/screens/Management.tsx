import React, { useEffect } from "react";

const Management = () => {
  useEffect(() => {
    console.log("====================================");
    console.log("Management");
    console.log("====================================");
  }, []);
  return <div style={{ marginTop: "500px" }}>Management</div>;
};

export default Management;
