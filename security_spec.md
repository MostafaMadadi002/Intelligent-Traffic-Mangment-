# Security Specification - Intelligent Traffic Management

## Data Invariants
1. **Camera Management**: Only users with the `admin` role in their `/users/{uid}` document can create, update, or delete cameras.
2. **User Profiles**: Users can only read and write their own profile in `/users/{userId}`. Roles are immutable once set (or only modifiable by admins).
3. **Log Integrity**: `traffic_logs` and `signal_logs` are write-once (create-only). No updates or deletions are allowed by any user.
4. **Reference Integrity**: Every `traffic_log` and `signal_log` must reference a valid `cameraId` that exists in the `cameras` collection.
5. **System Constants**: `createdAt` and `timestamp` fields must be assigned the server-side `request.time`.

## The Dirty Dozen Payloads (Rejection Tests)

1. **Identity Theft**: Unauthenticated user attempting to create a camera.
2. **Privilege Escalation**: Operator attempting to delete a camera.
3. **Shadow Field Injection**: Creating a camera with an unapproved `isGlobalAdmin: true` field.
4. **Role Poaching**: A user attempting to change their role to `admin` in their own profile update.
5. **Orphaned Log**: Creating a `traffic_log` with a `cameraId` that does not exist in the database.
6. **Data Poisoning**: Creating a `traffic_log` with negative vehicle counts.
7. **Temporal Fraud**: Providing a client-side `timestamp` in a `signal_log` instead of using `request.time`.
8. **Log Tampering**: Attempting to update the `density` of an existing `traffic_log`.
9. **Log Erasure**: Attempting to delete a `traffic_log` entry.
10. **ID Poisoning**: Attempting to create a camera with an ID exceeding 128 characters or containing illegal symbols.
11. **Type Mismatch**: Sending a string for the `density` field in a `traffic_log`.
12. **Blanket Query Scraping**: Attempting to list all logs without providing an authenticated session.

## Test Runner (TDD)
*Verified in `firestore.rules.test.ts` (conceptual)*
- `test: unauthenticated_camera_create -> DENY`
- `test: operator_camera_delete -> DENY`
- `test: existing_log_update -> DENY`
- `test: user_self_promo -> DENY`
