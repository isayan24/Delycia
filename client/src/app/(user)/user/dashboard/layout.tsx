import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cuisine Dashboard",
  description: "Dashboard of the user",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0 text-white">
      {children}  
    </div>
  );
}
