import localFont from "next/font/local"
import PublicProviders from '@/src/providers/PublicProviders'
import { RoleInitializer } from '../providers/RoleInitializer';
import '@/src/styles/globals.css'

export const metadata = {
  title: 'Chronexa',
  description: 'Time & Attendance Management System',
  icons: { icon: '/favicon.ico' }
};

// Self-hosted fonts (no Google Fonts fetch at build time).
// Files live in public/fonts/ — paths here are relative to this layout file.
const plusJakartaSans = localFont({
  src: [
    { path: "../../public/fonts/PlusJakartaSans-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/PlusJakartaSans-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/PlusJakartaSans-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/PlusJakartaSans-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/PlusJakartaSans-ExtraBold.ttf", weight: "800", style: "normal" },
  ],
  display: "swap",
  variable: "--font-latin",
});

const cairo = localFont({
  src: [
    { path: "../../public/fonts/Cairo-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/Cairo-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/Cairo-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/Cairo-Bold.ttf", weight: "700", style: "normal" },
    { path: "../../public/fonts/Cairo-ExtraBold.ttf", weight: "800", style: "normal" },
  ],
  display: "swap",
  variable: "--font-arabic",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} ${cairo.variable} ${plusJakartaSans.className}`} suppressHydrationWarning>
        <PublicProviders>
          <RoleInitializer />
          {children}
        </PublicProviders>
      </body>
    </html>
  )
}