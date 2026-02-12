import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onNextPage: () => void
  onPrevPage: () => void
  hasNextPage: boolean
  hasPrevPage: boolean
  loading?: boolean
  totalOrders?: number
  perPage?: number
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  onNextPage,
  onPrevPage,
  hasNextPage,
  hasPrevPage,
  loading = false,
  totalOrders,
  perPage,
}: TablePaginationProps) {
  // Calculate page range to show
  const getPageNumbers = () => {
    const pages: number[] = []
    const maxPagesToShow = 5
    const half = Math.floor(maxPagesToShow / 2)

    let start = Math.max(1, currentPage - half)
    let end = Math.min(totalPages, start + maxPagesToShow - 1)

    // Adjust start if we're near the end
    if (end - start < maxPagesToShow - 1) {
      start = Math.max(1, end - maxPagesToShow + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="border-t border-gray-100 bg-white px-4 py-3 flex items-center justify-between">
      {/* Page Info */}
      <div className="text-xs sm:text-sm text-gray-500 font-medium">
        <span className="bg-gray-100 px-2 py-1 rounded-lg mr-2">
          Page {currentPage} of {totalPages}
        </span>
        {totalOrders !== undefined && perPage && (
          <span className="hidden sm:inline text-gray-400">
            • Showing {Math.min((currentPage - 1) * perPage + 1, totalOrders)}-
            {Math.min(currentPage * perPage, totalOrders)} of {totalOrders}
          </span>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={!hasPrevPage || loading}
          className="h-9 w-9 p-0 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="sr-only">Previous</span>
        </Button>

        <div className="hidden sm:flex items-center gap-1.5">
          {pageNumbers[0] > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(1)}
                disabled={loading}
                className="h-9 w-9 p-0 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
              >
                1
              </Button>
              {pageNumbers[0] > 2 && (
                <span className="px-1 text-gray-400 font-bold">...</span>
              )}
            </>
          )}

          {pageNumbers.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              disabled={loading}
              className={`h-9 w-9 p-0 rounded-xl transition-all font-semibold ${
                currentPage === page
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-sm shadow-emerald-200'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {page}
            </Button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="px-1 text-gray-400 font-bold">...</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages)}
                disabled={loading}
                className="h-9 w-9 p-0 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!hasNextPage || loading}
          className="h-9 w-9 p-0 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all"
        >
          <ChevronRight className="w-4 h-4" />
          <span className="sr-only">Next</span>
        </Button>
      </div>
    </div>
  )
}
