import localFont from "next/font/local"
import PublicProviders from '@/src/providers/PublicProviders'
import { RoleInitializer } from '../providers/RoleInitializer';
import '@/src/styles/globals.css'

export const metadata = {
  title: 'Chronexa',
  description: 'Time & Attendance Management System',
  icons: { icon: '/favicon.ico' }
};

const poppins = localFont({
  src: [
    {
      path: "../../public/fonts/poppins/Poppins-Thin.ttf", weight: "100", style: "normal"
    },
    {
      path: "../../public/fonts/poppins/Poppins-ExtraLight.ttf", weight: "200", style: "normal"
    },
    {
      path: "../../public/fonts/poppins/Poppins-Light.ttf", weight: "300", style: "normal"
    },
    {
      path: "../../public/fonts/poppins/Poppins-Regular.ttf", weight: "400", style: "normal"
    },
    {
      path: "../../public/fonts/poppins/Poppins-Medium.ttf", weight: "500", style: "normal"
    },
    {
      path: "../../public/fonts/poppins/Poppins-SemiBold.ttf", weight: "600", style: "normal"
    },
    {
      path: "../../public/fonts/poppins/Poppins-Bold.ttf", weight: "700", style: "normal"
    },
    {
      path: "../../public/fonts/poppins/Poppins-ExtraBold.ttf", weight: "800", style: "normal"  
    }
  ],
  display: "swap",
});   

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={poppins.className} suppressHydrationWarning>
        <PublicProviders>
          <RoleInitializer />
          {children}
        </PublicProviders>
      </body>
    </html>
  )
}