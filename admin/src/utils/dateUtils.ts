import { convertUTCToIST } from '@/components/admin/orders/utils/orderProcessing'

/**
 * Formats a date string or Date object to a consistent locale format (en-IN).
 * Example: "Feb 12, 2026, 11:03 PM"
 */
export const formatDateTime = (
  date: string | Date | undefined | null,
): string => {
  if (!date) return 'N/A'

  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'N/A'

    return d.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'N/A'
  }
}

export const formatTimeNew = (
  date: string | Date | undefined | null,
): string => {
  if (!date) return 'N/A'

  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return 'N/A'

    return d.toLocaleString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'N/A'
  }
}

/**
 * Calculates time elapsed since order was placed in minutes (handles UTC to IST conversion)
 */
export function calculateTimeElapsed(orderTime: string): number {
  try {
    // Parse the UTC order time
    // const orderDate = new Date(orderTime);

    const orderDate = convertUTCToIST(orderTime)
    // Get current time
    const now = new Date()

    // Calculate difference in milliseconds
    const diffInMs = now.getTime() - orderDate.getTime()

    // Convert to minutes
    return Math.floor(diffInMs / (1000 * 60))
  } catch (error) {
    console.error('Error calculating time elapsed:', error)
    return 0
  }
}

/**
 * Calculates remaining preparation time with precise seconds
 */
export function calculateRemainingTime(
  orderTime: string,
  prepTime: number,
  startTime?: string,
): { minutes: number; seconds: number; totalSeconds: number } {
  // Use preparation start time if available, otherwise use order time
  const baseTime = startTime || orderTime
  const baseDate = convertUTCToIST(baseTime)
  const now = new Date()

  // Calculate elapsed time in seconds
  const elapsedSeconds = Math.floor((now.getTime() - baseDate.getTime()) / 1000)
  const totalPrepSeconds = prepTime * 60
  const remainingSeconds = Math.max(0, totalPrepSeconds - elapsedSeconds)

  return {
    minutes: Math.floor(remainingSeconds / 60),
    seconds: remainingSeconds % 60,
    totalSeconds: remainingSeconds,
  }
}

/**
 * Formats remaining time as MM:SS
 */
export function formatRemainingTime(
  remainingTime: { minutes: number; seconds: number } | number,
): string {
  // Handle both old number format and new object format for backward compatibility
  if (typeof remainingTime === 'number') {
    if (remainingTime <= 0) return '00:00'
    const mins = Math.floor(remainingTime)
    const secs = Math.floor((remainingTime - mins) * 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const { minutes, seconds } = remainingTime
  if (minutes <= 0 && seconds <= 0) return '00:00'

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

/**
 // mark Formats time elapsed as "X mins ago" or "X hours ago"
 */
export function formatTimeElapsed(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} mins ago`
  } else {
    const hours = Math.floor(minutes / 60)
    const remainingMins = minutes % 60
    if (remainingMins === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      return `${hours}h ${remainingMins}m ago`
    }
  }
}
