import React, { useEffect, useState } from "react";
import "./UserManagement.css";
import { ROLES, ROLESARRAY } from "../types/Keys";

interface User {
  id: number;
  username: string;
  role: string;
}

const ConfirmationModal: React.FC<{
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ message, onConfirm, onCancel }) => (
  <div className="user-mgmt-modal-backdrop">
    <div className="user-mgmt-modal">
      <p>{message}</p>
      <div className="user-mgmt-modal-actions">
        <button className="user-mgmt-btn confirm" onClick={onConfirm}>
          تأكيد
        </button>
        <button className="user-mgmt-btn cancel" onClick={onCancel}>
          إلغاء
        </button>
      </div>
    </div>
  </div>
);

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editRole, setEditRole] = useState("");
  const [modal, setModal] = useState<{
    type: "delete" | "edit" | null;
    user: User | null;
  }>({ type: null, user: null });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await window.electron.getAllUsers();
        setUsers(users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (userId: number) => {
    setModal({
      type: "delete",
      user: users.find((u) => u.id === userId) || null,
    });
  };
  console.log("====================================");
  console.log(editRole);
  console.log("====================================");
  const confirmDelete = async () => {
    if (!modal.user) return;
    try {
      const result = await window.electron.deleteUser(modal.user.id);
      if (result.deleted) {
        setUsers((prev) => prev.filter((u) => u.id !== modal.user!.id));
      }
    } catch (error) {
      console.error("Deletion failed:", error);
    }
    setModal({ type: null, user: null });
  };

  const handleEdit = (user: User) => {
    setModal({ type: "edit", user });
  };

  const confirmEdit = () => {
    if (!modal.user) return;
    setEditUserId(modal.user.id);
    setEditUsername(modal.user.username);
    setEditRole(modal.user.role);
    setModal({ type: null, user: null });
  };

  const handleUpdate = async (userId: number) => {
    try {
      await window.electron.updateUser(userId, {
        username: editUsername,
        role: editRole,
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, username: editUsername, role: editRole } : u
        )
      );
      setEditUserId(null);
    } catch (error) {
      alert("فشل تحديث المستخدم. يرجى المحاولة مرة أخرى." + error);
      console.error("Update failed:", error);
    }
  };

  return (
    <div className="user-mgmt-container">
      <h2 className="user-mgmt-title">إدارة المستخدمين</h2>
      <table className="user-mgmt-table">
        <thead>
          <tr>
            <th>المعرف</th>
            <th>اسم المستخدم</th>
            <th>الدور</th>
            <th>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {users && users.length > 0 ? (
            users.map((user) =>
              editUserId === user.id ? (
                <tr key={user.id} className="user-mgmt-edit-row">
                  <td>{user.id}</td>
                  <td>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="user-mgmt-input"
                    />
                  </td>
                  <td>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="user-mgmt-select">
                      {ROLESARRAY.map(
                        (role: { key: string; label: string }) => (
                          <option key={role.key} value={role.key}>
                            {role.label}
                          </option>
                        )
                      )}
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => handleUpdate(user.id)}
                      className="user-mgmt-btn save">
                      حفظ
                    </button>
                    <button
                      onClick={() => setEditUserId(null)}
                      className="user-mgmt-btn cancel">
                      إلغاء
                    </button>
                  </td>
                </tr>
              ) : (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>
                    {ROLESARRAY.find((ra) => ra.key === user.role)?.label}
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(user)}
                      className="user-mgmt-btn edit">
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="user-mgmt-btn delete">
                      حذف
                    </button>
                  </td>
                </tr>
              )
            )
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: "center" }}>
                لا يوجد مستخدمين
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {modal.type === "delete" && modal.user && (
        <ConfirmationModal
          message={`هل أنت متأكد أنك تريد حذف المستخدم "${modal.user.username}"؟`}
          onConfirm={confirmDelete}
          onCancel={() => setModal({ type: null, user: null })}
        />
      )}
      {modal.type === "edit" && modal.user && (
        <ConfirmationModal
          message={`هل أنت متأكد أنك تريد تعديل المستخدم "${modal.user.username}"؟`}
          onConfirm={confirmEdit}
          onCancel={() => setModal({ type: null, user: null })}
        />
      )}
    </div>
  );
};

export default UserManagement;
