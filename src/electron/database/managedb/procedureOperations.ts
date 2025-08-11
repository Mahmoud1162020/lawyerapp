import { initializeDatabase } from "../userOperations.js"; // Import the database initialization

// Add a New Procedure
export async function addProcedure(
  procedureNumber: string,
  procedureName: string,
  description: string,
  date: string,
  status: string,
  phone: string,
  owners: number[] // Array of customer IDs representing the owners/customers
): Promise<{ id: number }> {
  console.log("🔹 addProcedure() Triggered");

  const db = await initializeDatabase();

  try {
    // Insert into the procedures table
    const result = await db.run(
      `INSERT INTO procedures (procedureNumber, procedureName, description, date, status, phone) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [procedureNumber, procedureName, description, date, status, phone]
    );

    const procedureId = result.lastID!;

    // Insert into the procedure_owners table
    for (const ownerId of owners) {
      await db.run(
        `INSERT INTO procedure_owners (procedure_id, customer_id) 
         VALUES (?, ?)`,
        [procedureId, ownerId]
      );
    }

    console.log("✅ Procedure Added Successfully with Owners");
    return { id: procedureId };
  } catch (error) {
    console.error("❌ SQLite Insert Error:", error);
    throw error;
  }
}

// Get All Procedures
export async function getAllProcedures(): Promise<{
  id: number;
  procedureNumber: string;
  procedureName: string;
  description: string;
  date: string;
  status: string;
  phone: string;
  owners: { id: number; name: string }[];
}[]> {
  const db = await initializeDatabase();

  // Fetch all procedures
  const procedures = await db.all(`
    SELECT * FROM procedures
  `);

  // Fetch owners for each procedure
  for (const procedure of procedures) {
    const owners = await db.all(
      `
      SELECT c.id, c.name 
      FROM procedure_owners po
      JOIN customersaccount c ON po.customer_id = c.id
      WHERE po.procedure_id = ?
    `,
      [procedure.id]
    );

    procedure.owners = owners;
  }

  return procedures;
}

// Get Procedure by ID
export async function getProcedureById(
  id: number
): Promise<{
  id: number;
  procedureNumber: string;
  procedureName: string;
  description: string;
  date: string;
  status: string;
  phone: string;
  owners: { id: number; name: string }[];
} | null> {
  const db = await initializeDatabase();

  // Fetch the procedure
  const procedure = await db.get(`
    SELECT * FROM procedures WHERE id = ?
  `, [id]);

  if (!procedure) return null;

  // Fetch the owners
  const owners = await db.all(
    `
    SELECT c.id, c.name 
    FROM procedure_owners po
    JOIN customersaccount c ON po.customer_id = c.id
    WHERE po.procedure_id = ?
  `,
    [id]
  );

  procedure.owners = owners;

  return procedure;
}

// Delete a Procedure
export async function deleteProcedure(id: number): Promise<{ deleted: boolean }> {
  const db = await initializeDatabase();

  try {
    // Delete from the procedure_owners table
    await db.run(`DELETE FROM procedure_owners WHERE procedure_id = ?`, [id]);

    // Delete from the procedures table
    const result = await db.run(`DELETE FROM procedures WHERE id = ?`, [id]);

    console.log(`✅ Procedure ID ${id} deleted`);
    return { deleted: result.changes! > 0 };
  } catch (error) {
    console.error("❌ SQLite Delete Error:", error);
    throw error;
  }
}

// Update an Existing Procedure
export async function updateProcedure(
  id: number,
  field: string,
  value: string | number
): Promise<{ updated: boolean }> {
  console.log("🔄 updateProcedure() Triggered");

  const db = await initializeDatabase();

  // 🛑 Security Check: Prevent SQL Injection by allowing only specific fields
  const allowedFields = ["procedureNumber", "procedureName", "description", "date", "status", "phone"];
  if (!allowedFields.includes(field)) {
    console.error(`❌ Invalid field: ${field}`);
    throw new Error("Invalid field");
  }

  try {
    const result = await db.run(
      `UPDATE procedures SET ${field} = ? WHERE id = ?`,
      [value, id]
    );

    console.log(`✅ Procedure ID ${id} updated:`, field, "=", value);
    return { updated: result.changes! > 0 };
  } catch (error) {
    console.error("❌ SQLite Update Error:", error);
    throw error;
  }
}

// Update Owners for a Procedure
export async function updateProcedureOwners(
  procedureId: number,
  updatedOwners: number[]
): Promise<{ updated: boolean }> {
  const db = await initializeDatabase();

  try {
    // Validate the updatedOwners array
    if (!Array.isArray(updatedOwners)) {
      throw new Error("Invalid owners array");
    }

    const validOwners = updatedOwners.filter(
      (ownerId) => ownerId !== null && ownerId !== undefined && !isNaN(ownerId)
    );

    if (validOwners.length === 0) {
      console.log(`⚠️ No valid owners provided for Procedure ID ${procedureId}`);
      return { updated: false };
    }

    // Delete existing owners
    await db.run(`DELETE FROM procedure_owners WHERE procedure_id = ?`, [procedureId]);

    // Add new owners
    for (const ownerId of validOwners) {
      await db.run(
        `INSERT INTO procedure_owners (procedure_id, customer_id) 
         VALUES (?, ?)`,
        [procedureId, ownerId]
      );
    }

    console.log(`✅ Updated owners for Procedure ID ${procedureId}:`, validOwners);
    return { updated: true };
  } catch (error) {
    console.error("❌ SQLite Update Owners Error:", error);
    throw error;
  }
}