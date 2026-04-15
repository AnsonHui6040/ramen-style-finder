import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "拉麵口味風格",
  description: "逐步卡片式拉麵口味風格分類器",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
