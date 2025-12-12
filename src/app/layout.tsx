import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/hook/providers";
import Menu from "@/component/menu/Menu";
import Footer from "@/component/footer/page";
import { ToastContainer } from "react-toastify";
import ScrollTop from "@/component/scrollTop/scroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hoang Binh Dental Clinic",
  description: "Nha khoa Hoang Binh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/LOGO/tooth.png" sizes="any"  />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
            <Providers>
              <Menu />
              <ToastContainer />
              {children}
              <ScrollTop />
              <Footer />
            </Providers>
      </body>
    </html>
  );
}
