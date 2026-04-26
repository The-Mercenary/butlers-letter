import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Butler's Letter | 프라이빗 인맥 추천 서비스",
    template: "%s | Butler's Letter",
  },
  description: "Butler's Letter는 원하는 목적에 맞는 사람을 신중하게 추천받고, 서로 동의한 경우에만 연락처를 공개하는 서비스입니다.",
  openGraph: {
    title: "Butler's Letter | 프라이빗 인맥 추천 서비스",
    description: "원하는 목적에 맞는 사람을 신중하게 추천받고, 서로 동의한 경우에만 연락처를 공개하는 서비스입니다.",
    type: "website",
    locale: "ko_KR",
    siteName: "Butler's Letter",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
