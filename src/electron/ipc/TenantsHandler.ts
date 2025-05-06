import { ipcMain, BrowserWindow } from "electron";
import {
  addTenant,
  getAllTenants,
  getTenantById,
  deleteTenant,
  updateTenant,
  updateTenantNames,
} from "../database/managedb/tenantsOperations.js";

export function registerTenantsIpcHandlers(mainWindow: BrowserWindow): void {
  // Add a new tenant
  ipcMain.handle("add-tenant", async (_event, tenantData) => {
    console.log("tenantData=====", tenantData);
    
    const tenant = await addTenant(
      tenantData.contractStatus,
      tenantData.startDate,
      tenantData.tenantIds,
      tenantData.propertyId, // Foreign key to realstates table
      tenantData.endDate,
      tenantData.entitlement,
      tenantData.contractNumber,
      tenantData.installmentCount,
      tenantData.leasedUsage,
      tenantData.propertyType
    );
    mainWindow.webContents.send("tenant-added", tenant);
    return tenant;
  });

  // Get all tenants
  ipcMain.handle("get-all-tenants", async () => {
    return await getAllTenants();
  });

  // Get a tenant by ID
  ipcMain.handle("get-tenant-by-id", async (_event, tenantId: number) => {
    return await getTenantById(tenantId);
  });

  // Delete a tenant
  ipcMain.handle("delete-tenant", async (_event, tenantId: number) => {
    const result = await deleteTenant(tenantId);
    if (result.deleted) {
      mainWindow.webContents.send("tenant-deleted", tenantId);
    }
    return result;
  });

  // Update a tenant
  ipcMain.handle("update-tenant", async (_event, id: number, field: string, value: string | number) => {
    try {
      const result = await updateTenant(id, field, value);
      return result; // Returns { updated: boolean }
    } catch (error) {
      console.error("❌ Failed to update tenant:", error);
      throw error; // Ensure the frontend gets an error response
    }
  });
}

ipcMain.handle("update-tenant-names", async (_event, tenantId: number, tenantNames: number[]) => {
  try {
    const result = await updateTenantNames(tenantId, tenantNames);
    return result; // Returns { updated: boolean }
  } catch (error) {
    console.error("❌ Failed to update tenant:", error);
    throw error; // Ensure the frontend gets an error response
  }
});
