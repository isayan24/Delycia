# Design Document

## Overview

This design implements a QR code scanner component that integrates into the checkout flow. When a user reaches checkout without a table number stored in cookies, the system will automatically activate the device camera to scan QR codes. The solution uses the `html5-qrcode` library for cross-browser QR scanning capabilities and integrates seamlessly with the existing checkout component architecture.

## Architecture

### High-Level Flow

```
User navigates to checkout
    ↓
Check for table cookie
    ↓
No table found → Render QR Scanner Component
    ↓
Request camera permission
    ↓
Start scanning
    ↓
QR code detected → Extract table number
    ↓
Validate & store in cookie
    ↓
Close scanner & refresh checkout view
```

### Component Hierarchy

```
Checkout (existing)
  ├── EmptyCheckout
  ├── Form
  │   ├── TableNotFoundCard (existing)
  │   ├── QRCodeScanner (new)
  │   ├── PaymentButtons
  │   ├── SpecialInstructionArea
  │   └── CheckoutSidebar
```

## Components and Interfaces

### 1. QRCodeScanner Component

**Purpose**: Handles camera access, QR code scanning, and table number extraction

**Props Interface**:
```typescript
interface QRCodeScannerProps {
  onScanSuccess: (tableNumber: string) => void;
  onClose: () => void;
  isOpen: boolean;
}
```

**Key Features**:
- Uses `html5-qrcode` library for scanning
- Displays camera viewfinder with overlay
- Shows scanning instructions
- Handles camera permissions
- Provides close button
- Responsive design for mobile and desktop

**State Management**:
```typescript
{
  isScanning: boolean;
  error: string | null;
  scanResult: string | null;
}
```

### 2. Modified Checkout Component

**Changes Required**:
- Add state to control QR scanner visibility
- Implement `handleScanSuccess` callback to process scanned table number
- Replace `TableNotFoundCard` with conditional rendering of `QRCodeScanner`
- Add manual trigger button to reopen scanner if closed

**New State**:
```typescript
const [showQRScanner, setShowQRScanner] = useState<boolean>(!table);
const [scannerError, setScannerError] = useState<string | null>(null);
```

### 3. TableNotFoundCard Enhancement

**Changes**:
- Add "Scan QR Code" button to manually trigger scanner
- Display when scanner is closed or encounters errors
- Show fallback instructions

## Data Models

### QR Code Data Format

Expected QR code content format:
```typescript
// Option 1: Simple string
"TABLE_12"

// Option 2: JSON format
{
  "table": "12",
  "restaurant_id": "rid_123"
}

// Option 3: URL format
"https://restaurant.com/table/12?rid=rid_123"
```

**Parsing Strategy**:
1. Try parsing as JSON first
2. If JSON fails, check for URL pattern and extract table from path/query
3. If URL fails, extract numeric value from string
4. Validate extracted table number format

### Cookie Storage

```typescript
interface TableCookie {
  value: string; // table number
  path: string;  // "/"
  maxAge?: number; // optional expiry
}
```

## Error Handling

### Camera Permission Errors

**Scenario**: User denies camera permission
**Handling**:
- Display clear error message: "Camera access is required to scan QR codes"
- Show "Allow Camera" button to retry permission request
- Provide fallback option to manually enter table number or contact staff

### Invalid QR Code

**Scenario**: QR code doesn't contain valid table information
**Handling**:
- Display error: "Invalid QR code. Please scan the table's QR code"
- Continue scanning (don't close scanner)
- Log error for debugging

### Camera Not Available

**Scenario**: Device doesn't have a camera or camera is in use
**Handling**:
- Display error: "Camera not available on this device"
- Show manual table entry option
- Suggest using a mobile device

### Network/Processing Errors

**Scenario**: Error storing cookie or refreshing page
**Handling**:
- Display error with retry option
- Maintain scanned table number in component state
- Allow manual retry

## Testing Strategy

### Unit Tests

1. **QRCodeScanner Component**
   - Renders correctly when open
   - Calls onClose when close button clicked
   - Calls onScanSuccess with correct table number
   - Displays error messages appropriately

2. **Table Number Parsing**
   - Correctly extracts table from JSON format
   - Correctly extracts table from URL format
   - Correctly extracts table from simple string
   - Rejects invalid formats

### Integration Tests

1. **Checkout Flow**
   - Scanner opens automatically when no table cookie
   - Scanner doesn't open when table cookie exists
   - Table cookie is set after successful scan
   - Checkout page refreshes after successful scan
   - Manual trigger button works after closing scanner

### Manual Testing Checklist

- [ ] Test on iOS Safari (mobile)
- [ ] Test on Android Chrome (mobile)
- [ ] Test on desktop Chrome
- [ ] Test camera permission denial flow
- [ ] Test with valid QR codes
- [ ] Test with invalid QR codes
- [ ] Test close and reopen scanner
- [ ] Test responsive design on various screen sizes
- [ ] Test with rear/front camera selection on mobile

## Implementation Details

### Library Selection: html5-qrcode

**Rationale**:
- Cross-browser compatibility (iOS Safari, Android Chrome, Desktop)
- No native dependencies required
- Active maintenance and good documentation
- Supports both camera and file upload scanning
- Handles camera permissions automatically
- Lightweight (~50KB gzipped)

**Installation**:
```bash
npm install html5-qrcode
```

### Camera Configuration

```typescript
const qrConfig = {
  fps: 10, // Scans per second
  qrbox: { width: 250, height: 250 }, // Scanning box size
  aspectRatio: 1.0, // Square aspect ratio
  facingMode: "environment" // Rear camera on mobile
};
```

### Scanner Lifecycle

1. **Mount**: Initialize Html5Qrcode instance
2. **Start**: Request camera permission and start scanning
3. **Scan**: Process each frame, detect QR codes
4. **Success**: Stop scanner, process result, cleanup
5. **Unmount**: Stop scanner, release camera, cleanup resources

### Mobile Optimization

- Use `facingMode: "environment"` to default to rear camera
- Full-width scanner on mobile devices
- Touch-friendly close button (min 44x44px)
- Prevent body scroll when scanner is active
- Handle orientation changes gracefully

## Security Considerations

1. **Input Validation**: Sanitize scanned table numbers before storing
2. **Cookie Security**: Use secure cookie settings in production
3. **Camera Access**: Only request when needed, release immediately after use
4. **XSS Prevention**: Escape any displayed scanned content
5. **Rate Limiting**: Prevent rapid scanning attempts (if needed)

## Performance Considerations

1. **Lazy Loading**: Load html5-qrcode library only when scanner is needed
2. **Camera Release**: Properly stop camera stream to free resources
3. **Debouncing**: Prevent multiple rapid scan results
4. **Memory Management**: Clean up scanner instance on unmount
5. **Bundle Size**: html5-qrcode adds ~50KB, acceptable for this feature

## Accessibility

1. **Keyboard Navigation**: Close button accessible via keyboard
2. **Screen Readers**: Announce scanner state changes
3. **ARIA Labels**: Proper labels for scanner controls
4. **Focus Management**: Focus close button when scanner opens
5. **Alternative Input**: Provide manual table entry option

## Future Enhancements

1. **Scan History**: Remember recently scanned tables
2. **Multi-format Support**: Support barcode scanning
3. **Offline Mode**: Cache QR scanning capability
4. **Analytics**: Track scan success/failure rates
5. **Custom QR Design**: Support restaurant-branded QR codes
