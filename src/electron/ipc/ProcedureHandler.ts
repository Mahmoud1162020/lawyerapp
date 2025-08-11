import { ipcMain, BrowserWindow } from "electron";
import {
  addProcedure,
  getAllProcedures,
  getProcedureById,
  deleteProcedure,
  updateProcedure,
  updateProcedureOwners,
} from "../database/managedb/procedureOperations.js";

export function registerProcedureIpcHandlers(mainWindow: BrowserWindow): void {
  // Add a new procedure
  ipcMain.handle("add-procedure", async (_event, procedureData) => {
    const procedure = await addProcedure(
      procedureData.procedureNumber,
      procedureData.procedureName,
      procedureData.description,
      procedureData.date,
      procedureData.status,
      procedureData.phone,
      procedureData.owners // Array of owner IDs
    );
    mainWindow.webContents.send("procedure-added", procedure);
    return procedure;
  });

  // Get all procedures
  ipcMain.handle("get-all-procedures", async () => {
    return await getAllProcedures();
  });

  // Get a procedure by ID
  ipcMain.handle("get-procedure-by-id", async (_event, procedureId: number) => {
    return await getProcedureById(procedureId);
  });

  // Delete a procedure
  ipcMain.handle("delete-procedure", async (_event, procedureId: number) => {
    const result = await deleteProcedure(procedureId);
    if (result.deleted) {
      mainWindow.webContents.send("procedure-deleted", procedureId);
    }
    return result;
  });

  // Update a procedure
  ipcMain.handle("update-procedure", async (_event, id: number, field: string, value: string | number) => {
    try {
      const result = await updateProcedure(id, field, value);
      return result; // Returns { updated: boolean }
    } catch (error) {
      console.error("❌ Failed to update procedure:", error);
      throw error; // Ensure the frontend gets an error response
    }
  });

  // Update owners for a procedure
  ipcMain.handle("update-procedure-owners", async (_event, procedureId: number, owners: number[]) => {
    try {
      const result = await updateProcedureOwners(procedureId, owners);
      return result; // Returns { updated: boolean }
    } catch (error) {
      console.error("❌ Failed to update procedure owners:", error);
      throw error; // Ensure the frontend gets an error response
    }
  });
}