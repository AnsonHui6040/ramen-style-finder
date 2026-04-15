import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FEATURED_TYPE_PROFILES } from "@/data/typeProfiles";


export default function TypePreviewSection() {
  return (
    <section className="space-y-6 px-4 pb-10 md:px-6 md:pb-14">
      <div className="mx-auto max-w-6xl space-y-3">
        <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm">
          先看看有哪些口味風格
        </Badge>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            不是只分牛、豬、鴨，而是先看你整體偏哪一型
          </h2>
          <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
            你最後拿到的，不只是一碗最像的拉麵，還會知道自己整體偏清爽還是濃厚、白湯還是清湯、細滑還是粗嚼，然後再落到最接近你的幾種實際風格。
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-3">
        {FEATURED_TYPE_PROFILES.map((profile) => (
          <Link key={profile.code} href={`/types/${profile.code}`} className="block">
            <Card className="h-full rounded-2xl border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Badge className="rounded-full px-3 py-1 text-sm">{profile.code}</Badge>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs">{profile.family}</Badge>
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900">{profile.name}</CardTitle>
                  <CardDescription className="mt-1">{profile.short}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm font-medium text-slate-900">
                  看完整介紹
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row">
        <Button asChild className="rounded-xl">
          <Link href="/types">看全部口味風格</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/types?featured=1">只看代表型</Link>
        </Button>
      </div>
    </section>
  );
}
