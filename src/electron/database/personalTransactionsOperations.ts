import { initializeDatabase } from "./userOperations.js"; // Import database initialization

//// Personal personaltransactions Functions ////

// Add a New Personal Transaction
export async function addPersonalTransaction(
  user_id: number,
  customer_id: number,
  amount: number,
  report: string,
  transactionType: "incoming" | "outgoing",
  date: string = new Date().toISOString()
): Promise<{ id: number }> {
  console.log("🔹 addPersonalTransaction() Triggered");

  const db = await initializeDatabase();

  // 🛑 Debug Log
  console.log(`Attempting to insert:
    user_id: ${user_id},
    recipient: ${customer_id},
    amount: ${amount},
    report: ${report},
    date: ${date},
    transactionType: ${transactionType}
  `);

  try {
    const customerAccount = await db.get(
      `SELECT debit FROM customersaccount WHERE id = ?`,
      [customer_id]
    );
    const result = await db.run(
      `INSERT INTO personaltransactions (user_id, customer_id, amount, report, type,transactionType, date,customer_debit) 
       VALUES (?, ?, ?, ?, 'personal',?, ?,?)`,
      [user_id, customer_id, amount, report, transactionType,date,transactionType==="outgoing"?customerAccount?.debit+amount:customerAccount?.credit+amount]
    );


 
  if(transactionType==="outgoing"){
      await db.run(
      `UPDATE customersaccount 
       SET debit = debit + ? 
       WHERE id = ?`,
      [amount, customer_id]
    );
  }else if(transactionType==="incoming"){
      await db.run(
      `UPDATE customersaccount 
       SET credit = credit + ? 
       WHERE id = ?`,
      [amount, customer_id]
    );
  }else{
    console.log("❌ Invalid transaction type");
    throw new Error("Invalid transaction type");
    
  }
    console.log("✅ Personal Transaction Added Successfully");
    // Fetch the current debit value of the customer
  
    return { id: result.lastID! };
  } catch (error) {
    console.error("❌ SQLite Insert Error:", error);
    throw error;
  }
}

// Get All Personal personaltransactions
export async function getAllPersonalTransactions(): Promise<PersonalTransaction[]> {
  const db = await initializeDatabase();

  try {
    const res = await db.all(` SELECT personaltransactions.*, 
         customersaccount.name AS customer_name, 
         customersaccount.accountNumber AS customer_accountNumber, 
         customersaccount.accountType AS customer_accountType, 
         customersaccount.phone AS customer_phone, 
         customersaccount.address AS customer_address,
         customersaccount.debit AS customer_debit,
         customersaccount.credit AS customer_credit
  FROM personaltransactions
  JOIN customersaccount ON personaltransactions.customer_id = customersaccount.id
  WHERE personaltransactions.type = 'personal' `);
    console.log("Fetched Personal Transactions:", res);
    return res;
  } catch (error) {
    console.error("❌ Error fetching personal transactions:", error);
    throw error;
  }

}

// Get Personal personaltransactions by User ID
export async function getPersonalTransactionsByUser(user_id: number): Promise<Transaction[]> {
  const db = await initializeDatabase();

  return await db.all(
    `SELECT * FROM personaltransactions WHERE user_id = ? AND type = 'personal'`,
    [user_id]
  );
}

// Delete a Personal Transaction
export async function deletePersonalTransaction(id: number): Promise<{ deleted: boolean }> {
  const db = await initializeDatabase();

  const result = await db.run(
    `DELETE FROM personaltransactions WHERE id = ? AND type = 'personal'`,
    [id]
  );

  return { deleted: result.changes! > 0 };
}

// Search Personal personaltransactions by Recipient or Report
export async function searchPersonalTransactions(query: string): Promise<Transaction[]> {
  const db = await initializeDatabase();

  return await db.all(
    `SELECT personaltransactions.*, users.username 
     FROM personaltransactions 
     JOIN users ON personaltransactions.user_id = users.id
     WHERE type = 'personal' AND (recipient LIKE ? OR report LIKE ?)`,
    [`%${query}%`, `%${query}%`]
  );
}

// Update an Existing Personal Transaction
export async function updatePersonalTransaction(
  id: number,
  field: string,
  value: string | number
): Promise<{ updated: boolean }> {
  console.log("🔄 updatePersonalTransaction() Triggered");

  const db = await initializeDatabase();

  // 🛑 Security Check: Prevent SQL Injection by allowing only specific fields
  const allowedFields = ["amount", "report", "date"];
  if (!allowedFields.includes(field)) {
    console.error(`❌ Invalid field: ${field}`);
    throw new Error("Invalid field");
  }

  try {
    // Fetch the existing transaction details
    const existingTransaction = await db.get(
      `SELECT amount, transactionType, customer_id FROM personaltransactions WHERE id = ? AND type = 'personal'`,
      [id]
    );

    if (!existingTransaction) {
      throw new Error(`Transaction with ID ${id} not found`);
    }

    const { amount: oldAmount, transactionType, customer_id } = existingTransaction;

    // Update the transaction
    const result = await db.run(
      `UPDATE personaltransactions SET ${field} = ? WHERE id = ? AND type = 'personal'`,
      [value, id]
    );

    // If the updated field is "amount", adjust the customer's account balance
    if (field === "amount") {
      const amountDifference = Number(value) - Number(oldAmount);

      if (transactionType === "outgoing") {
        // Update the customer's debit
        await db.run(
          `UPDATE customersaccount SET debit = debit + ? WHERE id = ?`,
          [amountDifference, customer_id]
        );
      } else if (transactionType === "incoming") {
        // Update the customer's credit
        await db.run(
          `UPDATE customersaccount SET credit = credit + ? WHERE id = ?`,
          [amountDifference, customer_id]
        );
      }
    }

    console.log(`✅ Personal Transaction ID ${id} updated:`, field, "=", value);
    return { updated: result.changes! > 0 };
  } catch (error) {
    console.error("❌ SQLite Update Error:", error);
    throw error;
  }
}

// Get Personal personaltransactions by Date Range
export async function getPersonalTransactionsByDateRange(
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  const db = await initializeDatabase();

  return await db.all(
    `SELECT personaltransactions.*, users.username 
     FROM personaltransactions 
     JOIN users ON personaltransactions.user_id = users.id
     WHERE type = 'personal' AND date BETWEEN ? AND ?`,
    [startDate, endDate]
  );
}


export async function getPersonalTransactionById(id: number): Promise<PersonalTransaction | null> {
  const db = await initializeDatabase();
  const transaction = await db.get(
    `SELECT personaltransactions.*, 
         customersaccount.name AS customer_name, 
         customersaccount.accountNumber AS customer_accountNumber, 
         customersaccount.accountType AS customer_accountType, 
         customersaccount.phone AS customer_phone, 
         customersaccount.address AS customer_address,
          customersaccount.debit AS customer_debit,
          customersaccount.credit AS customer_credit
  FROM personaltransactions
  JOIN customersaccount ON personaltransactions.customer_id = customersaccount.id
  WHERE personaltransactions.type = 'personal' AND personaltransactions.id = ?`,
    [id]
  );
  if (!transaction) {
    console.error(`❌ Transaction with ID ${id} not found`);
    return null;
  }
  return transaction;
}



//// personaltransactions Functions ////

// // Add a New Transaction
// export async function addTransaction(
//   user_id: number,
//   name: string,
//   credit: number,
//  details:string,
// ): Promise<{ id: number }> {
//   console.log("🔹 addTransaction() Triggered");

//   const db = await initializeDatabase();

//   // 🛑 Debug Log
//   console.log(`Attempting to insert:
//     user_id: ${user_id},
//     name : ${name},
//     credit: ${credit},
//     details: ${details},
    
//   `);

//   try {
//     const result = await db.run(
//       "INSERT INTO personalTransactions (user_id  ) VALUES (?)",
//       [user_id]
//     );

//     console.log("✅ Transaction Added Successfully");
//     return { id: result.lastID! };
//   } catch (error) {
//     console.error("❌ SQLite Insert Error:", error);
//     throw error;
//   }
// }

// // Get All personaltransactions
// export async function getAllTransactions(): Promise<Transaction[]> {
//   const db = await initializeDatabase();
//   return await db.all(`
//     SELECT personaltransactions.*, users.username 
//     FROM personaltransactions 
//     JOIN users ON personaltransactions.user_id = users.id
//   `);
// }

// // Get personaltransactions by User ID
// export async function getTransactionsByUser(user_id: number): Promise<Transaction[]> {
//   const db = await initializeDatabase();
//   return await db.all("SELECT * FROM personaltransactions WHERE user_id = ?", [user_id]);
// }

// // Delete a Transaction
// export async function deleteTransaction(id: number): Promise<{ deleted: boolean }> {
//   const db = await initializeDatabase();
//   const result = await db.run("DELETE FROM personaltransactions WHERE id = ?", [id]);
//   return { deleted: result.changes! > 0 };
// }

// // Search personaltransactions by Recipient or Transaction ID


// export async function searchTransactions(query: string): Promise<Transaction[]> {
//   const db = await initializeDatabase();
//   return await db.all(
//     `SELECT personaltransactions.*, users.username 
//      FROM personaltransactions 
//      JOIN users ON personaltransactions.user_id = users.id
//      WHERE recipient LIKE ? OR transactionId = ?`,
//     [`%${query}%`, query]
//   );
// }



// // Update an Existing Transaction

// export async function updateTransaction(id: number, field: string, value: string|number): Promise<{ updated: boolean }> {
//   console.log("🔄 updateTransaction() Triggered");

//   const db = await initializeDatabase();

//   // 🛑 Security Check: Prevent SQL Injection by allowing only specific fields
//   const allowedFields = ["recipient", "amount", "report", "transactionId","date"];
//   if (!allowedFields.includes(field)) {
//     console.error(`❌ Invalid field: ${field}`);
//     throw new Error("Invalid field");
//   }

//   try {
//     const result = await db.run(`UPDATE personaltransactions SET ${field} = ? WHERE id = ?`, [value, id]);

//     console.log(`✅ Transaction ID ${id} updated:`, field, "=", value);
//     return { updated: result.changes! > 0 };
//   } catch (error) {
//     console.error("❌ SQLite Update Error:", error);
//     throw error;
//   }
// }

