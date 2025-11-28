import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header" // Ensure this is the only place Header is rendered globally
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "American Professional Management Institute of Hospitality",
  description: "Certifications for the hospitality industry, especially cruise ships.",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Header /> {/* Render Header here once for all pages */}
          <main>{children}</main>
          <Toaster />
        </ThemeProvider>

        {/* Zoho SalesIQ Script */}
        <Script id="zoho-salesiq-init" strategy="afterInteractive">
          {`
            window.$zoho=window.$zoho || {};
            $zoho.salesiq=$zoho.salesiq||{ready:function(){}};
          `}
        </Script>
        <Script
          id="zsiqscript"
          src="https://salesiq.zohopublic.com/widget?wc=siq3fd10a26ef516a8d90a7389af5909cdc0f6efb7822c4cf5b85357a78da797eeb"
          defer
        />
      </body>
    </html>
  )
}
