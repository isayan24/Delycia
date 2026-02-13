import { BillData, TaxBreakdown } from './types'

interface BillPreviewProps {
  billData: BillData
  taxBreakdown: TaxBreakdown
  restaurantName: string
}

export function BillPreview({
  billData,
  taxBreakdown,
  restaurantName,
}: BillPreviewProps) {
  return (
    <div
      className="bill-container"
      style={{
        width: '80mm',
        fontFamily: 'Courier New, monospace',
        fontSize: '12px',
        lineHeight: '1.4',
      }}
    >
      {/* Header */}
      <div
        className="text-center mb-4 border-b pb-2"
        style={{
          textAlign: 'center',
          marginBottom: '16px',
          borderBottom: '1px solid #000',
          paddingBottom: '8px',
        }}
      >
        <div
          className="font-bold text-lg"
          style={{ fontWeight: 'bold', fontSize: '16px' }}
        >
          {restaurantName || 'RESTAURANT BILL'}
        </div>
        <div className="text-sm" style={{ fontSize: '11px' }}>
          Order #{billData.orderId}
        </div>
      </div>

      {/* Customer & Table Info */}
      <div
        className="space-y-1"
        style={{ marginBottom: '16px', marginTop: '10px' }}
      >
        <div className="flex justify-between font-bold text-lg border-b border-black pb-2 mb-2">
          <span>Table: {billData.tableNo}</span>
        </div>
        {billData.tableZone && (
          <div className="flex justify-between font-bold text-sm border-b border-black pb-2 mb-2">
            <span>{billData.tableZone}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span>Customer:</span>
          <span className="font-bold">{billData.customerName}</span>
        </div>
        <div className="flex justify-between">
          <span>Phone No:</span>
          <span>{billData.customerPhone}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{billData.orderDate}</span>
        </div>
      </div>

      {/* Items */}
      <div
        className="border-t border-b py-2 mb-2"
        style={{
          borderTop: '1px solid #000',
          borderBottom: '1px solid #000',
          padding: '8px 0',
          marginBottom: '8px',
        }}
      >
        <div
          className="font-bold text-center mb-2"
          style={{
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '8px',
          }}
        >
          ORDER ITEMS
        </div>
        <div className="space-y-1" style={{ fontSize: '11px' }}>
          {billData.items.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between">
                <span>
                  {item.name}{' '}
                  {item.variant_name ? `(${item.variant_name})` : ''} x
                  {item.quantity}
                </span>
                <span>₹{item.price.toFixed(2)}</span>
              </div>
              {item.addons && item.addons.length > 0 && (
                <div
                  style={{
                    fontSize: '10px',
                    color: '#666',
                    marginTop: '2px',
                  }}
                >
                  {item.addons.map((addon, aIdx) => (
                    <div
                      key={aIdx}
                      className="flex justify-between pl-2"
                      style={{ paddingLeft: '8px' }}
                    >
                      <span>
                        + {addon.quantity} {addon.name}
                      </span>
                      <span>₹{addon.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Special Instructions */}
      {billData.specialInstructions && billData.specialInstructions.trim() && (
        <div
          className="py-2 mb-2"
          style={{
            borderBottom: '1px dashed #000',
            padding: '6px 0',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              fontWeight: 'bold',
              fontSize: '11px',
              marginBottom: '4px',
            }}
          >
            NOTE:
          </div>
          <div style={{ fontSize: '11px', fontStyle: 'italic' }}>
            {billData.specialInstructions}
          </div>
        </div>
      )}

      {/* Subtotal */}
      <div className="py-1" style={{ padding: '4px 0' }}>
        <div className="flex justify-between" style={{ fontSize: '12px' }}>
          <span>Subtotal:</span>
          <span>₹{taxBreakdown.subtotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Discount */}
      {billData.discountAmount !== undefined && billData.discountAmount > 0 && (
        <div className="py-1" style={{ padding: '4px 0' }}>
          <div className="flex justify-between" style={{ fontSize: '12px' }}>
            <span>Discount:</span>
            <span>-₹{billData.discountAmount.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Tax */}
      <div className="py-1" style={{ padding: '4px 0' }}>
        <div className="flex justify-between" style={{ fontSize: '12px' }}>
          <span>Tax ({taxBreakdown.taxPercent}%):</span>
          <span>₹{taxBreakdown.taxAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Total */}
      <div
        className="border-t py-2 mb-4"
        style={{
          borderTop: '1px solid #000',
          padding: '8px 0',
          marginBottom: '16px',
        }}
      >
        <div
          className="flex justify-between font-bold text-lg"
          style={{
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          <span>GRAND TOTAL:</span>
          <span>₹{taxBreakdown.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer */}
      <div
        className="text-center border-t pt-2"
        style={{
          textAlign: 'center',
          borderTop: '1px solid #000',
          paddingTop: '8px',
          fontSize: '10px',
        }}
      >
        <div>Thank you for your visit!</div>
        <div>Please come again</div>
      </div>
    </div>
  )
}
