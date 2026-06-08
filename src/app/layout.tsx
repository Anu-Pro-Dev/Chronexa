import { Plus_Jakarta_Sans } from "next/font/google"
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
});   

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={plusJakartaSans.className} suppressHydrationWarning>
        <PublicProviders>
          <RoleInitializer />
          {children}
        </PublicProviders>
      </body>
    </html>
  )
}