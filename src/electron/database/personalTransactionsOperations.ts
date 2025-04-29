import { initializeDatabase } from "./userOperations.js"; // Import from your updated file

//// Transactions Functions ////

// Add a New Transaction
export async function addTransaction(
  user_id: number,
  name: string,
  credit: number,
 details:string,
): Promise<{ id: number }> {
  console.log("🔹 addTransaction() Triggered");

  const db = await initializeDatabase();

  // 🛑 Debug Log
  console.log(`Attempting to insert:
    user_id: ${user_id},
    name : ${name},
    credit: ${credit},
    details: ${details},
    
  `);

  try {
    const result = await db.run(
      "INSERT INTO personalTransactions (user_id  ) VALUES (?)",
      [user_id]
    );

    console.log("✅ Transaction Added Successfully");
    return { id: result.lastID! };
  } catch (error) {
    console.error("❌ SQLite Insert Error:", error);
    throw error;
  }
}

// Get All Transactions
export async function getAllTransactions(): Promise<Transaction[]> {
  const db = await initializeDatabase();
  return await db.all(`
    SELECT transactions.*, users.username 
    FROM transactions 
    JOIN users ON transactions.user_id = users.id
  `);
}

// Get Transactions by User ID
export async function getTransactionsByUser(user_id: number): Promise<Transaction[]> {
  const db = await initializeDatabase();
  return await db.all("SELECT * FROM transactions WHERE user_id = ?", [user_id]);
}

// Delete a Transaction
export async function deleteTransaction(id: number): Promise<{ deleted: boolean }> {
  const db = await initializeDatabase();
  const result = await db.run("DELETE FROM transactions WHERE id = ?", [id]);
  return { deleted: result.changes! > 0 };
}

// Search Transactions by Recipient or Transaction ID


export async function searchTransactions(query: string): Promise<Transaction[]> {
  const db = await initializeDatabase();
  return await db.all(
    `SELECT transactions.*, users.username 
     FROM transactions 
     JOIN users ON transactions.user_id = users.id
     WHERE recipient LIKE ? OR transactionId = ?`,
    [`%${query}%`, query]
  );
}



// Update an Existing Transaction

export async function updateTransaction(id: number, field: string, value: string|number): Promise<{ updated: boolean }> {
  console.log("🔄 updateTransaction() Triggered");

  const db = await initializeDatabase();

  // 🛑 Security Check: Prevent SQL Injection by allowing only specific fields
  const allowedFields = ["recipient", "amount", "report", "transactionId","date"];
  if (!allowedFields.includes(field)) {
    console.error(`❌ Invalid field: ${field}`);
    throw new Error("Invalid field");
  }

  try {
    const result = await db.run(`UPDATE transactions SET ${field} = ? WHERE id = ?`, [value, id]);

    console.log(`✅ Transaction ID ${id} updated:`, field, "=", value);
    return { updated: result.changes! > 0 };
  } catch (error) {
    console.error("❌ SQLite Update Error:", error);
    throw error;
  }
}

