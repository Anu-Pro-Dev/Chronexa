import '@/src/styles/globals.css'
import localFont from "next/font/local"
import PublicProviders from '@/src/providers/PublicProviders'
import { RoleInitializer } from '../providers/RoleInitializer';

export const metadata = {
  title: 'Federal Geographic Information Center',
  description: 'Time & Attendance Management System',
  icons: { icon: '/favicon.ico' }
};

const NunitoSans = localFont({
  src: [
    {
      path: "../../public/fonts/nunito-sans/NunitoSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/nunito-sans/NunitoSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/nunito-sans/NunitoSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/nunito-sans/NunitoSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/nunito-sans/NunitoSans-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={NunitoSans.className} suppressHydrationWarning>
        <PublicProviders>
          <RoleInitializer />
          {children}
        </PublicProviders>
      </body>
    </html>
  )
}