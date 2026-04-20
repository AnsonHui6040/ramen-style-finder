import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HomeButton } from "@/components/ramen/HomeButton";
import {
  getNeighborProfiles,
  getTypeProfile,
  isTypeCode,
  type TypeCode,
} from "@/data/typeProfiles";
import { RAMEN_PROTOTYPES } from "@/data/prototypes";

interface TypeDetailPageProps {
  params: Promise<{ code: string }>;
}

function axisChip(label: string) {
  return (
    <span className="border border-ink-soft bg-paper-deep px-2.5 py-1 font-code text-xs font-medium text-ink-soft">
      {label}
    </span>
  );
}

function axisBar(label: string, value: number, left: string, right: string) {
  return (
    <div className="border border-ink-soft bg-paper p-4">
      <div className="flex items-center justify-between text-xs text-ink-faint"><span>{left}</span><span>{right}</span></div>
      <div className="font-hand text-sm font-medium text-ink">{label}</div>
      <div className="mt-2 h-2.5 w-full overflow-hidden bg-paper-deep border border-ink-soft/30">
        <div className="h-full bg-ink" style={{ width: `${value}%` }} />
      </div>
      <div className="mt-1 text-right font-code text-xs text-ink-faint">{value}%</div>
    </div>
  );
}

function toAxisValue(letter: string): number {
  return ["C", "K", "L", "F"].includes(letter) ? 25 : 75;
}

function axisLabelText(code: string) {
  const [richness, broth, impact, noodle] = code.split("");
  return {
    richness: richness === "C" ? "清爽" : "濃厚",
    broth: broth === "K" ? "清湯" : "白湯",
    impact: impact === "L" ? "溫和" : "重口",
    noodle: noodle === "F" ? "細滑" : "粗嚼",
  };
}

export default async function TypeDetailPage({ params }: TypeDetailPageProps) {
  const resolved = await params;
  const code = resolved.code?.toUpperCase?.() ?? "";
  if (!isTypeCode(code)) notFound();
  const maybeProfile = getTypeProfile(code as TypeCode);
  if (!maybeProfile) notFound();
  const profile = maybeProfile;

  const neighbors = getNeighborProfiles(profile.code);
  const relatedPrototypes = RAMEN_PROTOTYPES.filter((item) => profile.relatedPrototypeIds.includes(item.id));
  const labels = axisLabelText(profile.code);

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 pb-12 pt-[calc(env(safe-area-inset-top)+20px)] md:px-6 md:pb-16 md:pt-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline"><Link href="/types">← 回到所有類型</Link></Button>
          <Badge variant="secondary" className="px-3 py-1">{profile.family}</Badge>
          <Badge className="px-3 py-1">{profile.code}</Badge>
        </div>
        <Card className="border-ink bg-ink text-white hover:shadow-none hover:translate-y-0">
          <CardHeader className="space-y-4">
            <CardDescription className="text-white/60">拉麵口味風格</CardDescription>
            <div className="space-y-2">
              <CardTitle className="font-hand text-4xl tracking-tight text-white md:text-5xl">{profile.code}</CardTitle>
              <div className="font-hand text-2xl font-semibold text-white md:text-3xl">{profile.name}</div>
            </div>
            <CardDescription className="max-w-3xl text-base leading-7 text-white/75">{profile.summary}</CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {axisBar("清爽 ↔ 濃厚", toAxisValue(profile.axes.richness), "清爽", "濃厚")}
        {axisBar("清湯 ↔ 白湯", toAxisValue(profile.axes.broth), "清湯", "白湯")}
        {axisBar("溫和 ↔ 重口", toAxisValue(profile.axes.impact), "溫和", "重口")}
        {axisBar("細滑 ↔ 粗嚼", toAxisValue(profile.axes.noodle), "細滑", "粗嚼")}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-ink-soft bg-paper">
          <CardHeader>
            <CardTitle className="text-xl">這型的關鍵感受</CardTitle>
            <CardDescription>先用最直觀的方式理解這型的大方向。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {axisChip(labels.richness)}
              {axisChip(labels.broth)}
              {axisChip(labels.impact)}
              {axisChip(labels.noodle)}
            </div>
            <div className="border-l-2 border-stamp bg-paper-light p-4 text-sm leading-7 text-ink-soft">{profile.short}</div>
          </CardContent>
        </Card>
        <Card className="border-ink-soft bg-paper">
          <CardHeader>
            <CardTitle className="text-xl">常見食材方向</CardTitle>
            <CardDescription>這不是硬分食材，而是這型通常最容易被哪些方向吸引。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {profile.ingredientTags.map((tag) => <Badge key={tag} variant="secondary" className="px-3 py-1">{tag}</Badge>)}
            </div>
            <div className="text-sm leading-7 text-ink-soft">如果你測出這型，通常代表你不只是喜歡某一種肉，而是會反覆被這些食材方向吸引。</div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-ink-soft bg-paper">
          <CardHeader>
            <CardTitle className="text-xl">最常對應的實際風格</CardTitle>
            <CardDescription>這裡是把口味主型，落到你最容易喜歡的實際拉麵風格。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {relatedPrototypes.map((item) => (
              <div key={item.id} className="bg-paper-light p-4 border border-ink-soft/40">
                <div className="font-hand font-medium text-ink">{item.name}</div>
                <div className="mt-1 text-sm leading-6 text-ink-soft">{item.short}</div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-ink-soft bg-paper">
          <CardHeader>
            <CardTitle className="text-xl">你也可能靠近這幾型</CardTitle>
            <CardDescription>如果你的分數落在邊界，常常會和這幾型互相接近。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {neighbors.map((item) => (
              <Link key={item.code} href={`/types/${item.code}`} className="block">
                <div className="border border-ink-soft p-4 transition hover:bg-paper-light hover:shadow-[2px_2px_0_oklch(0.4_0.02_60/0.1)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-code text-xs text-ink-faint">{item.code}</div>
                      <div className="font-hand font-medium text-ink">{item.name}</div>
                    </div>
                    <Badge variant="secondary" className="px-3 py-1 text-[10px]">{item.family}</Badge>
                  </div>
                  <div className="mt-2 text-sm leading-6 text-ink-soft">{item.short}</div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-ink-soft bg-paper-light">
          <CardHeader><CardTitle className="text-xl">看完這型後可以做什麼</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <HomeButton />
            <Button asChild variant="outline"><Link href="/types">回所有類型</Link></Button>
            <Button asChild variant="outline"><Link href={`/types/${profile.neighborCodes[0]}`}>看看接近型</Link></Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
