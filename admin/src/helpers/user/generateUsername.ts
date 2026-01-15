export const generateUsername = (name: string) => {
  if (!name.trim()) return "";
  const cleanName = name.trim().toLowerCase().replace(/\s+/g, "");
  const randomNum = Math.floor(Math.random() * 9000) + 1000; // 4-digit random number
  return `${cleanName}${randomNum}`;
};
