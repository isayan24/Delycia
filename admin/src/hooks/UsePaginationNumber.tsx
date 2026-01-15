export default function UsePaginationNumber({
  ordersToDisplay,
  currentPage,
}: any) {
  const ordersPerPage = 5;

  const totalPages = Math.ceil((ordersToDisplay?.length || 0) / ordersPerPage); //10 / 5 = 2
  const startIndex = (currentPage - 1) * ordersPerPage; // (1-1) * 5 = 0
  const endIndex = startIndex + ordersPerPage; // 0 + 5 = 5
  const currentOrders = ordersToDisplay?.slice(startIndex, endIndex) || [];
  const pages = [];
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) { // 2 <= 5
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i); // 1,2
    }
  } else {
    if (currentPage <= 3) { // 0 <= 3
      for (let i = 1; i <= 4; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push("ellipsis");
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push("ellipsis");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPages);
    }
  }

  return {
    pages,
    totalPages,
    currentOrders,
    currentPage,
    startIndex,
    endIndex,
  };
}
