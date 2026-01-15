
import React, { createContext, useContext, useState, useCallback } from 'react'

interface SoundContextType {
  isSoundEnabled: boolean
  toggleSound: () => void
  muteSound: () => void
  unmuteSound: () => void
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true)

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => !prev)
  }, [])

  const muteSound = useCallback(() => {
    setIsSoundEnabled(false)
  }, [])

  const unmuteSound = useCallback(() => {
    setIsSoundEnabled(true)
  }, [])

  return (
    <SoundContext.Provider
      value={{
        isSoundEnabled,
        toggleSound,
        muteSound,
        unmuteSound,
      }}
    >
      {children}
    </SoundContext.Provider>
  )
}

export function useSoundContext() {
  const context = useContext(SoundContext)
  if (context === undefined) {
    throw new Error('useSoundContext must be used within a SoundProvider')
  }
  return context
}
