import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/clear-cookies')({
  component: ClearCookiesPage,
})

function ClearCookiesPage() {
  const [cleared, setCleared] = useState(false)

  const clearAllCookies = () => {
    // Get all cookies
    const cookies = document.cookie.split(';')

    // Clear each cookie
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i]
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()
      
      // Clear for current path
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      
      // Clear for root domain
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
    }

    // Clear localStorage
    localStorage.clear()

    // Clear sessionStorage
    sessionStorage.clear()

    setCleared(true)

    // Reload after 2 seconds
    setTimeout(() => {
      window.location.href = '/'
    }, 2000)
  }

  const getCurrentCookies = () => {
    const cookies = document.cookie.split(';')
    return cookies.map(cookie => {
      const [name, value] = cookie.trim().split('=')
      return { name, value: value?.substring(0, 20) + '...' }
    }).filter(c => c.name)
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Clear Cookies & Storage</CardTitle>
          <CardDescription>
            Remove all cookies and local storage data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cleared ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                All cookies and storage cleared! Redirecting to home...
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will clear ALL cookies and storage data. You will be logged out.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h3 className="font-semibold">Current Cookies:</h3>
                <div className="bg-gray-100 p-4 rounded-md max-h-60 overflow-auto">
                  {getCurrentCookies().length > 0 ? (
                    <ul className="space-y-1 text-sm font-mono">
                      {getCurrentCookies().map((cookie, i) => (
                        <li key={i} className="break-all">
                          <span className="font-bold">{cookie.name}</span>: {cookie.value}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No cookies found</p>
                  )}
                </div>
              </div>

              <Button 
                onClick={clearAllCookies} 
                variant="destructive" 
                className="w-full"
              >
                Clear All Cookies & Storage
              </Button>

              <div className="text-sm text-gray-500 space-y-2">
                <p><strong>Note:</strong> If you see <code>admin_access_token</code> or <code>admin_refresh_token</code> cookies, these are from the admin site and should be cleared.</p>
                <p>The client app should only have:</p>
                <ul className="list-disc list-inside ml-4">
                  <li><code>access_token</code></li>
                  <li><code>refresh_token</code></li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
