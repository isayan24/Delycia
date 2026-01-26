import React from 'react'
import { Skeleton } from '../ui/skeleton'

export default function FoodSkeleton() {
  return (
    <main  className="border rounded-xl w-[15rem] h-[25rem] flex flex-col p-1  max-[700px]:w-[30rem] max-[700px]:flex-row-reverse max-[700px]:h-[12rem] max-[700px]:border-none max-[700px]:shadow-none max-[700px]:mx-auto max-[500px]:w-[100%] relative max-[700px]:justify-between border-[#f5f5f5] ">
      
      <section className="w-full h-[60%] rounded-xl bg-[#f5f5f5] max-[700px]:w-[10rem] max-[700px]:h-[10rem] shrink-0 max-[500px]:w-[8rem] max-[500px]:h-[7rem] max-[500px]:mr-2">
        <Skeleton className="w-full h-full rounded-xl bg-[#f5f5f5]" />
      </section>

      <section className="p-2 flex flex-col h-[40%] justify-between">
        <div>
          <Skeleton className="h-6 w-3/4 mb-2 max-[350px]:w-[6rem] bg-[#f5f5f5]" />
          <Skeleton className="h-4 w-full mb-1 max-[350px]:w-[7rem] bg-[#f5f5f5]" />
          <Skeleton className="h-4 w-2/3 max-[350px]:w-[5rem] bg-[#f5f5f5]" />
        </div>
        <div className="flex justify-between items-center mt-2 gap-2">
          <Skeleton className="h-6 w-16 bg-[#f5f5f5]" />
          <Skeleton className="h-8 w-24 rounded-[13px] max-[350px]:w-[60%] bg-[#f5f5f5]" />
        </div>
      </section>
    </main>
  )
}
