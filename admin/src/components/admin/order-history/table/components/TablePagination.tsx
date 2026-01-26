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
    <div className="border-t bg-white px-4 pt-2 flex items-center justify-between">
      {/* Page Info */}
      <div className="text-sm text-gray-500">
        Page {currentPage} of {totalPages}
        {totalOrders !== undefined && perPage && (
          <span className="hidden sm:inline ml-1">
            • Showing {Math.min((currentPage - 1) * perPage + 1, totalOrders)}-
            {Math.min(currentPage * perPage, totalOrders)} of {totalOrders}
          </span>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={!hasPrevPage || loading}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="sr-only">Previous</span>
        </Button>

        <div className="flex items-center gap-1">
          {pageNumbers[0] > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(1)}
                disabled={loading}
                className="h-8 w-8 p-0"
              >
                1
              </Button>
              {pageNumbers[0] > 2 && (
                <span className="px-1 text-gray-400">...</span>
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
              className="h-8 w-8 p-0"
            >
              {page}
            </Button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="px-1 text-gray-400">...</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages)}
                disabled={loading}
                className="h-8 w-8 p-0"
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
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="w-4 h-4" />
          <span className="sr-only">Next</span>
        </Button>
      </div>
    </div>
  )
}
