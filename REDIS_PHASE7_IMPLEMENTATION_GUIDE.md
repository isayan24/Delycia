# Phase 7: Multi-Device Session Management - Implementation Guide

## Overview
This guide provides complete implementation instructions for the Multi-Device Session Management UI. Use this when you're ready to implement this feature in your superadmin panel.

**Note:** The backend endpoints already exist from Phase 3. This phase is 100% frontend work.

---

## Backend Endpoints (Already Available)

These endpoints are already implemented and working:

### 1. Get All User Sessions
```
GET /api/v1/sessions
Authorization: Bearer {access_token}
Cookie: admin_refresh_token={refresh_token}

Response:
{
  "status": true,
  "data": {
    "sessions": [
      {
        "sessionId": "abc-123",
        "userId": 1,
        "deviceType": "Desktop",
        "browser": "Chrome",
        "os": "macOS",
        "ip": "192.168.1.1",
        "createdAt": "2026-01-20T10:00:00.000Z",
        "lastActivity": "2026-02-20T10:00:00.000Z",
        "lastRefresh": "2026-02-20T09:55:00.000Z",
        "expiresAt": "2026-03-22T10:00:00.000Z",
        "isCurrent": true
      },
      {
        "sessionId": "def-456",
        "userId": 1,
        "deviceType": "Mobile",
        "browser": "Safari",
        "os": "iOS",
        "ip": "192.168.1.2",
        "createdAt": "2026-02-19T10:00:00.000Z",
        "lastActivity": "2026-02-19T15:00:00.000Z",
        "lastRefresh": "2026-02-19T14:55:00.000Z",
        "expiresAt": "2026-03-21T10:00:00.000Z",
        "isCurrent": false
      }
    ],
    "total": 2
  }
}
```

### 2. Logout from Specific Session
```
DELETE /api/v1/sessions/:sessionId
Authorization: Bearer {access_token}

Response:
{
  "status": true,
  "message": "Session deleted successfully"
}
```

### 3. Logout from All Sessions (Except Current)
```
DELETE /api/v1/sessions/all/logout
Authorization: Bearer {access_token}
Cookie: admin_refresh_token={refresh_token}

Response:
{
  "status": true,
  "message": "Logged out from 3 device(s)",
  "data": {
    "deletedCount": 3
  }
}
```

---

## Frontend Implementation

### Step 1: Create Sessions Hook

Create `src/hooks/useUserSessions.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export interface UserSession {
  sessionId: string
  userId: number
  deviceType: 'Desktop' | 'Mobile' | 'Tablet'
  browser: string
  os: string
  ip: string
  createdAt: string
  lastActivity: string
  lastRefresh: string
  expiresAt: string
  isCurrent: boolean
}

interface SessionsResponse {
  status: boolean
  data: {
    sessions: UserSession[]
    total: number
  }
}

/**
 * Hook to fetch and manage user sessions
 */
export function useUserSessions() {
  const queryClient = useQueryClient()

  // Fetch all sessions
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: async () => {
      const baseUrl = typeof window === 'undefined' 
        ? (process.env.VITE_APP_URL || 'http://localhost:4500')
        : ''
      
      const response = await axios.get<SessionsResponse>(
        `${baseUrl}/api/v1/sessions`,
        {
          withCredentials: true,
          timeout: 10000,
        }
      )

      return response.data.data
    },
    refetchInterval: 60000, // Refetch every minute
  })

  // Logout from specific session
  const logoutFromSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const baseUrl = typeof window === 'undefined' 
        ? (process.env.VITE_APP_URL || 'http://localhost:4500')
        : ''
      
      const response = await axios.delete(
        `${baseUrl}/api/v1/sessions/${sessionId}`,
        {
          withCredentials: true,
          timeout: 10000,
        }
      )

      return response.data
    },
    onSuccess: () => {
      // Refetch sessions after logout
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
    },
  })

  // Logout from all sessions
  const logoutFromAllSessions = useMutation({
    mutationFn: async () => {
      const baseUrl = typeof window === 'undefined' 
        ? (process.env.VITE_APP_URL || 'http://localhost:4500')
        : ''
      
      const response = await axios.delete(
        `${baseUrl}/api/v1/sessions/all/logout`,
        {
          withCredentials: true,
          timeout: 10000,
        }
      )

      return response.data
    },
    onSuccess: () => {
      // Refetch sessions after logout
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] })
    },
  })

  return {
    sessions: data?.sessions ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
    refetch,
    logoutFromSession: logoutFromSession.mutate,
    logoutFromAllSessions: logoutFromAllSessions.mutate,
    isLoggingOut: logoutFromSession.isPending || logoutFromAllSessions.isPending,
  }
}
```

### Step 2: Create Session Card Component

Create `src/components/SessionCard.tsx`:

```typescript
import { formatDistanceToNow } from 'date-fns'
import { Monitor, Smartphone, Tablet, Chrome, Firefox, Safari, Apple, Windows, LogOut } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import type { UserSession } from '../hooks/useUserSessions'

interface SessionCardProps {
  session: UserSession
  onLogout: (sessionId: string) => void
  isLoggingOut: boolean
}

/**
 * Get device icon based on device type
 */
function getDeviceIcon(deviceType: string) {
  switch (deviceType) {
    case 'Mobile':
      return <Smartphone className="h-5 w-5" />
    case 'Tablet':
      return <Tablet className="h-5 w-5" />
    default:
      return <Monitor className="h-5 w-5" />
  }
}

/**
 * Get browser icon based on browser name
 */
function getBrowserIcon(browser: string) {
  if (browser.includes('Chrome')) return <Chrome className="h-4 w-4" />
  if (browser.includes('Firefox')) return <Firefox className="h-4 w-4" />
  if (browser.includes('Safari')) return <Safari className="h-4 w-4" />
  return null
}

/**
 * Get OS icon based on OS name
 */
function getOSIcon(os: string) {
  if (os.includes('Windows')) return <Windows className="h-4 w-4" />
  if (os.includes('macOS') || os.includes('iOS')) return <Apple className="h-4 w-4" />
  return null
}

/**
 * Session Card Component
 * 
 * Displays a single session with device info, location, and logout button
 */
export function SessionCard({ session, onLogout, isLoggingOut }: SessionCardProps) {
  const lastActivityTime = formatDistanceToNow(new Date(session.lastActivity), { addSuffix: true })

  return (
    <Card className={session.isCurrent ? 'border-primary' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              {getDeviceIcon(session.deviceType)}
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {session.deviceType}
                {session.isCurrent && (
                  <Badge variant="default" className="text-xs">
                    Current
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                {getBrowserIcon(session.browser)}
                <span>{session.browser}</span>
                <span>•</span>
                {getOSIcon(session.os)}
                <span>{session.os}</span>
              </CardDescription>
            </div>
          </div>
          {!session.isCurrent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLogout(session.sessionId)}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>IP Address:</span>
            <span className="font-mono">{session.ip}</span>
          </div>
          <div className="flex justify-between">
            <span>Last Activity:</span>
            <span>{lastActivityTime}</span>
          </div>
          <div className="flex justify-between">
            <span>Created:</span>
            <span>{formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Step 3: Create Sessions Page

Create `src/routes/settings/sessions.tsx`:

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { useUserSessions } from '../../hooks/useUserSessions'
import { SessionCard } from '../../components/SessionCard'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { AlertCircle, LogOut, RefreshCw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert'

export const Route = createFileRoute('/settings/sessions')({
  component: SessionsPage,
})

function SessionsPage() {
  const {
    sessions,
    total,
    isLoading,
    error,
    refetch,
    logoutFromSession,
    logoutFromAllSessions,
    isLoggingOut,
  } = useUserSessions()

  const handleLogoutAll = () => {
    if (confirm('Are you sure you want to logout from all other devices?')) {
      logoutFromAllSessions()
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load sessions. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const otherSessions = sessions.filter(s => !s.isCurrent)

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Active Sessions</h1>
        <p className="text-muted-foreground mt-2">
          Manage your active sessions across all devices
        </p>
      </div>

      {/* Current Session */}
      <Card>
        <CardHeader>
          <CardTitle>Current Session</CardTitle>
          <CardDescription>
            This is the device you're currently using
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.filter(s => s.isCurrent).map(session => (
            <SessionCard
              key={session.sessionId}
              session={session}
              onLogout={logoutFromSession}
              isLoggingOut={isLoggingOut}
            />
          ))}
        </CardContent>
      </Card>

      {/* Other Sessions */}
      {otherSessions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Other Sessions</CardTitle>
                <CardDescription>
                  {otherSessions.length} other active {otherSessions.length === 1 ? 'session' : 'sessions'}
                </CardDescription>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogoutAll}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {otherSessions.map(session => (
              <SessionCard
                key={session.sessionId}
                session={session}
                onLogout={logoutFromSession}
                isLoggingOut={isLoggingOut}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Other Sessions */}
      {otherSessions.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Other Sessions</CardTitle>
            <CardDescription>
              No other active sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You're only logged in on this device.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  )
}
```

### Step 4: Add Navigation Link

Add a link to the sessions page in your settings navigation:

```typescript
// In your settings layout or navigation component
<Link to="/settings/sessions">
  <Monitor className="h-4 w-4 mr-2" />
  Active Sessions
</Link>
```

---

## Dependencies

Make sure you have these packages installed:

```bash
npm install date-fns
# or
pnpm add date-fns
```

---

## Testing Checklist

- [ ] Sessions page loads successfully
- [ ] Current session is marked with "Current" badge
- [ ] Device icons display correctly (Desktop, Mobile, Tablet)
- [ ] Browser and OS icons display correctly
- [ ] Last activity shows relative time (e.g., "2 hours ago")
- [ ] IP address is displayed
- [ ] "Logout" button works for specific session
- [ ] "Logout All" button works
- [ ] Confirmation dialog appears before logout all
- [ ] Page refreshes after logout
- [ ] Current session cannot be logged out
- [ ] Sessions auto-refresh every minute
- [ ] Manual refresh button works
- [ ] Loading state displays correctly
- [ ] Error state displays correctly
- [ ] Responsive design works on mobile

---

## Customization Options

### Change Auto-Refresh Interval

In `useUserSessions.ts`:

```typescript
refetchInterval: 30000, // 30 seconds instead of 60
```

### Custom Device Icons

Add more device types in `SessionCard.tsx`:

```typescript
function getDeviceIcon(deviceType: string) {
  switch (deviceType) {
    case 'Mobile':
      return <Smartphone className="h-5 w-5" />
    case 'Tablet':
      return <Tablet className="h-5 w-5" />
    case 'Laptop':
      return <Laptop className="h-5 w-5" />
    case 'TV':
      return <Tv className="h-5 w-5" />
    default:
      return <Monitor className="h-5 w-5" />
  }
}
```

### Add Location Info

If you have a geolocation service, you can add location info:

```typescript
<div className="flex justify-between">
  <span>Location:</span>
  <span>{session.city}, {session.country}</span>
</div>
```

---

## Security Considerations

1. **Current Session Protection:**
   - Current session cannot be logged out from this page
   - User must use the main logout button

2. **Confirmation Dialogs:**
   - Always confirm before "Logout All"
   - Prevents accidental logouts

3. **Session Validation:**
   - Backend validates session ownership
   - Users can only logout their own sessions

4. **Auto-Refresh:**
   - Sessions list refreshes every minute
   - Shows real-time session status

---

## Troubleshooting

### Sessions Not Loading

1. Check if backend is running
2. Check if Redis is running
3. Verify cookies are being sent
4. Check browser console for errors

### Logout Not Working

1. Check if session ID is correct
2. Verify user has permission
3. Check backend logs
4. Verify Redis connection

### Icons Not Displaying

1. Install lucide-react: `pnpm add lucide-react`
2. Check import paths
3. Verify icon names

---

## Files to Create

1. `src/hooks/useUserSessions.ts` - Sessions hook
2. `src/components/SessionCard.tsx` - Session card component
3. `src/routes/settings/sessions.tsx` - Sessions page
4. Add navigation link to settings menu

---

## Estimated Time

- Hook creation: 30 minutes
- Session card component: 30 minutes
- Sessions page: 1 hour
- Testing: 30 minutes
- **Total: 2-3 hours**

---

**Ready to implement when you need it!** 🚀

Save this guide and share it with me when you're ready to implement Phase 7 in your superadmin panel.
