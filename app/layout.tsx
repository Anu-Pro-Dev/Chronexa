// import type { Metadata } from "next";
// import { Nunito_Sans } from "next/font/google";
// import "./globals.css";
// import Providers from "@/providers/Providers";
// import { PunchProvider } from "@/providers/PunchProvider";

// const font_nunito_sans = Nunito_Sans({
//   variable: "--font-nunito_sans",
//   subsets: ["latin", "latin-ext"],
//   weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
// });

// export const metadata: Metadata = {
//   title: "Chronexa",
//   description: "",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body
//         className={`${font_nunito_sans.className} ${font_nunito_sans.variable} antialiased`}
//       >
//         <Providers>
//           <PunchProvider>
//             {children}
//           </PunchProvider>
//         </Providers>
//       </body>
//     </html>
//   );
// }

import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/Providers";
import { PunchProvider } from "@/providers/PunchProvider";

const font_nunito_sans = Nunito_Sans({
  variable: "--font-nunito_sans",
  subsets: ["latin", "latin-ext"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
});

export const metadata: Metadata = {
  title: "Chronexa",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${font_nunito_sans.className} ${font_nunito_sans.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <PunchProvider>
            {children}
          </PunchProvider>
        </Providers>
      </body>
    </html>
  );
}
