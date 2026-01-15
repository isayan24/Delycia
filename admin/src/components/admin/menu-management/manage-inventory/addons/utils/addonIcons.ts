import {
  Utensils,
  Coffee,
  Pizza,
  Sandwich,
  Carrot,
  Beef,
  Cake,
  Soup,
  Beer,
  Wine,
  Croissant,
  Egg,
  Fish,
  IceCream,
  Popcorn,
  Salad,
  Apple,
  Banana,
  Cherry,
  Citrus,
  Grape,
  Nut,
  Wheat,
  Candy,
  Cookie,
} from "lucide-react";

export const foodIcons = [
  Utensils,
  Coffee,
  Pizza,
  Sandwich,
  Carrot,
  Beef,
  Cake,
  Soup,
  Beer,
  Wine,
  Croissant,
  Egg,
  Fish,
  IceCream,
  Popcorn,
  Salad,
  Apple,
  Banana,
  Cherry,
  Citrus,
  Grape,
  Nut,
  Wheat,
  Candy,
  Cookie,
];

/**
 * reliable hashing algorithm to choose an icon based on a string (id or name)
 * This ensures the same addon always gets the same icon
 */
export const getAddonIcon = (identifier: string) => {
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Ensure positive number
  hash = Math.abs(hash);

  const index = hash % foodIcons.length;
  return foodIcons[index];
};
