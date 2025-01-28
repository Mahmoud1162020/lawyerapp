import React from "react";

interface UserManagementProps {
  userId: number;
}

const UserManagement: React.FC<UserManagementProps> = ({ userId }) => {
  const handleDelete = async () => {
    try {
      const result = await window.electron.deleteUser(userId);
      if (result.deleted) {
        console.log("User deleted");
      } else {
        console.log("User not found");
      }
    } catch (error) {
      console.error("Deletion failed:", error);
    }
  };

  return (
    <div>
      <h2>User Management</h2>
      <button onClick={handleDelete}>Delete Account</button>
    </div>
  );
};

export default UserManagement;
