import React, { useEffect, useState } from "react";
import { FEATURES, ROLES } from "../types/Keys";
// import { useAppDispatch } from "../store";
// import { setUser } from "../store/slices/usersSlice";
import { useAuthUser } from "../helper/useAuthUser";

// Example features/components in the app

const UsersPermissions = () => {
  // const dispatch = useAppDispatch();
  const [usersInfo, setUsersInfo] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthUser();

  // Fetch users and their permissions
  useEffect(() => {
    console.log("Fetching users and permissions for:", user);

    const fetchUsers = async () => {
      setLoading(true);
      // Replace with your actual API call
      const dbUsers = await window.electron.getAllUsers?.();
      const usersWithParsedPermissions = (dbUsers || []).map((u: User) => ({
        ...u,
        permissions:
          typeof u.permissions === "string"
            ? JSON.parse(u.permissions)
            : u.permissions || {},
      }));
      setUsersInfo(usersWithParsedPermissions);
      console.log("====================================");
      console.log(usersWithParsedPermissions);
      console.log("====================================");
      setLoading(false);
    };
    fetchUsers();
  }, []);

  // Handle permission change
  const handlePermissionChange = async (
    userId: number,
    feature: string,
    value: boolean
  ) => {
    // Update local state immediately for UI feedback
    setUsersInfo((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, permissions: { ...u.permissions, [feature]: value } }
          : u
      )
    );

    // Find the updated user's permissions object
    const updatedUser = usersInfo.find((u) => u.id === userId);
    const newPermissions = { ...updatedUser?.permissions, [feature]: value };

    // Save the full permissions object to DB via IPC
    await window.electron.updateUserPermissions(userId, newPermissions);
  };

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 24px #0001",
        padding: 32,
      }}>
      <h2 style={{ textAlign: "center", color: "#1976d2", marginBottom: 24 }}>
        صلاحيات المستخدمين
      </h2>
      {loading ? (
        <div style={{ textAlign: "center", color: "#1976d2" }}>
          جاري التحميل...
        </div>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fafbfc",
          }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #e0e0e0", padding: 8 }}>
                المعرف
              </th>
              <th style={{ border: "1px solid #e0e0e0", padding: 8 }}>
                اسم المستخدم
              </th>
              <th style={{ border: "1px solid #e0e0e0", padding: 8 }}>الدور</th>
              {FEATURES.map((f) => (
                <th
                  key={f.key}
                  style={{ border: "1px solid #e0e0e0", padding: 8 }}>
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usersInfo.map((user) => (
              <tr key={user.id}>
                <td style={{ border: "1px solid #e0e0e0", padding: 8 }}>
                  {user.id}
                </td>
                <td style={{ border: "1px solid #e0e0e0", padding: 8 }}>
                  {user.username}
                </td>
                <td style={{ border: "1px solid #e0e0e0", padding: 8 }}>
                  {ROLES[user.role as keyof typeof ROLES] || user.role}
                </td>
                {FEATURES.map((f) => (
                  <td
                    key={f.key}
                    style={{ border: "1px solid #e0e0e0", padding: 8 }}>
                    <input
                      type="checkbox"
                      checked={!!user.permissions?.[f.key]}
                      onChange={(e) =>
                        handlePermissionChange(user.id, f.key, e.target.checked)
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UsersPermissions;
