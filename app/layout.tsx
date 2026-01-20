import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/shared/query-provider";

export const metadata: Metadata = {
  title: "Admin GoGadget",
  description: "Bookstore",
};

const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
