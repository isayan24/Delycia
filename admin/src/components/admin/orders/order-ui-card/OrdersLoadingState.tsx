import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function OrdersLoadingState() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Order Cards Skeleton */}
      <div className="grid gap-4">
        {[1].map((i) => (
          <Card key={i} className="w-full !border-none mx-auto">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Platform header */}
              <Skeleton className="h-12 w-full" />
              
              {/* Order info */}
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
              
              {/* Items */}
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
              
              {/* Summary */}
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
              
              {/* Prep time */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-48" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-3">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}