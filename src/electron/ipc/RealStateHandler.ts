import { ipcMain, BrowserWindow } from "electron";
import {
  addRealState,
  getAllRealStates,
  getRealStateById,
  deleteRealState,
  updateRealState,
  updateRealStateOwners,
} from "../database/managedb/realStateOperations.js";

export function registerRealStateIpcHandlers(mainWindow: BrowserWindow): void {
  // Add a new real state
  ipcMain.handle("add-real-state", async (_event, realStateData) => {
    const realState = await addRealState(
      realStateData.propertyTitle,
      realStateData.propertyNumber,
      realStateData.address,
      realStateData.price,
      realStateData.details,
      realStateData.owners // Array of owner IDs
    );
    mainWindow.webContents.send("real-state-added", realState);
    return realState;
  });

  // Get all real states
  ipcMain.handle("get-all-real-states", async () => {
    return await getAllRealStates();
  });

  // Get a real state by ID
  ipcMain.handle("get-real-state-by-id", async (_event, realStateId: number) => {
    return await getRealStateById(realStateId);
  });

  // Delete a real state
  ipcMain.handle("delete-real-state", async (_event, realStateId: number) => {
    const result = await deleteRealState(realStateId);
    if (result.deleted) {
      mainWindow.webContents.send("real-state-deleted", realStateId);
    }
    return result;
  });

  // Update a real state
  ipcMain.handle("update-real-state", async (_event, id: number, field: string, value: string | number) => {
    try {
      const result = await updateRealState(id, field, value);
      return result; // Returns { updated: boolean }
    } catch (error) {
      console.error("❌ Failed to update real state:", error);
      throw error; // Ensure the frontend gets an error response
    }
  });

  // Update owners for a real state
  ipcMain.handle("update-real-state-owners", async (_event, realStateId: number, owners: number[]) => {
    try {
      const result = await updateRealStateOwners(realStateId, owners);
      return result; // Returns { updated: boolean }
    } catch (error) {
      console.error("❌ Failed to update real state owners:", error);
      throw error; // Ensure the frontend gets an error response
    }
  });
}