"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "ramen-classifier-state";

export function HomeButton() {
  const [hasResult, setHasResult] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.currentState === "RESULT_VIEW") setHasResult(true);
      }
    } catch {}
  }, []);

  return (
    <Button asChild className="rounded-xl">
      <Link href="/">{hasResult ? "回到你的分類" : "回首頁開始分類"}</Link>
    </Button>
  );
}
