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
    <div className="border-t bg-gray-50 px-2 py-3 space-y-2">
      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrevPage}
            disabled={!hasPrevPage || loading}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
        </div>

        <div className="flex items-center gap-1">
          {pageNumbers[0] > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(1)}
                disabled={loading}
              >
                1
              </Button>
              {pageNumbers[0] > 2 && <span className="px-2">...</span>}
            </>
          )}

          {pageNumbers.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              disabled={loading}
            >
              {page}
            </Button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="px-2">...</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages)}
                disabled={loading}
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={!hasNextPage || loading}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Page Info - Centered below */}
      <div className="text-sm text-gray-600 text-center">
        Page {currentPage} of {totalPages}
        {totalOrders !== undefined && perPage && (
          <span className="ml-2">
            (Showing {Math.min((currentPage - 1) * perPage + 1, totalOrders)}-
            {Math.min(currentPage * perPage, totalOrders)} of {totalOrders})
          </span>
        )}
      </div>
    </div>
  )
}
