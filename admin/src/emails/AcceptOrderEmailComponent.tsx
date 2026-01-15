import React from 'react'

interface AcceptOrderEmailComponentProps {
  name: string;
}

export default function AcceptOrderEmailComponent({ name }: AcceptOrderEmailComponentProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#4A5568', marginBottom: '24px' }}>Order confirmed, {name}!</h1>
      
      <p style={{ fontSize: '16px', lineHeight: '1.5', color: '#2D3748', marginBottom: '16px' }}>
        Thank you for continuing to trust us with your dining experience.
      </p>
        
      <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E2E8F0' }}>
        <p style={{ fontSize: '14px', color: '#718096' }}>
          If you have any questions, feel free to contact us anytime.
        </p>
      </div>
    </div>
  )
}
