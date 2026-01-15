import React from 'react'

interface SendPasswordProps {
  name: string;
  newPassword: string;
}

export default function SendPassword({ name, newPassword }: SendPasswordProps) {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      border: '1px solid #e0e0e0',
      borderRadius: '5px',
      backgroundColor: '#f9f9f9'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '10px 0',
        borderBottom: '1px solid #e0e0e0',
        marginBottom: '20px'
      }}>
        <h1 style={{
          color: '#333',
          fontSize: '24px',
          margin: '0'
        }}>Thank you for your order!</h1>
      </div>
      
      <p>Hello <strong>{name}</strong>,</p>
      
      <p style={{ marginBottom: '16px', fontSize: '18px' }}></p>
      <p>We have created your account with this email address. Please use the following password to log in.</p>
      
      <div style={{
        backgroundColor: '#4a90e2',
        color: 'white',
        padding: '15px',
        borderRadius: '5px',
        textAlign: 'center',
        margin: '20px 0',
        fontSize: '20px',
        fontWeight: 'bold'
      }}>
        {newPassword}
      </div>
      
      <p>For security reasons, we recommend changing your password after logging in.</p>
      
      <p style={{ 
        marginTop: '30px', 
        borderTop: '1px solid #e0e0e0', 
        paddingTop: '15px', 
        fontSize: '12px', 
        color: '#777' 
      }}>
        This is an automated message, please do not reply.
      </p>
    </div>
  )
}
