# QR Code Generation API Routes

This directory contains the BFF (Backend-for-Frontend) API route for QR code generation functionality.

## Simplified Architecture

The QR code generation system follows a **simplified client-side approach**:

1. **Client-Side QR Generation**: QR codes are generated entirely in the browser using the `qrcode` library
2. **Table Auto-Creation**: When generating QR codes, tables are automatically created in the database if they don't exist
3. **No Metadata Storage**: QR code metadata is NOT stored in the database - QR codes are ephemeral and generated on-demand

## Endpoint

### POST `/api/qr-codes/create-tables`

Creates tables for QR code generation (simplified approach).

**Authentication**: Required (JWT cookie via `withAuth()`)

**Authorization**: User must have access to the restaurant via `restaurant_access` table

**Request Body**:
```json
{
  "rid": 123,
  "tables": [
    {
      "table_number": "1",
      "zone": "Main Floor"
    },
    {
      "table_number": "2",
      "zone": "Patio"
    }
  ]
}
```

**Response**:
```json
{
  "status": 200,
  "message": "Tables processed successfully",
  "success": true,
  "createdTables": [
    {
      "table_number": "1",
      "zone": "Main Floor",
      "capacity": 4
    }
  ],
  "createdTablesCount": 1,
  "skippedTables": ["2"],
  "skippedTablesCount": 1
}
```

**Features**:
- Only creates tables that don't already exist
- Skips existing tables (no updates)
- Default capacity: 4 seats per table
- Default status: "available"

**Error Responses**:
- `400 Bad Request`: Missing required fields or invalid data
- `401 Unauthorized`: No valid JWT cookie
- `403 Forbidden`: User doesn't have access to the restaurant
- `404 Not Found`: Restaurant not found
- `500 Internal Server Error`: Database or server error

---

## Benefits of Simplified Approach

1. **Reduced Database Load**: No need to store QR code metadata
2. **Simpler Architecture**: Client-side generation eliminates server-side QR rendering
3. **Scalability**: QR codes are generated on-demand without database queries
4. **Flexibility**: Easy to regenerate QR codes with different designs without database updates
5. **Production Ready**: Clean separation of concerns - tables in DB, QR codes in browser
6. **No Extra Tables**: No need for `qr_codes` table - keeps database schema simple

---

## Database Schema

The system creates entries in the `tables` table:

```sql
CREATE TABLE `tables` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `rid` int(11) NOT NULL,
  `table_number` varchar(50) NOT NULL,
  `capacity` int(11) DEFAULT 4,
  `zone` varchar(100) DEFAULT 'Main',
  `status` enum('available','occupied','reserved') DEFAULT 'available',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Frontend Integration

The frontend (`/qr-codes` page) uses this flow:

1. User selects tables and zones
2. Client generates QR codes using `qrCodeGenerator.generateBatch()`
3. Client calls `/api/qr-codes/create-tables` to ensure tables exist in DB
4. User downloads QR codes as PNG or ZIP

**Key Files**:
- `admin/src/routes/qr-codes.tsx` - Main QR code generator page
- `admin/src/services/qrCodeGenerator.ts` - Client-side QR generation
- `admin/src/services/downloadService.ts` - PNG/ZIP download handling
- `admin/src/routes/api/qr-codes/create-tables.ts` - BFF route for table creation

---

## Backend Architecture

The BFF route calls backend API endpoint at:
- `POST /api/v1/admin/qr-codes/create-tables`

This backend endpoint:
1. Validates JWT authentication via `authMiddleware`
2. Checks restaurant access via `hasRestaurantAccess()` utility
3. Creates tables in the `tables` table (skips existing ones)
4. Returns structured response with created/skipped table counts

---

## Testing

To test the simplified flow:

1. Navigate to `/qr-codes` in the admin panel
2. Select a restaurant
3. Add table numbers and assign zones
4. Click "Generate QR Codes"
5. Verify:
   - QR codes are displayed in the preview
   - Toast shows "X new table(s) created" for new tables
   - Toast shows "All X table(s) already exist" for existing tables
   - Download individual QR codes or bulk ZIP
   - Check database: `SELECT * FROM tables WHERE rid = ?`

---

## Production Considerations

✅ **Production Ready**:
- No console.log statements
- Proper error handling with user-friendly messages
- Validation at BFF and backend layers
- Authentication via JWT tokens
- Restaurant access control via `restaurant_access` table

✅ **Scalability**:
- Client-side QR generation reduces server load
- No database writes for QR metadata
- Efficient table creation with duplicate checks

✅ **Maintainability**:
- Simple, focused codebase
- Single responsibility: create tables only
- No deprecated code or legacy compatibility layers
- Clear separation of concerns (BFF → Backend → Database)
