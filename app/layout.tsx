import type { ReactNode } from "react";
import { Github } from "lucide-react";
import "./globals.css";

export const metadata = {
  title: "拉麵口味風格",
  description: "逐步卡片式拉麵口味風格分類器",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Klee+One:wght@400;600&family=Noto+Sans+TC:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <div className="flex-1">{children}</div>
        <footer className="py-6 text-center border-t border-ink-soft/30 space-y-3">
          <p className="mx-auto max-w-xl px-4 text-xs leading-6 text-ink-faint">
            本平台會收集匿名化使用資料，例如拉麵分類結果、測驗選擇與推薦回饋，用於改善分類與推薦品質。本平台不收集姓名、電話、Email 等可直接識別個人的資料。
          </p>
          <a
            href="https://github.com/AnsonHui6040"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-code text-xs text-ink-faint tracking-wide hover:text-ink transition-colors"
          >
            <Github size={12} />
            <span>Made by AnsonHui6040</span>
          </a>
        </footer>
      </body>
    </html>
  );
}
