import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FEATURED_TYPE_PROFILES } from "@/data/typeProfiles";


export default function TypePreviewSection() {
  return (
    <section className="space-y-6 px-4 pb-10 md:px-6 md:pb-14">
      <div id="type-preview-cards" className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-3">
        {FEATURED_TYPE_PROFILES.map((profile) => (
          <Link key={profile.code} href={`/types/${profile.code}`} className="block">
            <Card className="h-full border-ink-soft bg-paper transition hover:-translate-y-0.5 hover:shadow-[3px_3px_0_oklch(0.4_0.02_60/0.12)]">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Badge className="px-3 py-1">{profile.code}</Badge>
                  <Badge variant="secondary" className="px-3 py-1 text-[10px]">{profile.family}</Badge>
                </div>
                <div>
                  <CardTitle className="text-xl text-ink">{profile.name}</CardTitle>
                  <CardDescription className="mt-1">{profile.short}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm font-medium text-ink">
                  看完整介紹
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/types">看全部口味風格</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/types?featured=1">只看代表型</Link>
        </Button>
      </div>
    </section>
  );
}
