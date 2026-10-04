# Security Specification: Income & Expense Tracker (Project 001)

## 1. Data Invariants
1. **User Scoped Ownership**: All transaction records, budget entries, and user profiles must reside under `/users/{userId}/...` where `{userId}` strictly equals `request.auth.uid`. Cross-user access is impossible.
2. **Transaction Integrity**:
   - `type` must strictly be either `'income'` or `'expense'`.
   - `amount` must be a positive non-zero number (`amount > 0`).
   - `date` must conform to the `YYYY-MM-DD` pattern with max length 10.
   - `userId` in incoming data must strictly match `request.auth.uid`.
   - `createdAt` / `userId` are immutable after creation.
3. **Budget Integrity**:
   - `monthlyBudget` must be a non-negative number (`monthlyBudget >= 0`).
   - `month` must conform to `YYYY-MM`.
   - `userId` must strictly match `request.auth.uid`.
4. **ID Hardening**: All document path variables `{userId}`, `{transactionId}`, `{budgetId}` must pass `isValidId` (`size <= 128`, regex alphanumeric + dashes/underscores).
5. **No Blanket Reads**: All read queries must be authenticated and restricted to the user's own path.

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Spoofed Owner Transaction**:
   - Payload: `{ "userId": "attacker_victim_uid", "type": "expense", "amount": 500, "category": "Food", "date": "2025-10-04" }`
   - Expected: `PERMISSION_DENIED` (Incoming `userId` does not match `request.auth.uid`).

2. **Negative Amount Exploit**:
   - Payload: `{ "userId": "auth_uid", "type": "income", "amount": -10000, "category": "Hack", "date": "2025-10-04" }`
   - Expected: `PERMISSION_DENIED` (`amount` must be greater than 0).

3. **Invalid Transaction Type**:
   - Payload: `{ "userId": "auth_uid", "type": "transfer_wire_unlimited", "amount": 100, "category": "Unknown", "date": "2025-10-04" }`
   - Expected: `PERMISSION_DENIED` (`type` must be `'income'` or `'expense'`).

4. **Resource Poisoning via 2MB Description String**:
   - Payload: `{ "userId": "auth_uid", "type": "expense", "amount": 50, "category": "Food", "description": "A".repeat(50000), "date": "2025-10-04" }`
   - Expected: `PERMISSION_DENIED` (`description.size() <= 200`).

5. **Ghost Field Injection (Shadow Update / Write)**:
   - Payload: `{ "userId": "auth_uid", "type": "expense", "amount": 50, "category": "Food", "date": "2025-10-04", "isAdmin": true, "superUser": true }`
   - Expected: `PERMISSION_DENIED` (Keys not strictly permitted in schema).

6. **Invalid Date Pattern Injection**:
   - Payload: `{ "userId": "auth_uid", "type": "expense", "amount": 50, "category": "Food", "date": "INVALID-SQL-INJECTION-DATE" }`
   - Expected: `PERMISSION_DENIED` (`date` must match `^[0-9]{4}-[0-9]{2}-[0-9]{2}$`).

7. **Path Traversal / Junk Character Document ID**:
   - Path: `/users/auth_uid/transactions/../../evil_doc_id###$$$`
   - Expected: `PERMISSION_DENIED` (`isValidId` rejects invalid characters and lengths).

8. **Unauthenticated Read Attempt**:
   - Target: `GET /users/some_user/transactions/tx_123` with `auth = null`
   - Expected: `PERMISSION_DENIED` (Requires authentication).

9. **Cross-User Data Scraping (List Query)**:
   - Target: `LIST /users/victim_uid/transactions` by `attacker_uid`
   - Expected: `PERMISSION_DENIED` (`request.auth.uid != victim_uid`).

10. **Ownership Hijack on Update**:
    - Update payload on `/users/auth_uid/transactions/tx_123`: `{ "userId": "new_fake_owner", "amount": 100 }`
    - Expected: `PERMISSION_DENIED` (`userId` immutable).

11. **Negative Budget Allocation**:
    - Payload: `{ "userId": "auth_uid", "month": "2025-10", "monthlyBudget": -5000 }`
    - Expected: `PERMISSION_DENIED` (`monthlyBudget >= 0`).

12. **Malformed Month Format in Budget**:
    - Payload: `{ "userId": "auth_uid", "month": "October-2025", "monthlyBudget": 20000 }`
    - Expected: `PERMISSION_DENIED` (`month` must match `^[0-9]{4}-[0-9]{2}$`).
