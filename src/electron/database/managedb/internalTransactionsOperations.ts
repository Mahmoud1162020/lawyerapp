import { initializeDatabase } from "../userOperations.js";



// Add a new internal transaction
export async function addInternalTransaction(tx: InternalTransaction): Promise<number> {
  const db = await initializeDatabase();
  console.log("Adding internal transaction:", tx);

  try {
    await db.run("BEGIN TRANSACTION");

    // التحقق من رصيد المرسل أولاً
    let senderCredit = 0;

    if (tx.fromType === "شخصي") {
      const fromInfo = await db.get(`SELECT credit FROM customersaccount WHERE id = ?`, [tx.fromId]);
      if (!fromInfo) throw new Error("المرسل غير موجود");
      senderCredit = fromInfo.credit;
    } else if (tx.fromType === "معاملة") {
      const fromInfo = await db.get(`SELECT credit FROM procedures WHERE id = ?`, [tx.fromId]);
      if (!fromInfo) throw new Error("المرسل (معاملة) غير موجود");
      senderCredit = fromInfo.credit;
    } else if (tx.fromType === "عقار") {
      const fromInfo = await db.get(`SELECT credit FROM realstates WHERE id = ?`, [tx.fromId]);
      if (!fromInfo) throw new Error("المرسل (عقار) غير موجود");
      senderCredit = fromInfo.credit;
    }

    if (senderCredit < tx.amount) {
      throw new Error("❌ الرصيد غير كافٍ لإجراء التحويل");
    }

    // تسجيل عملية التحويل
    const result = await db.run(
      `INSERT INTO internalTransactions (fromId, toId, amount, fromType, toType, date, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        tx.fromId,
        tx.toId,
        tx.amount,
        tx.fromType,
        tx.toType,
        tx.date || new Date().toISOString().slice(0, 19).replace("T", " "),
        tx.details || null,
      ]
    );

    // خصم من المرسل
    if (tx.fromType === "شخصي") {
      await db.run(`UPDATE customersaccount SET credit = credit - ? WHERE id = ?`, [tx.amount, tx.fromId]);
    } else if (tx.fromType === "معاملة") {
      await db.run(`UPDATE procedures SET credit = credit - ? WHERE id = ?`, [tx.amount, tx.fromId]);
    } else if (tx.fromType === "عقار") {
      await db.run(`UPDATE realstates SET credit = credit - ? WHERE id = ?`, [tx.amount, tx.fromId]);
    }

    // إضافة إلى المستلم
    if (tx.toType === "شخصي") {
      await db.run(`UPDATE customersaccount SET credit = credit + ? WHERE id = ?`, [tx.amount, tx.toId]);
    } else if (tx.toType === "معاملة") {
      await db.run(`UPDATE procedures SET credit = credit + ? WHERE id = ?`, [tx.amount, tx.toId]);
    } else if (tx.toType === "عقار") {
      await db.run(`UPDATE realstates SET credit = credit + ? WHERE id = ?`, [tx.amount, tx.toId]);
    }

    await db.run("COMMIT");
    console.log("✅ تمت العملية بنجاح");
    return result.lastID!;
  } catch (error) {
    console.error("❌ فشل في العملية:", error);
    await db.run("ROLLBACK");
    throw error;
  }
}


// Get all internal transactions
export async function getAllInternalTransactions(): Promise<InternalTransaction[]> {
  const db = await initializeDatabase();
  return db.all(`SELECT * FROM internalTransactions ORDER BY date DESC`);
}

// Get a single internal transaction by ID
export async function getInternalTransactionById(id: number): Promise<InternalTransaction | undefined> {
  const db = await initializeDatabase();
  return db.get(`SELECT * FROM internalTransactions WHERE id = ?`, [id]);
}

// Update an internal transaction
export async function updateInternalTransaction(id: number, tx: Partial<InternalTransaction>): Promise<void> {
  const db = await initializeDatabase();
  const existing = await db.get(`SELECT * FROM internalTransactions WHERE id = ?`, [id]);
  if (!existing) throw new Error("Transaction not found");

  // استرجاع القيم القديمة
  const oldAmount = existing.amount;
  const newAmount = tx.amount ?? oldAmount;
  const oldFromId = existing.fromId;
  const oldToId = existing.toId;
  const oldFromType = existing.fromType;
  const oldToType = existing.toType;
  const newFromId = tx.fromId ?? oldFromId;
  const newToId = tx.toId ?? oldToId;
  const newFromType = tx.fromType ?? oldFromType;
  const newToType = tx.toType ?? oldToType;

  await db.run("BEGIN TRANSACTION");
  try {
    // إعادة الرصيد القديم
    // أضف المبلغ القديم إلى المرسل القديم
    if (oldFromType === "شخصي") {
        console.log("Adding old amount to old sender (شخصي)", oldFromId, oldAmount);
        
        await db.run(`UPDATE customersaccount SET credit = credit + ? WHERE id = ?`, [oldAmount, oldFromId]);
    } else if (oldFromType === "معاملة") {
        console.log("Adding old amount to old sender (معاملة)", oldFromId, oldAmount);
        
        await db.run(`UPDATE procedures SET credit = credit + ? WHERE id = ?`, [oldAmount, oldFromId]);
    } else if (oldFromType === "عقار") {
        console.log("Adding old amount to old sender (عقار)", oldFromId, oldAmount);
        
        await db.run(`UPDATE realstates SET credit = credit + ? WHERE id = ?`, [oldAmount, oldFromId]);
    }
    // اخصم المبلغ القديم من المستلم القديم
    if (oldToType === "شخصي") {
        console.log("Subtracting old amount from old receiver (شخصي)", oldToId, oldAmount);
        
        await db.run(`UPDATE customersaccount SET credit = credit - ? WHERE id = ?`, [oldAmount, oldToId]);
    } else if (oldToType === "معاملة") {
        console.log("Subtracting old amount from old receiver (معاملة)", oldToId, oldAmount);
        
        await db.run(`UPDATE procedures SET credit = credit - ? WHERE id = ?`, [oldAmount, oldToId]);
    } else if (oldToType === "عقار") {
        console.log("Subtracting old amount from old receiver (عقار)", oldToId, oldAmount);
        
        await db.run(`UPDATE realstates SET credit = credit - ? WHERE id = ?`, [oldAmount, oldToId]);
    }

    // تحقق من رصيد المرسل الجديد
    let senderCredit = 0;
    if (newFromType === "شخصي") {
        console.log("Checking sender credit (شخصي)", newFromId, newAmount);
        
        const fromInfo = await db.get(`SELECT credit FROM customersaccount WHERE id = ?`, [newFromId]);
        if (!fromInfo) throw new Error("المرسل غير موجود");
        senderCredit = fromInfo.credit;
    } else if (newFromType === "معاملة") {
        console.log("Checking sender credit (معاملة)", newFromId, newAmount);
        
        const fromInfo = await db.get(`SELECT credit FROM procedures WHERE id = ?`, [newFromId]);
        if (!fromInfo) throw new Error("المرسل (معاملة) غير موجود");
        senderCredit = fromInfo.credit;
    } else if (newFromType === "عقار") {
        console.log("Checking sender credit (عقار)", newFromId, newAmount);
        
        const fromInfo = await db.get(`SELECT credit FROM realstates WHERE id = ?`, [newFromId]);
        if (!fromInfo) throw new Error("المرسل (عقار) غير موجود");
        senderCredit = fromInfo.credit;
    }
    if (senderCredit < newAmount) {
        await db.run("ROLLBACK");
        throw new Error("❌ الرصيد غير كافٍ لإجراء التعديل");
    }

    // خصم من المرسل الجديد
    if (newFromType === "شخصي") {
        console.log("Subtracting new amount from new sender (شخصي)", newFromId, newAmount);
        
        await db.run(`UPDATE customersaccount SET credit = credit - ? WHERE id = ?`, [newAmount, newFromId]);
    } else if (newFromType === "معاملة") {
        console.log("Subtracting new amount from new sender (معاملة)", newFromId, newAmount);
        
        await db.run(`UPDATE procedures SET credit = credit - ? WHERE id = ?`, [newAmount, newFromId]);
    } else if (newFromType === "عقار") {
        console.log("Subtracting new amount from new sender (عقار)", newFromId, newAmount);
        
        await db.run(`UPDATE realstates SET credit = credit - ? WHERE id = ?`, [newAmount, newFromId]);
    }
    // إضافة إلى المستلم الجديد
    if (newToType === "شخصي") {
        console.log("Adding new amount to new receiver (شخصي)", newToId, newAmount);
        
        await db.run(`UPDATE customersaccount SET credit = credit + ? WHERE id = ?`, [newAmount, newToId]);
    } else if (newToType === "معاملة") {
        console.log("Adding new amount to new receiver (معاملة)", newToId, newAmount);
        
        await db.run(`UPDATE procedures SET credit = credit + ? WHERE id = ?`, [newAmount, newToId]);
    } else if (newToType === "عقار") {
        console.log("Adding new amount to new receiver (عقار)", newToId, newAmount);
        
        await db.run(`UPDATE realstates SET credit = credit + ? WHERE id = ?`, [newAmount, newToId]);
    }

    await db.run(
      `UPDATE internalTransactions SET
        fromId = ?,
        toId = ?,
        amount = ?,
        fromType = ?,
        toType = ?,
        date = ?,
        details = ?
       WHERE id = ?`,
      [
        tx.fromId ?? existing.fromId,
        tx.toId ?? existing.toId,
        tx.amount ?? existing.amount,
        tx.fromType ?? existing.fromType,
        tx.toType ?? existing.toType,
        tx.date ?? existing.date,
        tx.details ?? existing.details,
        id,
      ]
    );

    await db.run("COMMIT");
  } catch (error) {
    await db.run("ROLLBACK");
    throw error;
  }
}

// Delete an internal transaction
export async function deleteInternalTransaction(id: number): Promise<void> {

  const db = await initializeDatabase();
 
// Restore credits to original state before deleting the transaction
const existing = await db.get(`SELECT * FROM internalTransactions WHERE id = ?`, [id]);
if (!existing) throw new Error("Transaction not found");

// Add the amount back to the sender
if (existing.fromType === "شخصي") {
    await db.run(`UPDATE customersaccount SET credit = credit + ? WHERE id = ?`, [existing.amount, existing.fromId]);
} else if (existing.fromType === "معاملة") {
    await db.run(`UPDATE procedures SET credit = credit + ? WHERE id = ?`, [existing.amount, existing.fromId]);
} else if (existing.fromType === "عقار") {
    await db.run(`UPDATE realstates SET credit = credit + ? WHERE id = ?`, [existing.amount, existing.fromId]);
}

// Subtract the amount from the receiver
if (existing.toType === "شخصي") {
    await db.run(`UPDATE customersaccount SET credit = credit - ? WHERE id = ?`, [existing.amount, existing.toId]);
} else if (existing.toType === "معاملة") {
    await db.run(`UPDATE procedures SET credit = credit - ? WHERE id = ?`, [existing.amount, existing.toId]);
} else if (existing.toType === "عقار") {
    await db.run(`UPDATE realstates SET credit = credit - ? WHERE id = ?`, [existing.amount, existing.toId]);
}
 await db.run(`DELETE FROM internalTransactions WHERE id = ?`, [id]);
}