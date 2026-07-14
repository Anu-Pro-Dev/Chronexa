import { Plus_Jakarta_Sans, Cairo } from "next/font/google"
import PublicProviders from '@/src/providers/PublicProviders'
import { RoleInitializer } from '../providers/RoleInitializer';
import '@/src/styles/globals.css'

export const metadata = {
  title: 'Chronexa',
  description: 'Time & Attendance Management System',
  icons: { icon: '/favicon.ico' }
};

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-latin",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
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