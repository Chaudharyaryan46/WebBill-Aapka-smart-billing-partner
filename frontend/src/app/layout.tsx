import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "WebBill | Aapka Smart Billing Partner",
  description: "Ultra-fast billing POS for Indian businesses. Print bills, manage inventory & track sales in seconds.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body>
        <Toaster position="top-center" toastOptions={{ duration: 3000, style: { fontFamily: 'Poppins, sans-serif', fontWeight: 600 } }} />
        {children}
      </body>
    </html>
  );
}
