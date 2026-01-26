import CategorySIdebarSmall from "@/components/category/CategorySIdebarSmall";
import CategoryWrapper from "@/components/category/CategoryWrapper";
import type { Metadata } from "next";
// import "../globals.css";

export const metadata: Metadata = {
  title: "Delycia",
  description: "Restaurant management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex">
      <CategoryWrapper /> 
      <div className="w-full">{children}</div>
    </div>
  );
}
