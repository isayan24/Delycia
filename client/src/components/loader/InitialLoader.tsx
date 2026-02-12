'use client'
import { useState, useEffect } from 'react'
import { MultiStepLoader } from '@/components/ui/multi-step-loader'

const loadingStates = [
  {
    text: 'Heating up the ovens...',
  },
  {
    text: 'Chopping fresh vegetables...',
  },
  {
    text: 'Marinating the special sauce...',
  },
  {
    text: 'Plating your delicious experience...',
  },
  {
    text: 'Welcome to Delycia!',
  },
]

export const InitialLoader = () => {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if we've already shown the loader in this session
    const hasLoaded = sessionStorage.getItem('delycia_initial_load')

    if (!hasLoaded) {
      setLoading(true)
      // specific duration:
      // 6 states * 2000ms duration per state = 12000ms total
      // allow for loop to complete once
      const totalDuration = loadingStates.length * 1000

      const timer = setTimeout(() => {
        setLoading(false)
        sessionStorage.setItem('delycia_initial_load', 'true')
      }, totalDuration)

      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <MultiStepLoader
      loadingStates={loadingStates}
      loading={loading}
      duration={1000}
      loop={false}
    />
  )
}
