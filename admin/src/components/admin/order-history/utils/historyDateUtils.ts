//client Utility function to convert UTC time to IST
export const convertToIST = (utcTimeStr: string): string => {
  try {
    // Parse the UTC time
    const utcDate = new Date(utcTimeStr)

    // Check if valid date
    if (isNaN(utcDate.getTime())) {
      return utcTimeStr // Return original if invalid
    }

    // Add 5 hours 30 minutes (5.5 hours) to UTC to get IST
    const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000)

    // Format the IST date
    const istTimeStr = istDate.toLocaleString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    return istTimeStr
  } catch (error) {
    console.error('Error converting time to IST:', error)
    return utcTimeStr // Return original in case of error
  }
}

// Get just the date part in IST
export const getISTDateKey = (utcTimeStr: string): string => {
  try {
    const utcDate = new Date(utcTimeStr)
    if (isNaN(utcDate.getTime())) {
      return utcTimeStr.split(' ')[0] // Fall back to splitting the string
    }

    // Add 5 hours 30 minutes to get IST
    const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000)

    // Format as DD/MM/YYYY
    const day = String(istDate.getUTCDate()).padStart(2, '0')
    const month = String(istDate.getUTCMonth() + 1).padStart(2, '0')
    const year = istDate.getUTCFullYear()

    return `${day}/${month}/${year}`
  } catch (error) {
    console.error('Error getting IST date key:', error)
    return utcTimeStr.split(' ')[0] // Fall back to splitting the string
  }
}

// Get the IST hour and minute for precise time grouping
export const getISTTimeComponents = (
  utcTimeStr: string,
): { hour: number; minute: number } => {
  try {
    const utcDate = new Date(utcTimeStr)

    if (isNaN(utcDate.getTime())) {
      return { hour: 0, minute: 0 } // Default values if invalid
    }

    // Get the IST date object by adding 5 hours and 30 minutes to UTC
    const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000)

    // Extract hours and minutes in UTC (which is now IST time due to our offset)
    return {
      hour: istDate.getUTCHours(),
      minute: istDate.getUTCMinutes(),
    }
  } catch (error) {
    console.error('Error getting IST time components:', error)
    return { hour: 0, minute: 0 }
  }
}

// Format a date with time in IST for display in a consistent format
export const formatISTDateTime = (utcTimeStr: string): string => {
  try {
    const utcDate = new Date(utcTimeStr)

    if (isNaN(utcDate.getTime())) {
      return utcTimeStr
    }

    // Add 5 hours 30 minutes to get IST
    const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000)

    // Format the IST date and time
    const formatted = istDate.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    return formatted
  } catch (error) {
    console.error('Error formatting IST date time:', error)
    return utcTimeStr
  }
}

// Alternative function that uses timezone conversion (keeping for reference)
export const convertToISTWithTimezone = (utcTimeStr: string): string => {
  try {
    const utcDate = new Date(utcTimeStr)

    if (isNaN(utcDate.getTime())) {
      console.log('Invalid date string:', utcTimeStr)
      return utcTimeStr
    }

    // This should work correctly with timezone conversion
    const istTimeStr = utcDate.toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    return istTimeStr
  } catch (error) {
    console.error('Error converting time to IST:', error)
    return utcTimeStr
  }
}
