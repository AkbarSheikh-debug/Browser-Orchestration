import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/ui/themes"
import { JetBrains_Mono, Space_Grotesk } from "next/font/google"

import "@clerk/ui/themes/shadcn.css"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

// The design's type pairing: Space Grotesk for UI, JetBrains Mono for the
// labels, tokens, durations, and JSON output.
const fontSans = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "dark antialiased",
        fontSans.variable,
        fontMono.variable,
        "font-sans"
      )}
    >
      <body>
        <ClerkProvider
          appearance={{ theme: dark }}
          afterSignOutUrl="/sign-in"
          taskUrls={{ "choose-organization": "/choose-organization" }}
        >
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
