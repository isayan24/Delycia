// import { Check } from 'lucide-react'
// import { cn } from '@/lib/utils'

// const STEPS = [
//   { label: 'Select Table' },
//   { label: 'Add Items' },
//   { label: 'Preview' },
//   { label: 'Confirm' },
// ] as const

// interface BookTableStepperProps {
//   currentStep: number
//   onStepClick?: (step: number) => void
// }

// export default function BookTableStepper({
//   currentStep,
//   onStepClick,
// }: BookTableStepperProps) {
//   return (
//     <div className="w-full max-w-2xl mx-auto px-2">
//       <div className="flex items-center">
//         {STEPS.map((step, index) => {
//           const isCompleted = index < currentStep
//           const isActive = index === currentStep
//           const isClickable = isCompleted && onStepClick

//           return (
//             <div
//               key={step.label}
//               className="flex items-center flex-1 last:flex-none"
//             >
//               {/* Step Circle + Label */}
//               <div className="flex flex-col items-center gap-1.5">
//                 <button
//                   type="button"
//                   disabled={!isClickable}
//                   onClick={() => isClickable && onStepClick(index)}
//                   className={cn(
//                     'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0',
//                     isCompleted &&
//                       'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 cursor-pointer hover:bg-emerald-600',
//                     isActive &&
//                       'bg-primary text-primary-foreground shadow-md shadow-primary/30 ring-4 ring-primary/15',
//                     !isCompleted &&
//                       !isActive &&
//                       'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-default',
//                   )}
//                 >
//                   {isCompleted ? (
//                     <Check className="w-4 h-4" strokeWidth={3} />
//                   ) : (
//                     index + 1
//                   )}
//                 </button>
//                 <span
//                   className={cn(
//                     'text-[11px] font-medium whitespace-nowrap transition-colors duration-300',
//                     isActive && 'text-primary font-semibold',
//                     isCompleted && 'text-emerald-600 dark:text-emerald-400',
//                     !isCompleted &&
//                       !isActive &&
//                       'text-gray-400 dark:text-gray-500',
//                   )}
//                 >
//                   {step.label}
//                 </span>
//               </div>

//               {/* Connector Line */}
//               {index < STEPS.length - 1 && (
//                 <div className="flex-1 h-0.5 mx-2 mb-5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
//                   <div
//                     className={cn(
//                       'h-full rounded-full transition-all duration-500 ease-out',
//                       index < currentStep
//                         ? 'w-full bg-emerald-500'
//                         : 'w-0 bg-primary',
//                     )}
//                   />
//                 </div>
//               )}
//             </div>
//           )
//         })}
//       </div>
//     </div>
//   )
// }

// export { STEPS }
