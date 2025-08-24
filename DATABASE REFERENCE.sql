DATABASE REFERENCE
==================

This file documents the current SQLite schema as defined by the migration logic in `src/electron/database/userOperations.ts` (migrations up to db_version 21).

TABLES
------

1. users
   - id: INTEGER PRIMARY KEY AUTOINCREMENT
   - username: TEXT UNIQUE NOT NULL
   - password: TEXT NOT NULL
   - role: TEXT DEFAULT 'user'
   - debit: REAL DEFAULT 0
   - credit: REAL DEFAULT 0
   - permissions: TEXT DEFAULT '{}'  -- (added in migration v19)

2. transactions
   - id: INTEGER PRIMARY KEY AUTOINCREMENT
   - user_id: INTEGER NOT NULL (FK → users.id)
   - recipient: TEXT NOT NULL
   - amount: REAL NOT NULL
   - report: TEXT
   - procedureId: INTEGER NOT NULL (FK → procedures.id)
   - type: TEXT CHECK(type IN ('procedure','personal')) NOT NULL
   - date: TEXT DEFAULT (datetime('now', 'localtime'))
   - transactionType: TEXT CHECK(transactionType IN ('incoming','outgoing')) NOT NULL

3. customersaccount
   - id: INTEGER PRIMARY KEY AUTOINCREMENT
   - accountNumber: TEXT NOT NULL
   - accountType: TEXT NOT NULL
   - phone: TEXT NOT NULL
   - address: TEXT NOT NULL
   - date: TEXT DEFAULT (datetime('now', 'localtime'))
   - details: TEXT
   - name: TEXT
   - debit: REAL DEFAULT 0
   - credit: REAL DEFAULT 0

4. realstates
   - id: INTEGER PRIMARY KEY AUTOINCREMENT
   - propertyTitle: TEXT NOT NULL
   - propertyNumber: TEXT NOT NULL
   - address: TEXT NOT NULL
   - price: REAL NOT NULL
   - date: TEXT DEFAULT (datetime('now', 'localtime'))
   - details: TEXT
   - isSold: INTEGER DEFAULT 0
   - soldDate: TEXT
   - isRented: INTEGER DEFAULT 0
   - debit: REAL DEFAULT 0    -- schemas migrated to REAL (see migration v17)
   - credit: REAL DEFAULT 0   -- schemas migrated to REAL (see migration v17)
   - rentamounts: TEXT DEFAULT '[]' -- JSON array (added v17)

5. realstate_owners
   - id: INTEGER PRIMARY KEY AUTOINCREMENT
   - realstate_id: INTEGER NOT NULL (FK → realstates.id)
   - customer_id: INTEGER NOT NULL (FK → customersaccount.id)

6. procedures
   - id: INTEGER PRIMARY KEY AUTOINCREMENT
   - procedureNumber: TEXT NOT NULL
   - procedureName: TEXT NOT NULL
   - description: TEXT
   - date: TEXT DEFAULT (datetime('now', 'localtime'))
   - status: TEXT NOT NULL
   - phone: TEXT NOT NULL
   - debit: REAL DEFAULT 0    -- added in migration v16
   - credit: REAL DEFAULT 0   -- added in migration v16

7. procedure_owners
   - id: INTEGER PRIMARY KEY AUTOINCREMENT
   - procedure_id: INTEGER NOT NULL (FK → procedures.id)
   - customer_id: INTEGER NOT NULL (FK → customersaccount.id)

8. tenants
   - id: INTEGER PRIMARY KEY AUTOINCREMENT
   - contractStatus: TEXT NOT NULL
   - startDate: TEXT NOT NULL
   - propertyId: INTEGER NOT NULL (FK → realstates.id)
   - endDate: TEXT NOT NULL
   - entitlement: REAL NOT NULL
   - contractNumber: TEXT NOT NULL UNIQUE
   - installmentCount: INTEGER NOT NULL
   - leasedUsage: TEXT NOT NULL
   - installmentsDue: TEXT DEFAULT '[]' (JSON array)
   - installmentAmount: REAL DEFAULT 0
   - propertyType: TEXT NOT NULL

9. tenant_names
   - id: INTEGER PRIMARY KEY AUTOINCREMENT
   - tenant_id: INTEGER NOT NULL (FK → tenants.id)
   - customer_id: INTEGER NOT NULL (FK → customersaccount.id)

10. personaltransactions
    - id: INTEGER PRIMARY KEY AUTOINCREMENT
    - user_id: INTEGER NOT NULL (FK → users.id)
    - customer_id: INTEGER NOT NULL (FK → customersaccount.id)
    - amount: REAL NOT NULL
    - customer_debit: REAL DEFAULT 0
    - customer_credit: REAL DEFAULT 0
    - report: TEXT
    - type: TEXT CHECK(type IN ('procedure','personal','rent')) NOT NULL
    - date: TEXT DEFAULT (datetime('now', 'localtime'))
    - transactionType: TEXT CHECK(transactionType IN ('incoming','outgoing')) NOT NULL

11. tenantsTransactions
    - id: INTEGER PRIMARY KEY AUTOINCREMENT
    - propertyId: INTEGER NOT NULL (FK → realstates.id)
    - tenantId: INTEGER NOT NULL (FK → tenants.id)
    - customerId: INTEGER NOT NULL (FK → customersaccount.id)
    - amount: REAL NOT NULL
    - date: TEXT DEFAULT (datetime('now', 'localtime'))
    - isPaid: INTEGER DEFAULT 0 (0 = false, 1 = true)
    - description: TEXT

12. internalTransactions
    - id: INTEGER PRIMARY KEY AUTOINCREMENT
    - fromId: INTEGER NOT NULL
    - toId: INTEGER NOT NULL
    - amount: REAL NOT NULL
    - fromType: TEXT NOT NULL -- e.g. 'user', 'customer', 'realstate', etc.
    - toType: TEXT NOT NULL   -- e.g. 'user', 'customer', 'realstate', etc.
    - date: TEXT DEFAULT (datetime('now', 'localtime'))
    - details: TEXT
    (created in migration v15)

13. activation
    - id: INTEGER PRIMARY KEY AUTOINCREMENT
    - code: TEXT NOT NULL UNIQUE
    - status: TEXT NOT NULL DEFAULT 'active'
    - activatedAt: TEXT
    - activatedBy: INTEGER
    - duration: INTEGER
    - createdAt: TEXT DEFAULT (datetime('now', 'localtime'))
    - updatedAt: TEXT DEFAULT (datetime('now', 'localtime'))
    - activatedBy references users(id) (nullable)
    (created in migration v18)

14. attachments
    - id: INTEGER PRIMARY KEY AUTOINCREMENT
    - entity_type: TEXT NOT NULL   -- generic entity name (e.g. 'realstate','procedure','tenant')
    - entity_id: INTEGER           -- referenced entity id (nullable)
    - path: TEXT NOT NULL          -- absolute path saved in userData
    - created_at: TEXT DEFAULT (datetime('now', 'localtime'))
    (originally created with realstate_id in v20; migrated to entity_type/entity_id in v21)

15. meta
    - key: TEXT PRIMARY KEY
    - value: TEXT NOT NULL
    (Used for db versioning; migrations update db_version in this table)

----------------------------------------

SPECIAL FIELDS / NOTES
--------------

- `realstates.debit` and `realstates.credit` are REAL columns (migration normalized types in v17). Some older DB versions stored JSON arrays here; migrations convert to REAL defaults where needed.
- `tenants.installmentsDue` is kept as JSON text (stringified array of objects).
- `attachments` is now generic: use `entity_type` + `entity_id` to support attachments for different entity types. Existing rows that used `realstate_id` are migrated automatically (migration v21).
- `users.permissions` is stored as a JSON string (e.g. '{"dashboard":true}') (added in v19).

MIGRATION LOGIC
---------------

- Each migration checks `meta.db_version` and applies changes incrementally. Recent notable migrations:
  - v13: added `debit`/`credit` (text) to `realstates` (legacy step)
  - v16: added `debit`/`credit` (REAL) to `procedures`
  - v17: normalized `realstates` schema and ensured `debit`/`credit` are REAL, added `rentamounts`
  - v18: added `activation` table
  - v19: added `users.permissions`
  - v20: created `attachments` table (legacy schema with `realstate_id`)
  - v21: migrated `attachments` to (`entity_type`, `entity_id`) and copied existing `realstate_id` values into the new schema

----------------------------------------

QUICK SQL COMMANDS
------------------

- See all tables:
  SELECT name FROM sqlite_master WHERE type='table';

- See table schema:
  PRAGMA table_info(table_name);

- Check db version:
  SELECT value FROM meta WHERE key = 'db_version';

----------------------------------------

RECOMMENDATIONS
---------------

- When writing code that persists complex data, explicitly document whether a column contains JSON text or scalar values. Use JSON.parse/JSON.stringify for JSON text fields.
- Expect `attachments.path` to be an absolute path saved under Electron `app.getPath('userData')` and avoid storing the binary itself in the DB.
- When upgrading from older versions, keep a backup of the DB before running migrations.

----------------------------------------

END OF FILE