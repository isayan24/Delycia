export default function CategoryTabs() {
    const categories = ["All", "Snacks", "Pizza", "Desserts", "Beverages", "Meals", "Salads"];
    
    return (
      <div className="flex justify-between mb-4 gap-2 overflow-hidden px-4">
        {categories.map((cat, index) => (
          <div key={cat} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full overflow-hidden mb-1 ${
                index === 0 ? "bg-orange-500" : "bg-gray-300"
              }`}
            >
              <div className="w-full h-full bg-orange-200 flex items-center justify-center text-xs">
                🍽️
              </div>
            </div>
            <span className="text-xs text-gray-700 truncate">{cat}</span>
          </div>
        ))}
      </div>
    );
  }