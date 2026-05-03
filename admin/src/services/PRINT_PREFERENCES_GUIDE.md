# Print Preferences Guide

## Overview

The Print Preferences system allows users to control whether bills should automatically open the print dialog or show a preview first. This is stored per-restaurant in localStorage.

## How It Works

### Default Behavior (Auto-Print Disabled)
```
Order Placed → Bill Preview Dialog Shows → User Reviews → User Clicks Print
```

### With Auto-Print Enabled
```
Order Placed → Print Dialog Opens Automatically → User Selects Printer → Prints
```

## User Interface

### Enabling Auto-Print

1. Place an order (bill preview dialog appears)
2. Click the **Settings icon** (⚙️) in the dialog header
3. Toggle **"Auto-Print Bills"** switch to ON
4. Setting is saved automatically

### Disabling Auto-Print

1. Open any bill preview dialog
2. Click the **Settings icon** (⚙️)
3. Toggle **"Auto-Print Bills"** switch to OFF
4. Future bills will show preview first

## Technical Details

### Storage

- **Location**: `localStorage`
- **Key**: `delycia_print_preferences`
- **Scope**: Per restaurant (different settings for each restaurant)
- **Format**:
```json
{
  "123": {
    "autoPrintEnabled": true,
    "lastUpdated": "2026-02-28T12:00:00.000Z"
  },
  "456": {
    "autoPrintEnabled": false,
    "lastUpdated": "2026-02-28T13:00:00.000Z"
  }
}
```

### API

```typescript
import {
  getPrintPreferences,
  setPrintPreferences,
  enableAutoPrint,
  disableAutoPrint,
  isAutoPrintEnabled,
} from '@/services/printPreferences'

// Check if auto-print is enabled
const enabled = isAutoPrintEnabled(restaurantId)

// Enable auto-print
enableAutoPrint(restaurantId)

// Disable auto-print
disableAutoPrint(restaurantId)

// Get full preferences
const prefs = getPrintPreferences(restaurantId)

// Set custom preferences
setPrintPreferences(restaurantId, {
  autoPrintEnabled: true
})
```

## Use Cases

### Restaurant with Thermal Printer
- Enable auto-print
- Bills print immediately to thermal printer
- No preview needed

### Restaurant without Printer
- Keep auto-print disabled (default)
- Review bills in preview
- Download or share as needed

### Mixed Environment
- Each restaurant can have different settings
- Settings persist across sessions
- Easy to toggle on/off

## Benefits

✅ **User Control**: Users decide their preferred workflow
✅ **Per-Restaurant**: Different settings for different locations
✅ **Persistent**: Settings saved across browser sessions
✅ **Easy Toggle**: Simple switch in bill preview dialog
✅ **No Server Required**: All stored locally
✅ **Privacy**: No tracking or external storage

## Troubleshooting

### Auto-Print Not Working

1. Check if setting is enabled:
   - Open bill preview
   - Click settings icon
   - Verify toggle is ON

2. Check browser permissions:
   - Some browsers block automatic print dialogs
   - Try manually clicking Print button first

3. Clear preferences and retry:
```typescript
import { clearPrintPreferences } from '@/services/printPreferences'
clearPrintPreferences()
```

### Settings Not Saving

- Check browser localStorage is enabled
- Check for browser extensions blocking storage
- Try in incognito/private mode to test

### Different Behavior on Different Devices

- Settings are stored per-device (localStorage)
- Each device needs to be configured separately
- This is by design for flexibility

## Future Enhancements

- [ ] Sync preferences across devices (requires backend)
- [ ] Printer selection UI
- [ ] Print count tracking
- [ ] Bulk enable/disable for all restaurants
- [ ] Export/import preferences
