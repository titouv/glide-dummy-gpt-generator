import "./globals.css"

export const metadata = {
  title: "Glide dummy data GPT",
  description: "Generate dummy data for your Glide Apps easily with GPT-4",
}
import { Inter } from "next/font/google"
import localFont from "next/font/local"

const calSans = localFont({
  src: "../../fonts/CalSans-SemiBold.woff2",
  display: "swap",
  variable: "--font-cal",
})

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${calSans.variable} bg-gray-950 text-white antialiased`}
        style={inter.style}
      >
        {children}
      </body>
    </html>
  )
}
