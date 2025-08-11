DATABASE REFERENCE
==================

TABLES
------

1. users
   - id: INTEGER PRIMARY KEY AUTOINCREMENT
   - username: TEXT UNIQUE NOT NULL
   - password: TEXT NOT NULL
   - role: TEXT DEFAULT 'user'
   - debit: REAL DEFAULT 0
   - credit: REAL DEFAULT 0

2. transactions
   - id: INTEGER PRIMARY KEY AUTOINCREMENT
   - user_id: INTEGER NOT NULL (FK → users.id)
   - recipient: TEXT NOT NULL
   - amount: REAL NOT NULL
   - report: TEXT
   - procedureId: INTEGER NOT NULL (FK → procedures.id)
   - type: TEXT CHECK('procedure','personal') NOT NULL
   - date: TEXT DEFAULT (datetime('now', 'localtime'))
   - transactionType: TEXT CHECK('incoming','outgoing') NOT NULL

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
   - debit: TEXT DEFAULT '[]' (JSON array)
   - credit: TEXT DEFAULT '[]' (JSON array)

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
    - type: TEXT CHECK('procedure','personal','rent') NOT NULL
    - date: TEXT DEFAULT (datetime('now', 'localtime'))
    - transactionType: TEXT CHECK('incoming','outgoing') NOT NULL

11. tenantsTransactions
    - id: INTEGER PRIMARY KEY AUTOINCREMENT
    - propertyId: INTEGER NOT NULL (FK → realstates.id)
    - tenantId: INTEGER NOT NULL (FK → tenants.id)
    - customerId: INTEGER NOT NULL (FK → customersaccount.id)
    - amount: REAL NOT NULL
    - date: TEXT DEFAULT (datetime('now', 'localtime'))
    - isPaid: INTEGER DEFAULT 0 (0 = false, 1 = true)
    - description: TEXT

12. meta
    - key: TEXT PRIMARY KEY
    - value: TEXT NOT NULL
    (Used for db versioning)

----------------------------------------

SPECIAL FIELDS
--------------

- realstates.debit / realstates.credit: JSON arrays for transactions.
- tenants.installmentsDue: JSON array of objects, e.g. [{"date":"2025-06-02","amount":500000,"isPaid":false}, ...]
- All *_owners tables are for many-to-many relationships.

----------------------------------------

MIGRATION LOGIC
---------------

- Each migration block checks the current version and applies new tables/columns as needed.
- After each migration, the meta table's db_version is updated.

----------------------------------------

MAIN FUNCTIONS
--------------

- initializeDatabase(): Opens DB, ensures meta table, applies migrations.
- applyMigrations(db): Handles all schema upgrades.
- registerUser(username, password): Registers a new user (admin by default).
- loginUser(username, password): Authenticates a user.
- deleteUser(userId): Deletes a user by ID.

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

NOTES
-----

- Always increment db_version in meta after a migration.
- Use JSON.parse/JSON.stringify for fields stored as JSON arrays.
- Foreign keys enforce data integrity between tables.

----------------------------------------

END OF FILE