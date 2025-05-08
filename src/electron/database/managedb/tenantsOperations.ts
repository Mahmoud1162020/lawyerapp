import { ipcMain } from "electron";
import { initializeDatabase } from "../userOperations.js"; // Import the database initialization
import { ErrorFn } from "./ErrorHandlerOperations.js";

// Add a New Tenant
export async function addTenant(
  contractStatus: string,
  startDate: string,
  tenantIds: number[], // Array of customer IDs
  propertyId: number, // Foreign key to realstates table
  endDate: string,
  entitlement: number,
  contractNumber: string,
  installmentCount: number,
  leasedUsage: string,
  propertyType: string
): Promise<{ id: number }> {
  console.log("🔹 addTenant() Triggered=====",propertyId);

  const db = await initializeDatabase();

  try {
    // Insert into the tenants table
    const result = await db.run(
      `INSERT INTO tenants (
        contractStatus, startDate, propertyId, endDate, entitlement,
        contractNumber, installmentCount, leasedUsage, propertyType
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        contractStatus,
        startDate,
        propertyId,
        endDate,
        entitlement,
        contractNumber,
        installmentCount,
        leasedUsage,
        propertyType,
      ]
    );

    const tenantId = result.lastID!;

    // Validate tenantIds before iterating
    if (!Array.isArray(tenantIds)) {
      throw new TypeError("tenantIds must be an array");
    }

    // Insert tenant IDs into the tenant_names table
    for (const customerId of tenantIds) {
      await db.run(
        `INSERT INTO tenant_names (tenant_id, customer_id) 
         VALUES (?, ?)`,
        [tenantId, customerId]
      );
    }

    console.log("✅ Tenant added successfully with associated customer IDs.");
    return { id: tenantId };
  } catch (error) {
    console.error("❌ SQLite Insert Error:", error);
  ipcMain.emit("error",error)

    throw error;
  }
}

// Get All Tenants
export async function getAllTenants(): Promise<{
  id: number;
  contractStatus: string;
  startDate: string;
  tenantNames: string[]; // Array of tenant names
  propertyNumber: number;
  endDate: string;
  entitlement: number;
  contractNumber: string;
  installmentCount: number;
  leasedUsage: string;
  propertyType: string;
  propertyDetails: { id: number; propertyTitle: string; address: string } | null;
}[]> {
  const db = await initializeDatabase();
  // ErrorFn("this is a test error===="); // Test error handling

  // Fetch all tenants
  const tenants = await db.all(`
    SELECT * FROM tenants
  `);

  // Fetch tenant names and property details for each tenant
  for (const tenant of tenants) {
    const tenantNamesDb = await db.all(
      `
      SELECT customer_id 
      FROM tenant_names 
      WHERE tenant_id = ? 
    `,
      [tenant.id]
    );
    // Fetch customer names based on customer IDs
    const customerIds = tenantNamesDb.map((row) => row.customer_id);
    const tenantNamesQuery = `
      SELECT name
      FROM customersaccount
      WHERE id IN (${customerIds.join(",")})
    `;
    const tenantNamesResult = await db.all(tenantNamesQuery);
    // Map the results to get the names
    tenant.tenantNames = tenantNamesResult.map((row) => row.name);


    const propertyDetails = await db.get(
      `
      SELECT *
      FROM realstates 
      WHERE id = ?
    `,
      [tenant.propertyId]
    );

    tenant.propertyDetails = propertyDetails || null;
  }

  return tenants;
}

// Get Tenant by ID
export async function getTenantById(
  id: number
): Promise<{
  id: number;
  contractStatus: string;
  startDate: string;
  tenantNames: string[]; // Array of tenant names
  propertyNumber: number
  endDate: string;
  entitlement: number;
  contractNumber: string;
  installmentCount: number;
  leasedUsage: string;
  propertyType: string;
  propertyDetails: { id: number; propertyTitle: string; address: string } | null;
} | null> {
  const db = await initializeDatabase();

  // Fetch the tenant
  const tenant = await db.get(`
    SELECT * FROM tenants WHERE id = ?
  `, [id]);

  if (!tenant) return null;

  // Fetch tenant names
  const tenantNamesDb = await db.all(
    `
    SELECT customer_id 
    FROM tenant_names 
    WHERE tenant_id = ?
  `,
    [id]
  );

  const customerIds = tenantNamesDb.map((row) => row.customer_id);
  const tenantNamesQuery = `
    SELECT name,id
    FROM customersaccount
    WHERE id IN (${customerIds.join(",")})
  `;
  const tenantNamesResult = await db.all(tenantNamesQuery);
  // Map the results to get the names
  tenant.tenantNames = tenantNamesResult.map((row) => row);

console.log("tenant.tenantNames",tenant.tenantNames);
  // Fetch the property details
  const propertyDetails = await db.get(
    `
    SELECT id, propertyTitle, address 
    FROM realstates 
    WHERE id = ?
  `,
    [tenant.propertyId]
  );

  tenant.propertyDetails = propertyDetails || null;

  return tenant;
}

// Delete a Tenant
export async function deleteTenant(id: number): Promise<{ deleted: boolean }> {
  const db = await initializeDatabase();

  try {
    // Delete from the tenant_names table
    await db.run(`DELETE FROM tenant_names WHERE tenant_id = ?`, [id]);

    // Delete from the tenants table
    const result = await db.run(`DELETE FROM tenants WHERE id = ?`, [id]);

    console.log(`✅ Tenant ID ${id} deleted`);
    return { deleted: result.changes! > 0 };
  } catch (error) {
    console.error("❌ SQLite Delete Error:", error);
    throw error;
  }
}

// Update an Existing Tenant
export async function updateTenant(
  id: number,
  field: string,
  value: string | number
): Promise<{ updated: boolean }> {
  console.log("🔄 updateTenant() Triggered");

  const db = await initializeDatabase();

  // 🛑 Security Check: Prevent SQL Injection by allowing only specific fields
  const allowedFields = [
    "contractStatus",
    "startDate",
    "propertyId",
    "endDate",
    "entitlement",
    "contractNumber",
    "installmentCount",
    "leasedUsage",
    "propertyType",
  ];
  if (!allowedFields.includes(field)) {
    console.error(`❌ Invalid field: ${field}`);
    throw new Error("Invalid field");
  }

  try {
    const result = await db.run(
      `UPDATE tenants SET ${field} = ? WHERE id = ?`,
      [value, id]
    );

    console.log(`✅ Tenant ID ${id} updated:`, field, "=", value);
    return { updated: result.changes! > 0 };
  } catch (error) {
    console.error("❌ SQLite Update Error:", error);
    throw error;
  }
}

// Update Tenant Names
export async function updateTenantNames(
  tenantId: number,
  tenantIds: number[] // Array of customer account IDs
): Promise<{ updated: boolean }> {
  const db = await initializeDatabase();

  try {
    // Delete existing tenant IDs for the tenant
    await db.run(`DELETE FROM tenant_names WHERE tenant_id = ?`, [tenantId]);

    // Insert new tenant IDs into the tenant_names table
    for (const customerId of tenantIds) {
      await db.run(
        `INSERT INTO tenant_names (tenant_id, customer_id) 
         VALUES (?, ?)`,
        [tenantId, customerId]
      );
    }

    console.log(`✅ Updated tenant IDs for Tenant ID ${tenantId}`);
    return { updated: true };
  } catch (error) {
    console.error("❌ SQLite Update Tenant IDs Error:", error);
    throw error;
  }
}