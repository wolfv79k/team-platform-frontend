import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import "./globals.css";
import { cn } from "@/shared/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['cyrillic-ext'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <head>
      </head>
      <body className={plusJakarta.className}>
        {children}
      </body>
    </html>
  );
}