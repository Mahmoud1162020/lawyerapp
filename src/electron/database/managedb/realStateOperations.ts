import { initializeDatabase } from "../userOperations.js"; // Import the database initialization

// Add a New RealState
export async function addRealState(
  propertyTitle: string,
  propertyNumber: string,
  address: string,
  price: number,
  details: string,
  owners: number[] // Array of customer IDs representing the owners
): Promise<{ id: number }> {
  console.log("🔹 addRealState() Triggered");

  const db = await initializeDatabase();

  try {
    // Insert into the realstates table
    const result = await db.run(
      `INSERT INTO realstates (propertyTitle, propertyNumber, address, price, details) 
       VALUES (?, ?, ?, ?, ?)`,
      [propertyTitle, propertyNumber, address, price, details]
    );

    const realStateId = result.lastID!;

    // Insert into the realstate_owners table
    for (const ownerId of owners) {
      await db.run(
        `INSERT INTO realstate_owners (realstate_id, customer_id) 
         VALUES (?, ?)`,
        [realStateId, ownerId]
      );
    }

    console.log("✅ RealState Added Successfully with Owners");
    return { id: realStateId };
  } catch (error) {
    console.error("❌ SQLite Insert Error:", error);
    throw error;
  }
}

// Get All RealStates
export async function getAllRealStates(): Promise<{
  id: number;
  propertyTitle: string;
  propertyNumber: string;
  address: string;
  price: number;
  date: string;
  details: string | null;
  owners: { id: number; name: string }[];
}[]> {
  const db = await initializeDatabase();

  // Fetch all realstates
  const realStates = await db.all(`
    SELECT * FROM realstates
  `);
  console.log("======",realStates);
  // Fetch owners for each realstate
  for (const realState of realStates) {
    const owners = await db.all(
      `
      SELECT c.id, c.name 
      FROM realstate_owners ro
      JOIN customersaccount c ON ro.customer_id = c.id
      WHERE ro.realstate_id = ?
    `,
      [realState.id]
    );
    
  console.log("======>>>>>",owners);
    
    realState.owners = owners;
  }

  return realStates;
}

// Get RealState by ID
export async function getRealStateById(
  id: number
): Promise<{
  id: number;
  propertyTitle: string;
  propertyNumber: string;
  address: string;
  price: number;
  date: string;
  details: string | null;
  owners: { id: number; name: string }[];
} | null> {
  const db = await initializeDatabase();

  // Fetch the realstate
  const realState = await db.get(`
    SELECT * FROM realstates WHERE id = ?
  `, [id]);
  console.log("RealState with Owners:", realState);


  if (!realState) return null;

  // Fetch the owners
  const owners = await db.all(
    `
    SELECT c.id, c.name 
    FROM realstate_owners ro
    JOIN customersaccount c ON ro.customer_id = c.id
    WHERE ro.realstate_id = ?
  `,
    [id]
  );
  realState.owners = owners;
  

  return realState;
}

// Delete a RealState
export async function deleteRealState(id: number): Promise<{ deleted: boolean }> {
  const db = await initializeDatabase();

  try {
    // Delete from the realstate_owners table
    await db.run(`DELETE FROM realstate_owners WHERE realstate_id = ?`, [id]);

    // Delete from the realstates table
    const result = await db.run(`DELETE FROM realstates WHERE id = ?`, [id]);

    console.log(`✅ RealState ID ${id} deleted`);
    return { deleted: result.changes! > 0 };
  } catch (error) {
    console.error("❌ SQLite Delete Error:", error);
    throw error;
  }
}

// Update an Existing RealState
export async function updateRealState(
  id: number,
  field: string,
  value: string | number
): Promise<{ updated: boolean }> {
  console.log("🔄 updateRealState() Triggered");

  const db = await initializeDatabase();

  // 🛑 Security Check: Prevent SQL Injection by allowing only specific fields
  const allowedFields = ["propertyTitle", "propertyNumber", "address", "price", "details", "date"];
  if (!allowedFields.includes(field)) {
    console.error(`❌ Invalid field: ${field}`);
    throw new Error("Invalid field");
  }

  try {
    const result = await db.run(
      `UPDATE realstates SET ${field} = ? WHERE id = ?`,
      [value, id]
    );

    console.log(`✅ RealState ID ${id} updated:`, field, "=", value);
    return { updated: result.changes! > 0 };
  } catch (error) {
    console.error("❌ SQLite Update Error:", error);
    throw error;
  }
}

// Update Owners for a RealState
export async function updateRealStateOwners(
  realStateId: number,
  updatedOwners: number[]
): Promise<{ updated: boolean }> {
  const db = await initializeDatabase();
console.log("🔄 updateRealStateOwners() updatedOwnersupdatedOwnersTriggered",updatedOwners);

  try {
    // Validate the updatedOwners array
    if (!Array.isArray(updatedOwners)) {
      throw new Error("Invalid owners array");
    }

    const validOwners = updatedOwners
    if (validOwners.length === 0) {
      console.log(`⚠️ No valid owners provided for RealState ID ${realStateId}`);
      return { updated: false };
    }

    //delete existing owners
   

   
    
    // Add new owners
    if (validOwners.length > 0) {
      await db.run(
        `DELETE FROM realstate_owners WHERE realstate_id = ?`,
        [realStateId]
      );
      console.log(`✅ Deleted existing owners for RealState ID ${realStateId}`);
      for (const ownerId of validOwners) {
        await db.run(
          `INSERT INTO realstate_owners (realstate_id, customer_id) 
           VALUES (?, ?)`,
          [realStateId, ownerId]
        );
      }
      console.log(`✅ Added new owners for RealState ID ${realStateId}:`, validOwners);
    } else {
      console.log(`⚠️ No new owners to add for RealState ID ${realStateId}`);
    }

    return { updated: validOwners.length > 0 };
  } catch (error) {
    console.error("❌ SQLite Update Owners Error:", error);
    throw error;
  }
}