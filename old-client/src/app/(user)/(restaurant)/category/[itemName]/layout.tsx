import CategorySIdebarSmall from "@/components/category/CategorySIdebarSmall";
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
    <div>
      <div>{children}</div>
    </div>
  );
}
