# Implementation Plan

- [x] 1. Install and configure QR code scanning library
  - Install html5-qrcode package via npm
  - Verify package installation and types availability
  - _Requirements: 1.3, 5.1, 5.2_

- [x] 2. Create QRCodeScanner component with camera integration
  - [x] 2.1 Create QRCodeScanner component file with TypeScript interface
    - Define component props interface (onScanSuccess, onClose, isOpen)
    - Set up component state for scanning status and errors
    - Create basic component structure with conditional rendering
    - _Requirements: 1.2, 1.4, 2.1_

  - [x] 2.2 Implement camera initialization and scanning logic
    - Initialize Html5Qrcode instance with camera configuration
    - Implement camera start logic with permission handling
    - Configure scanner settings (fps: 10, qrbox, facingMode: "environment")
    - Add QR code detection callback to process scan results
    - _Requirements: 1.3, 1.5, 5.3_

  - [x] 2.3 Build scanner UI with viewfinder and controls
    - Create camera viewfinder container with proper dimensions
    - Add scanning instructions overlay
    - Implement close button with proper styling and accessibility
    - Add loading state indicator during camera initialization
    - Make UI responsive for mobile and desktop screens
    - _Requirements: 2.1, 2.2, 4.1, 5.4, 5.5_

  - [x] 2.4 Implement cleanup and resource management
    - Add cleanup logic to stop camera stream on unmount
    - Release Html5Qrcode instance properly
    - Handle component unmount during active scanning
    - Prevent memory leaks from camera resources
    - _Requirements: 4.2, 4.3_

- [x] 3. Implement table number extraction and validation
  - [x] 3.1 Create table number parsing utility function
    - Write function to parse JSON format QR codes
    - Write function to parse URL format QR codes
    - Write function to extract table from simple string format
    - Implement fallback parsing strategy (try JSON → URL → string)
    - _Requirements: 3.1_

  - [x] 3.2 Add table number validation logic
    - Implement validation rules for table number format
    - Add error handling for invalid QR code data
    - Create validation function that returns boolean and error message
    - _Requirements: 3.2_

- [x] 4. Integrate QR scanner into Checkout component
  - [x] 4.1 Add scanner state management to Checkout
    - Add showQRScanner state (default: !table)
    - Add scannerError state for error handling
    - Create handleScanSuccess callback function
    - Create handleScannerClose callback function
    - _Requirements: 1.1, 1.2, 4.4_

  - [x] 4.2 Implement scan success handler with cookie storage
    - Extract table number from scan result using parsing utility
    - Validate extracted table number
    - Store validated table number in cookie using setCookie
    - Close scanner after successful storage
    - Trigger page refresh to update checkout view
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

  - [x] 4.3 Update Checkout render logic for scanner integration
    - Replace TableNotFoundCard with conditional QRCodeScanner when no table
    - Pass required props to QRCodeScanner (callbacks, isOpen state)
    - Keep TableNotFoundCard as fallback when scanner is closed
    - Ensure proper component mounting/unmounting
    - _Requirements: 1.2, 4.4, 4.5_

- [x] 5. Implement error handling and user feedback
  - [x] 5.1 Add camera permission error handling
    - Detect camera permission denial
    - Display user-friendly error message for denied permissions
    - Show retry button to request permissions again
    - Provide fallback instructions when camera unavailable
    - _Requirements: 2.4, 2.5_

  - [x] 5.2 Add invalid QR code error handling
    - Detect invalid QR code format during parsing
    - Display error message without closing scanner
    - Allow user to continue scanning after error
    - Log errors for debugging purposes
    - _Requirements: 2.3_

  - [x] 5.3 Add visual feedback for successful scan
    - Display success indicator when QR code detected
    - Show brief confirmation message before closing scanner
    - Add smooth transition animation when closing
    - _Requirements: 2.3_

- [x] 6. Enhance TableNotFoundCard with manual scanner trigger
  - [x] 6.1 Add "Scan QR Code" button to TableNotFoundCard
    - Create button with clear call-to-action text
    - Style button to match existing design system
    - Add onClick handler to trigger scanner
    - _Requirements: 4.5_

  - [x] 6.2 Update TableNotFoundCard to accept callback prop
    - Add onScanClick prop to component interface
    - Pass callback from Checkout component
    - Update component to show button when callback provided
    - _Requirements: 4.5, 2.5_

- [x] 7. Add mobile-specific optimizations
  - [x] 7.1 Implement mobile-responsive scanner layout
    - Make scanner full-width on mobile devices (max-width: 768px)
    - Adjust scanning box size for smaller screens
    - Ensure close button is touch-friendly (min 44x44px)
    - Test and adjust for various mobile screen sizes
    - _Requirements: 5.4, 5.5_

  - [x] 7.2 Add mobile camera selection logic
    - Configure facingMode to prefer rear camera on mobile
    - Handle devices with multiple cameras
    - Add fallback for devices with only front camera
    - _Requirements: 5.3_

  - [x] 7.3 Prevent body scroll when scanner is active
    - Add CSS to prevent background scrolling during scan
    - Restore scroll behavior when scanner closes
    - Handle edge cases with modal-like behavior
    - _Requirements: 5.5_

- [ ]* 8. Add accessibility features
  - [ ]* 8.1 Implement keyboard navigation support
    - Make close button keyboard accessible
    - Add Escape key handler to close scanner
    - Ensure proper tab order for scanner controls
    - _Requirements: 4.1_

  - [ ]* 8.2 Add ARIA labels and screen reader support
    - Add ARIA labels to scanner container and controls
    - Announce scanner state changes to screen readers
    - Add descriptive alt text for visual elements
    - Ensure error messages are announced
    - _Requirements: 2.1, 2.4_

  - [ ]* 8.3 Implement focus management
    - Focus close button when scanner opens
    - Trap focus within scanner while active
    - Restore focus to trigger element when closed
    - _Requirements: 4.1_
