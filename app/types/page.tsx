import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FEATURED_TYPE_PROFILES,
  TYPE_FAMILY_OPTIONS,
  TYPE_PROFILES,
  type TypeFamily,
} from "@/data/typeProfiles";

interface TypesPageProps {
  searchParams?: Promise<{
    family?: string;
    featured?: string;
  }>;
}


function familyDescription(family: TypeFamily): string {
  switch (family) {
    case "清亮系":
      return "偏清爽、輪廓清楚、入口俐落。";
    case "白湯系":
      return "偏白湯感，但不一定走到最厚最重。";
    case "厚湯系":
      return "偏厚味與存在感，但仍保留清湯骨架。";
    case "濃白系":
      return "最明顯的濃厚、白湯與包覆感路線。";
  }
}

export default async function TypesPage({ searchParams }: TypesPageProps) {
  const resolved = (await searchParams) ?? {};
  const family = resolved.family;
  const featured = resolved.featured === "1";

  const familyIsValid = TYPE_FAMILY_OPTIONS.includes(family as TypeFamily);
  const activeFamily = familyIsValid ? (family as TypeFamily) : null;

  let profiles = TYPE_PROFILES;
  if (activeFamily) profiles = profiles.filter((profile) => profile.family === activeFamily);
  if (featured) profiles = profiles.filter((profile) => profile.homepageFeatured);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 pb-12 pt-[calc(env(safe-area-inset-top)+20px)] md:px-6 md:pb-16 md:pt-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/">← 回首頁</Link>
          </Button>
          <Badge variant="secondary" className="px-3 py-1">拉麵口味風格庫</Badge>
        </div>
        <div className="space-y-3">
          <h1 className="font-hand text-3xl font-semibold tracking-tight text-ink md:text-4xl">所有口味風格一覽</h1>
          <p className="max-w-3xl text-sm leading-7 text-ink-soft md:text-base">
            這裡不是在按食材硬分，而是用整體口味方向來看每一型。你可以先看大方向，再點進去看單一類型的完整介紹。
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant={!activeFamily && !featured ? "default" : "outline"}><Link href="/types">全部</Link></Button>
          <Button asChild variant={featured ? "default" : "outline"}><Link href="/types?featured=1">首頁代表型</Link></Button>
          {TYPE_FAMILY_OPTIONS.map((item) => {
            const isActive = activeFamily === item;
            return (
              <Button key={item} asChild variant={isActive ? "default" : "outline"}>
                <Link href={`/types?family=${encodeURIComponent(item)}`}>{item}</Link>
              </Button>
            );
          })}
        </div>
      </section>

      {!activeFamily && !featured ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {TYPE_FAMILY_OPTIONS.map((item) => (
            <Card key={item} className="border-ink-soft bg-paper-light">
              <CardHeader>
                <CardTitle className="text-lg">{item}</CardTitle>
                <CardDescription>{familyDescription(item)}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full"><Link href={`/types?family=${encodeURIComponent(item)}`}>看這一系</Link></Button>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      {!activeFamily && !featured ? (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-hand text-2xl font-semibold tracking-tight text-ink">首頁代表型</h2>
              <p className="mt-1 text-sm text-ink-soft">這幾型最適合先拿來快速理解整個分類器在分什麼。</p>
            </div>
            <Button asChild variant="outline"><Link href="/types?featured=1">只看代表型</Link></Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {FEATURED_TYPE_PROFILES.map((profile) => (
              <Link key={profile.code} href={`/types/${profile.code}`} className="block">
                <Card className="h-full border-ink-soft bg-paper transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_oklch(0.4_0.02_60/0.12)]">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <Badge className="px-3 py-1">{profile.code}</Badge>
                      <span className="font-code text-[10px] text-ink-faint tracking-wider">{profile.family}</span>
                    </div>
                    <CardTitle className="text-xl">{profile.name}</CardTitle>
                    <CardDescription>{profile.short}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-ink-soft">大體系：{profile.family}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="font-hand text-2xl font-semibold tracking-tight text-ink">{activeFamily ? `${activeFamily} 一覽` : featured ? "代表型一覽" : "全部類型"}</h2>
          <p className="mt-1 text-sm text-ink-soft">點進任一張卡，就能看完整介紹、鄰近型與常見食材方向。</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <Link key={profile.code} href={`/types/${profile.code}`} className="block">
              <Card className="h-full border-ink-soft bg-paper transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_oklch(0.4_0.02_60/0.12)]">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <Badge className="px-3 py-1">{profile.code}</Badge>
                    <span className="font-code text-[10px] text-ink-faint tracking-wider">{profile.family}</span>
                  </div>
                  <CardTitle className="text-xl">{profile.name}</CardTitle>
                  <CardDescription>{profile.short}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="line-clamp-3 text-sm leading-6 text-ink-soft">{profile.summary}</div>
                  <div className="text-sm text-ink-soft">大體系：{profile.family}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
