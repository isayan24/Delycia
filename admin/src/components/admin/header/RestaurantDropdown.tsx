import { useRestaurantSelector } from "@/hooks/useRestaurantSelector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Store, Loader2, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const RestaurantDropdown = () => {
  const { 
    selectedRid, 
    restaurantRids, 
    restaurants,
    selectedRestaurant,
    allRestaurants,
    updateSelectedRestaurant, 
    getRestaurantName,
    isUpdating,
    isLoadingRestaurants 
  } = useRestaurantSelector();

  const handleRestaurantChange = (value: string) => {
    if (value && value !== selectedRid) {
      console.log(value, 'value of restaurant');
      updateSelectedRestaurant(value);
    }
  };

  const getSelectedRestaurantLabel = () => {
    if (!selectedRid) return "Select a restaurant...";
    
    const restaurant = selectedRestaurant;
    if (restaurant) {
      // Show name and city if available
      const location = restaurant.city ? ` - ${restaurant.city}` : '';
      return `${restaurant.name}${location}`;
    }
    
    return getRestaurantName(selectedRid);
  };

  // Show skeleton loader while loading restaurant details
  if (isLoadingRestaurants && restaurantRids.length > 0) {
    return (
      <div className="flex flex-col space-y-2 min-w-[200px]">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-1 min-w-[200px]">
      <div className="relative">
        <Select
          value={selectedRid || ""}
          onValueChange={handleRestaurantChange}
          disabled={isUpdating || restaurantRids.length === 0}
        >
          <SelectTrigger
            id="restaurant-select"
            className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 focus:border-primary dark:focus:border-primary transition-colors"
          >
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <SelectValue placeholder="Select a restaurant...">
                <span className="truncate">{getSelectedRestaurantLabel()}</span>
              </SelectValue>
            </div>
          </SelectTrigger>

          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-sm">
            {restaurantRids.length === 0 ? (
              <SelectItem value="None" disabled className="text-gray-500 dark:text-gray-400">
                No restaurants available
              </SelectItem>
            ) : (
              allRestaurants.map((restaurant) => (
                <SelectItem
                  key={restaurant.id}
                  value={restaurant.id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                >
                  <div className="flex flex-col items-start gap-1 py-1">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <span className="font-medium">{restaurant.name}</span>
                    </div>
                    {/* {restaurant.city && (
                      <div className="flex items-center gap-2 ml-6">
                        <MapPin className="h-3 w-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {restaurant.city}
                          {restaurant.state && `, ${restaurant.state}`}
                        </span>
                      </div>
                    )} */}
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {isUpdating && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}
      </div>

      {isUpdating && (
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          Switching to {selectedRid ? getRestaurantName(selectedRid) : 'restaurant'}...
        </div>
      )}

      {/* Optional: Show selected restaurant details */}
      {selectedRestaurant && !isUpdating && (
        <div className="text-xs text-gray-600 dark:text-gray-400 pl-1">
          {selectedRestaurant.address && (
            <div className="flex items-start gap-1">
              <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-1">{selectedRestaurant.address}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};