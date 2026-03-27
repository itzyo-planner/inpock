import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "itzyo | 잇지요",
  description: "itzyo 잇지요 링크 모음",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
