import { initializeDatabase } from "../userOperations.js";

// Add a tenant transaction and update installmentsDue in tenants table
export async function addTenantTransaction(
  tenantId: number,
  propertyId: number,
  customerId: number,
  transaction: { amount: number; date: string; isPaid: boolean; description?: string ,isCredit?: boolean} // isCredit is optional
): Promise<void> {
  const db = await initializeDatabase();

  // Add the transaction to the tenantsTransactions table
  await db.run(
    `INSERT INTO tenantsTransactions (propertyId, tenantId, customerId, amount, date, isPaid, description)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      propertyId,
      tenantId,
      customerId,
      transaction.amount,
      transaction.date,
      transaction.isPaid ? 1 : 0,
      transaction.description || null,
    ]
  );

  console.log(`✅ Added transaction to tenantsTransactions table for tenant ID ${tenantId}`);

  // Update installmentsDue in tenants table
  const tenant = await db.get(`SELECT installmentsDue FROM tenants WHERE id = ?`, [tenantId]);
  if (!tenant) {
    throw new Error(`Tenant with ID ${tenantId} not found`);
  }

  const currentArray = JSON.parse(tenant.installmentsDue || "[]");
  const today = new Date(transaction.date).toISOString().split("T")[0];
  let updated = false;

  for (let i = 0; i < currentArray.length; i++) {
    if (!currentArray[i].isPaid && !currentArray[i].isCredit && currentArray[i].date <= today) {
      currentArray[i].isPaid = true;
      updated = true;
      break;
    }
  }

  if (updated) {
    await db.run(`UPDATE tenants SET installmentsDue = ? WHERE id = ?`, [JSON.stringify(currentArray), tenantId]);
    console.log(`✅ Updated installmentsDue for tenant ID ${tenantId}`);
  }

  // Update the realstate's rentamounts array for the given propertyId
  const realstate = await db.get(`SELECT rentamounts FROM realstates WHERE id = ?`, [propertyId]);
  if (!realstate) {
    throw new Error(`Realstate with ID ${propertyId} not found`);
  }

  const rentamountsArray = JSON.parse(realstate.rentamounts || "[]");
  console.log(`✅ Retrieved rentamounts array for realstate ID ${propertyId}`,rentamountsArray);
  
  rentamountsArray.push({
    amount: transaction.amount,
    date: transaction.date,
    isPaid: transaction.isPaid,
    description: transaction.description || null,
    isCredit: transaction.isCredit ? 1 : 0 // Store isCredit as 1 for true, 0 for false
  });
  // Calculate the total amount from rentamountsArray
  // interface RentAmountItem {
  //   amount: number;
  //   date: string;
  //   isPaid: boolean | number;
  //   description: string | null;
  //   isCredit: number;
  // }

  // const totalAmount: number = (rentamountsArray as RentAmountItem[]).reduce(
  //   (sum: number, item: RentAmountItem) => sum + (item.amount || 0),
  //   0
  // );
  const oldCredit = typeof realstate.credit === "number" ? realstate.credit : Number(realstate.credit) || 0;
  const newCredit = oldCredit +  transaction.amount;
  

  // Update the credit field in realstates table
  await db.run(
    `UPDATE realstates SET credit = ?, rentamounts = ? WHERE id = ?`,
    [newCredit, JSON.stringify(rentamountsArray), propertyId]
  );
  console.log(`✅ Updated credit in realstates table for property ID ${propertyId} to ${newCredit}`);

}

// Define a type for tenant transactions
export interface TenantTransaction {
  id: number;
  propertyId: number;
  tenantId: number;
  customerId: number;
  amount: number;
  date: string;
  isPaid: number;
  description: string | null;
}

// Get all transactions for a tenant
export async function getTenantTransactions(tenantId: number): Promise<TenantTransaction[]> {
  const db = await initializeDatabase();

  const transactions = await db.all<TenantTransaction[]>(`SELECT * FROM tenantsTransactions WHERE tenantId = ?`, [tenantId]);
  console.log(`✅ Retrieved transactions for tenant ID ${tenantId}`);
  return transactions;
}
// Define a type for the joined tenant transaction result
export interface TenantTransactionWithDetails {
  transactionId: number;
  amount: number;
  date: string;
  isPaid: number;
  description: string | null;
  propertyId: number | null;
  propertyTitle: string | null;
  propertyNumber: string | null;
  propertyAddress: string | null;
  propertyPrice: number | null;
  tenantId: number | null;
  contractStatus: string | null;
  tenantStartDate: string | null;
  tenantEndDate: string | null;
  tenantEntitlement: string | null;
  tenantContractNumber: string | null;
  tenantInstallmentCount: number | null;
  tenantLeasedUsage: string | null;
  tenantPropertyType: string | null;
  customerId: number | null;
  customerName: string | null;
  customerPhone: string | null;
  customerAddress: string | null;
}

export async function getAllTenantTsransactions(): Promise<TenantTransactionWithDetails[]> {
  const db = await initializeDatabase();

  const transactions = await db.all<TenantTransactionWithDetails[]>(
    `SELECT 
        tt.id AS transactionId,
        tt.amount,
        tt.date,
        tt.isPaid,
        tt.description,
        p.id AS propertyId,
        p.propertyTitle,
        p.propertyNumber,
        p.address AS propertyAddress,
        p.price AS propertyPrice,
        t.id AS tenantId,
        t.contractStatus,
        t.startDate AS tenantStartDate,
        t.endDate AS tenantEndDate,
        t.entitlement AS tenantEntitlement,
        t.contractNumber AS tenantContractNumber,
        t.installmentCount AS tenantInstallmentCount,
        t.leasedUsage AS tenantLeasedUsage,
        t.propertyType AS tenantPropertyType,
        c.id AS customerId,
        c.name AS customerName,
        c.phone AS customerPhone,
        c.address AS customerAddress
     FROM tenantsTransactions tt
     LEFT JOIN realstates p ON tt.propertyId = p.id
     LEFT JOIN tenants t ON tt.tenantId = t.id
     LEFT JOIN customersaccount c ON tt.customerId = c.id`
  );

  console.log(`✅ Retrieved all tenant transactions with related information`);
  return transactions;
}

// Update a tenant transaction
export async function updateTenantTransaction(
  transactionId: number,
  updatedTransaction: { amount: number; date: string; isPaid: boolean; description?: string }
): Promise<void> {


    console.log("updatedTransaction",updatedTransaction);
    
  const db = await initializeDatabase();
 
  await db.run(
    `UPDATE tenantsTransactions
     SET amount = ?, date = ?, isPaid = ?, description = ?
     WHERE id = ?`,
    [
      updatedTransaction.amount,
      updatedTransaction.date,
      updatedTransaction.isPaid ? 1 : 0,
      updatedTransaction.description || null,
      transactionId,
    ]
  );

  console.log(`✅ Updated transaction ID ${transactionId}`);
}

// Delete a tenant transaction
export async function deleteTenantTransaction(transactionId: number): Promise<void> {
  const db = await initializeDatabase();

  await db.run(`DELETE FROM tenantsTransactions WHERE id = ?`, [transactionId]);

  console.log(`✅ Deleted transaction ID ${transactionId}`);
}

export async function getTenatnTransactionById(transactionId: number): Promise<TenantTransactionDetailsProps | null> {
    const db = await initializeDatabase();

  const transaction = await db.get(
    `SELECT 
        tt.id AS transactionId,
        tt.amount,
        tt.date,
        tt.isPaid,
        tt.description,
        p.propertyTitle,
        p.propertyNumber,
        p.address AS propertyAddress,
        p.price AS propertyPrice,
        t.contractNumber AS tenantContractNumber,
        t.startDate AS tenantStartDate,
        t.endDate AS tenantEndDate,
        t.leasedUsage AS tenantLeasedUsage,
        c.name AS customerName
     FROM tenantsTransactions tt
     LEFT JOIN realstates p ON tt.propertyId = p.id
     LEFT JOIN tenants t ON tt.tenantId = t.id
     LEFT JOIN customersaccount c ON tt.customerId = c.id
     WHERE tt.id = ?`,
    [transactionId]
  );

  return transaction;
}