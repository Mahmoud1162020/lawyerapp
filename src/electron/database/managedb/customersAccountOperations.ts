import { initializeDatabase } from "../userOperations.js"; // Import the database initialization

// Add a New CustomersAccount
export async function addCustomersAccount(
  name: string,
  accountNumber: string,
  accountType: string,
  phone: string,
  address: string,
  details: string,
): Promise<{ id: number }> {
  console.log("🔹 addCustomersAccount() Triggered");

  const db = await initializeDatabase();

  try {
    const result = await db.run(
      `INSERT INTO customersaccount (name,accountNumber, accountType, phone, address, details) 
       VALUES (?,?, ?, ?, ?, ?)`,
      [name,accountNumber, accountType, phone, address, details]
    );

    console.log("✅ CustomersAccount Added Successfully");
    return { id: result.lastID! };
  } catch (error) {
    console.error("❌ SQLite Insert Error:", error);
    throw error;
  }
}

// Get All CustomersAccounts
export async function getAllCustomersAccounts(): Promise<{ id: number; accountNumber: string; accountType: string; phone: string; address: string; date: string; details: string | null }[]> {
  const db = await initializeDatabase();
  return await db.all("SELECT * FROM customersaccount");
}

// Get CustomersAccount by ID
export async function getCustomersAccountById(id: number): Promise<{ id: number; name:string;accountNumber: string; accountType: string; phone: string; address: string; date: string; details: string | null } | null> {
  const db = await initializeDatabase();
  const result = await db.get("SELECT * FROM customersaccount WHERE id = ?", [id]);
  return result || null;
}

// Delete a CustomersAccount
export async function deleteCustomersAccount(id: number): Promise<{ deleted: boolean }> {
  const db = await initializeDatabase();
  const result = await db.run("DELETE FROM customersaccount WHERE id = ?", [id]);
  return { deleted: result.changes! > 0 };
}

// Update an Existing CustomersAccount
export async function updateCustomersAccount(
  id: number,
  field: string,
  value: string | number
): Promise<{ updated: boolean }> {
  console.log("🔄 updateCustomersAccount() Triggered");

  const db = await initializeDatabase();

  // 🛑 Security Check: Prevent SQL Injection by allowing only specific fields
  const allowedFields = ["name","accountNumber", "accountType", "phone", "address", "details", "date"];
  if (!allowedFields.includes(field)) {
    console.error(`❌ Invalid field: ${field}`);
    throw new Error("Invalid field");
  }

  try {
    const result = await db.run(`UPDATE customersaccount SET ${field} = ? WHERE id = ?`, [value, id]);

    console.log(`✅ CustomersAccount ID ${id} updated:`, field, "=", value);
    return { updated: result.changes! > 0 };
  } catch (error) {
    console.error("❌ SQLite Update Error:", error);
    throw error;
  }
}