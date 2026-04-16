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
      <body className="flex flex-col min-h-screen">
        <div className="flex-1">{children}</div>
        <footer className="py-4 text-center text-xs text-gray-400">
          <a
            href="https://github.com/AnsonHui6040"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-gray-600 transition-colors"
          >
            <Github size={14} />
            <span>Made by AnsonHui6040</span>
          </a>
        </footer>
      </body>
    </html>
  );
}
