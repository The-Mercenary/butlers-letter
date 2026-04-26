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
    default: "Butler's Letter | 결혼을 전제로 한 프라이빗 매칭 레터",
    template: "%s | Butler's Letter",
  },
  description: "Butler's Letter는 결혼을 진지하게 생각하는 사람들을 위한 프라이빗 프로필 기반 매칭 레터 서비스입니다.",
  openGraph: {
    title: "Butler's Letter | 결혼을 전제로 한 프라이빗 매칭 레터",
    description: "결혼을 진지하게 생각하는 사람들을 위한 프라이빗 프로필 기반 매칭 레터 서비스입니다.",
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
