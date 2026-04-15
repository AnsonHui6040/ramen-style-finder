"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useReducer, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  BadgePercent,
  SlidersHorizontal,
  Soup,
  Drumstick,
  TriangleAlert,
} from "lucide-react";

import {
  createDefaultClassifierState,
  classifierReducer,
} from "@/lib/reducer";
import TypePreviewSection from "@/components/home/TypePreviewSection";
import {
  ALLERGEN_OPTIONS,
  CORE_AXES_QUESTIONS,
  FLAVOR_PROFILE_QUESTIONS,
  NOODLE_QUESTIONS,
  PROTEIN_PREFERENCE_QUESTIONS,
  TOPPING_QUESTIONS,
} from "@/data/questions";
import type {
  AllergenAnswers,
  ClassifierState,
  CoreAxisAnswers,
  FlavorProfileAnswers,
  FlowState,
  NoodleAnswers,
  ProteinPreferenceAnswers,
  SliderQuestionConfig,
  ToppingAnswers,
} from "@/types/ramen";

const FLOW_STEPS: Array<{ state: FlowState; label: string }> = [
  { state: "INTRO", label: "開始" },
  { state: "CORE_AXES", label: "主型四軸" },
  { state: "FLAVOR_PROFILE", label: "風味傾向" },
  { state: "PROTEIN_PREFERENCES", label: "素材接受度" },
  { state: "NOODLE_TOPPING", label: "麵與配料" },
  { state: "ALLERGENS", label: "過敏與排除" },
  { state: "RESULT_READY", label: "整理結果" },
  { state: "RESULT_VIEW", label: "結果" },
];

const QUICK_VALUES = [0, 25, 50, 75, 100];

function progressValue(state: FlowState): number {
  const index = FLOW_STEPS.findIndex((item) => item.state === state);
  if (index <= 0) return 0;
  return (index / (FLOW_STEPS.length - 1)) * 100;
}

function pageTitle(state: FlowState): string {
  switch (state) {
    case "INTRO":
      return "拉麵口味風格";
    case "CORE_AXES":
      return "先抓你的整體口味方向";
    case "FLAVOR_PROFILE":
      return "再看看你偏哪種香氣";
    case "PROTEIN_PREFERENCES":
      return "再看你平常偏愛哪些食材感";
    case "NOODLE_TOPPING":
      return "最後補麵條口感和配料細節";
    case "ALLERGENS":
      return "最後確認有沒有需要避開的食材";
    case "RESULT_READY":
      return "準備揭曉你的結果";
    case "RESULT_VIEW":
      return "你的拉麵口味風格";
    default:
      return "拉麵口味風格";
  }
}

function pageDescription(state: FlowState): string {
  switch (state) {
    case "INTRO":
      return "";
    case "CORE_AXES":
      return "先不用想流派名字，直接回答你想吃得清爽一點、濃一點、重口一點，還是麵體更有存在感。";
    case "FLAVOR_PROFILE":
      return "這一步是在抓你喜歡的是肉香、海味、發酵感，還是那種清香轉味的感覺。";
    case "PROTEIN_PREFERENCES":
      return "這裡不是逼你先選一種肉，而是看看你對牛香、鴨香、蝦鮮、貝鮮這些方向有多喜歡。";
    case "NOODLE_TOPPING":
      return "麵在這版的影響力拉高了，所以這一步不只是補充，真的會影響你最後是哪一型。";
    case "ALLERGENS":
      return "高風險素材會直接排除，中度風險則會提醒你注意。";
    case "RESULT_READY":
      return "你前面的偏好已經收得差不多了，下一步就會整理出你的主型、接近型，以及最像你的幾種拉麵風格。";
    case "RESULT_VIEW":
      return "先看你屬於哪一型，再看你靠近哪型、偏愛哪些食材方向，以及最像你的幾種實際風格。";
    default:
      return "";
  }
}

function sectionBadgeLabel(state: FlowState): string {
  switch (state) {
    case "INTRO":
      return "開始前先看一下";
    case "RESULT_VIEW":
      return "結果";
    default:
      return pageTitle(state);
  }
}

function canGoNext(state: ClassifierState): boolean {
  switch (state.currentState) {
    case "INTRO":
      return true;
    case "CORE_AXES":
      return state.validation.coreAxesValid;
    case "FLAVOR_PROFILE":
      return state.validation.flavorProfileValid;
    case "PROTEIN_PREFERENCES":
      return state.validation.proteinPreferencesValid;
    case "NOODLE_TOPPING":
      return state.validation.noodleToppingValid;
    case "ALLERGENS":
      return state.validation.allergenConfirmed;
    case "RESULT_READY":
      return state.validation.resultEligible;
    case "RESULT_VIEW":
      return false;
    default:
      return false;
  }
}

function nextLabel(state: FlowState): string {
  if (state === "INTRO") return "開始分類";
  if (state === "RESULT_READY") return "顯示結果";
  return "下一步";
}

function axisState(value: number, left: string, right: string) {
  if (value <= 35) return left;
  if (value >= 65) return right;
  return "中間平衡";
}

function strengthLabel(strength: string) {
  switch (strength) {
    case "very_close":
      return "很接近";
    case "close":
      return "中度接近";
    case "moderate":
      return "略接近";
    default:
      return "邊界較遠";
  }
}

function sectionIcon(state: FlowState) {
  switch (state) {
    case "CORE_AXES":
      return <Sparkles className="h-4 w-4" />;
    case "FLAVOR_PROFILE":
      return <Soup className="h-4 w-4" />;
    case "PROTEIN_PREFERENCES":
      return <Drumstick className="h-4 w-4" />;
    case "NOODLE_TOPPING":
      return <SlidersHorizontal className="h-4 w-4" />;
    case "ALLERGENS":
      return <TriangleAlert className="h-4 w-4" />;
    default:
      return <BadgePercent className="h-4 w-4" />;
  }
}

function SliderCard({
  question,
  value,
  onChange,
}: {
  question: SliderQuestionConfig;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <Card className="rounded-[1.25rem] border-slate-200 shadow-sm shadow-slate-200/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base leading-6">{question.title}</CardTitle>
            {question.helper ? <CardDescription className="mt-1 leading-6">{question.helper}</CardDescription> : null}
          </div>
          <div className="rounded-full bg-slate-900 px-3 py-1 text-sm font-semibold text-white">
            {Math.round(value)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 sm:text-sm">
          <span>{question.leftLabel}</span>
          <span>{question.rightLabel}</span>
        </div>

        <input
          type="range"
          min={question.min}
          max={question.max}
          step={question.step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="ramen-range w-full"
        />

        <div className="grid grid-cols-5 gap-2">
          {QUICK_VALUES.map((preset) => {
            const active = Math.round(value) === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onChange(preset)}
                className={`min-h-11 rounded-xl border text-sm font-medium transition ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-700 active:bg-slate-100"
                }`}
              >
                {preset}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function renderQuestionList<T extends Record<string, number | undefined>>({
  questions,
  values,
  onChange,
}: {
  questions: SliderQuestionConfig[];
  values: T;
  onChange: (id: string, value: number) => void;
}) {
  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <SliderCard
          key={question.id}
          question={question}
          value={Number(values[question.id] ?? question.defaultValue ?? 50)}
          onChange={(value) => onChange(question.id, value)}
        />
      ))}
    </div>
  );
}

function AxisMeter({
  label,
  value,
  left,
  right,
}: {
  label: string;
  value: number;
  left: string;
  right: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-slate-900">{label}</div>
          <div className="mt-1 text-xs text-slate-500">{axisState(value, left, right)}</div>
        </div>
        <div className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{Math.round(value)}%</div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{left}</span>
          <span>{right}</span>
        </div>
        <div className="relative h-3 rounded-full bg-slate-100">
          <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-slate-300 via-slate-500 to-slate-900" style={{ width: `${value}%` }} />
          <div
            className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-slate-900 shadow-md"
            style={{ left: `calc(${value}% - 10px)` }}
          />
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, value, dark = false }: { label: string; value: number; dark?: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className={dark ? "text-slate-200" : "text-slate-700"}>{label}</span>
        <span className={dark ? "font-medium text-white" : "font-medium text-slate-900"}>{value}%</span>
      </div>
      <div className={`h-2 overflow-hidden rounded-full ${dark ? "bg-white/15" : "bg-slate-100"}`}>
        <div className={`h-full rounded-full ${dark ? "bg-white" : "bg-slate-900"}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ResultSection({ state }: { state: ClassifierState }) {
  const snapshot = state.resultSnapshot;

  if (!snapshot) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>尚未產生結果</CardTitle>
          <CardDescription>請先完成前面的題目並進入結果頁。</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const axisRows = [
    {
      label: "清爽 ↔ 濃厚",
      value: snapshot.archetype.axes.richnessAxis,
      left: "清爽",
      right: "濃厚",
    },
    {
      label: "清湯 ↔ 白湯",
      value: snapshot.archetype.axes.brothBodyAxis,
      left: "清湯",
      right: "白湯",
    },
    {
      label: "溫和 ↔ 重口",
      value: snapshot.archetype.axes.impactAxis,
      left: "溫和",
      right: "重口",
    },
    {
      label: "細滑 ↔ 粗嚼",
      value: snapshot.archetype.axes.noodleBodyAxis,
      left: "細滑",
      right: "粗嚼",
    },
  ];

  return (
    <div className="space-y-4">
      <Link href={`/types/${snapshot.archetype.code}`} className="block">
        <Card className="overflow-hidden rounded-[1.75rem] border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-300/50 transition hover:-translate-y-0.5 hover:shadow-xl">
          <CardHeader className="space-y-4">
            <div className="inline-flex w-fit items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
              你的口味主型
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="text-4xl tracking-tight text-white sm:text-5xl">{snapshot.archetype.code}</CardTitle>
                <div className="text-xl font-semibold text-white sm:text-2xl">{snapshot.archetype.name}</div>
              </div>
            </div>
            <CardDescription className="max-w-3xl text-base leading-8 text-slate-200">
              {snapshot.archetype.summary}
            </CardDescription>
            <CardDescription className="text-sm leading-7 text-slate-300">
              點開可以看這型的完整介紹、鄰近型與常見風格。
            </CardDescription>
          </CardHeader>
        </Card>
      </Link>

      <div className="flex flex-wrap gap-3">
        <Button asChild className="rounded-xl">
          <Link href={`/types/${snapshot.archetype.code}`}>看這個口味風格的完整介紹</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/types">看全部口味風格</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-[1.5rem] border-slate-200 bg-white shadow-sm shadow-slate-200/60">
          <CardHeader>
            <CardTitle className="text-base text-slate-950">最像你的風格</CardTitle>
            <CardDescription className="text-slate-600">這是最接近你目前整體口味輪廓的一種實際風格。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-wide text-slate-500">Top Match</div>
              <div className="mt-1 text-xl font-semibold text-slate-950">{snapshot.topResult.displayName}</div>
              <div className="mt-2 text-sm leading-7 text-slate-700">{snapshot.topResult.summary}</div>
            </div>
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
              <ScoreBar label="匹配度" value={snapshot.topResult.score} />
              <ScoreBar label="推薦比例" value={snapshot.topResult.share} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.5rem] border-slate-200 bg-white shadow-sm shadow-slate-200/50">
          <CardHeader>
            <CardTitle className="text-base text-slate-950">你偏愛的食材方向</CardTitle>
            <CardDescription className="text-slate-600">這不是在幫你硬分成某一種肉，而是告訴你，你這型通常最容易被哪些食材方向吸引。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.ingredientTags.map((item) => (
              <ScoreBar key={item.tag} label={item.tag} value={item.score} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[1.5rem] border-slate-200 bg-white shadow-sm shadow-slate-200/60">
          <CardHeader>
            <CardTitle className="text-base text-slate-950">四軸分析</CardTitle>
            <CardDescription className="text-slate-600">這四條軸更能代表你的整體口味，不會被單一湯底或主食材綁死。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {axisRows.map((axis) => (
              <AxisMeter key={axis.label} {...axis} />
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {snapshot.borderlineHint ? (
            <Link href={`/types/${snapshot.borderlineHint.code}`} className="block">
              <Card className="rounded-[1.5rem] border-dashed border-slate-300 bg-white shadow-sm shadow-slate-200/50 transition hover:bg-slate-50">
                <CardHeader>
                  <CardTitle className="text-base text-slate-950">你其實也很靠近這型</CardTitle>
                  <CardDescription className="text-slate-600">
                    {snapshot.borderlineHint.code}・{snapshot.borderlineHint.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-7 text-slate-700">
                  <div>{snapshot.borderlineHint.summary}</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="rounded-full">{strengthLabel(snapshot.borderlineHint.strength)}</Badge>
                    <Badge variant="secondary" className="rounded-full">距離 {snapshot.borderlineHint.distance}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ) : null}

          <Card className="rounded-[1.5rem] border-slate-200 bg-white shadow-sm shadow-slate-200/50">
            <CardHeader>
              <CardTitle className="text-base text-slate-950">為什麼會是這型</CardTitle>
              <CardDescription className="text-slate-600">這些是影響你結果最明顯的幾個關鍵方向。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {snapshot.reasons.map((reason) => (
                <ScoreBar key={reason.label} label={reason.label} value={reason.score} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="rounded-[1.5rem] border-slate-200 bg-white shadow-sm shadow-slate-200/60">
        <CardHeader>
          <CardTitle className="text-base text-slate-950">最像你的幾款風格</CardTitle>
          <CardDescription className="text-slate-600">這裡是把你的口味風格，對應到實際比較像你的幾種拉麵方向。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[snapshot.topResult, ...snapshot.secondaryResults].map((item, index) => (
            <div key={item.typeId} className={`rounded-2xl border p-4 ${index === 0 ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white"}`}>
              <div className="flex items-start gap-4">
                <div>
                  <div className={`text-xs uppercase tracking-wide ${index === 0 ? "text-slate-200" : "text-slate-600"}`}>
                    {index === 0 ? "Top Match" : `候選 ${index + 1}`}
                  </div>
                  <div className={`mt-1 text-lg font-semibold ${index === 0 ? "text-white" : "text-slate-950"}`}>{item.displayName}</div>
                  <div className={`mt-1 text-sm leading-7 ${index === 0 ? "text-slate-200" : "text-slate-700"}`}>{item.summary}</div>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <ScoreBar label="匹配度" value={item.score} dark={index === 0} />
                <ScoreBar label="推薦比例" value={item.share} dark={index === 0} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {(snapshot.blockedByAllergen.length > 0 || snapshot.warningByAllergen.length > 0) ? (
        <Card className="rounded-[1.5rem] border-amber-200 bg-amber-50 shadow-sm shadow-amber-100/80">
          <CardHeader>
            <CardTitle className="text-base text-amber-900">過敏原提醒</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-7 text-amber-900">
            {snapshot.blockedByAllergen.length > 0 ? (
              <div>已封鎖高風險類型：{snapshot.blockedByAllergen.join("、")}</div>
            ) : null}
            {snapshot.warningByAllergen.length > 0 ? (
              <div>需注意中度風險：{snapshot.warningByAllergen.join("、")}</div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

const STORAGE_KEY = "ramen-classifier-state";

export default function ClassifierShell() {
  const [state, dispatch] = useReducer(classifierReducer, undefined, createDefaultClassifierState);
  const topAnchorRef = useRef<HTMLDivElement | null>(null);
  const previousFlowRef = useRef<FlowState>(state.currentState);
  const restoredRef = useRef(false);

  // Restore saved state after mount (runs after hydration to avoid SSR mismatch)
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const savedState = JSON.parse(saved);
        if (savedState?.currentState) dispatch({ type: "LOAD_SAVED_STATE", payload: savedState });
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Persist state to localStorage on every change
  useEffect(() => {
    if (!restoredRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  useEffect(() => {
    const previous = previousFlowRef.current;
    const current = state.currentState;

    if (previous !== current) {
      requestAnimationFrame(() => {
        topAnchorRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }

    previousFlowRef.current = current;
  }, [state.currentState]);

  const introView = (
    <Card className="overflow-hidden rounded-[1.75rem] border-slate-200 bg-white shadow-lg shadow-slate-200/60">
      <CardHeader>
        <CardTitle className="text-xl text-slate-950 sm:text-2xl">最後你會看到這三塊</CardTitle>
        <CardDescription className="mt-1 leading-7 text-slate-600">
          先看整體口味方向，再看你通常會被哪些食材吸引，最後才對應到最像你的幾種實際風格。
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <div className="font-medium text-slate-950">口味主型</div>
          <div className="mt-1">先看你的整體風格大方向</div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <div className="font-medium text-slate-950">食材方向</div>
          <div className="mt-1">再看你通常會被哪些食材吸引</div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
          <div className="font-medium text-slate-950">實際風格</div>
          <div className="mt-1">最後才落到最像你的幾種拉麵</div>
        </div>
      </CardContent>
    </Card>
  );

  const body = useMemo(() => {
    switch (state.currentState) {
      case "INTRO":
        return introView;

      case "CORE_AXES":
        return renderQuestionList<CoreAxisAnswers>({
          questions: CORE_AXES_QUESTIONS,
          values: state.coreAxisAnswers,
          onChange: (id, value) =>
            dispatch({
              type: "ANSWER_CORE_AXIS",
              payload: { id: id as keyof CoreAxisAnswers, value },
            }),
        });

      case "FLAVOR_PROFILE":
        return renderQuestionList<FlavorProfileAnswers>({
          questions: FLAVOR_PROFILE_QUESTIONS,
          values: state.flavorProfileAnswers,
          onChange: (id, value) =>
            dispatch({
              type: "ANSWER_FLAVOR_PROFILE",
              payload: { id: id as keyof FlavorProfileAnswers, value },
            }),
        });

      case "PROTEIN_PREFERENCES":
        return renderQuestionList<ProteinPreferenceAnswers>({
          questions: PROTEIN_PREFERENCE_QUESTIONS,
          values: state.proteinPreferenceAnswers,
          onChange: (id, value) =>
            dispatch({
              type: "ANSWER_PROTEIN_PREFERENCE",
              payload: { id: id as keyof ProteinPreferenceAnswers, value },
            }),
        });

      case "NOODLE_TOPPING":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
{renderQuestionList<NoodleAnswers>({
                questions: NOODLE_QUESTIONS,
                values: state.noodleAnswers,
                onChange: (id, value) =>
                  dispatch({
                    type: "ANSWER_NOODLE",
                    payload: { id: id as keyof NoodleAnswers, value },
                  }),
              })}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                <div className="font-medium text-slate-900">配料偏好</div>
                <div className="mt-1">這一段是細修正層，不會反客為主，但會影響最後原型排序。</div>
              </div>
              {renderQuestionList<ToppingAnswers>({
                questions: TOPPING_QUESTIONS,
                values: state.toppingAnswers,
                onChange: (id, value) =>
                  dispatch({
                    type: "ANSWER_TOPPING",
                    payload: { id: id as keyof ToppingAnswers, value },
                  }),
              })}
            </div>
          </div>
        );

      case "ALLERGENS":
        return (
          <Card className="rounded-[1.5rem] border-slate-200 shadow-sm shadow-slate-200/50">
            <CardHeader>
              <CardTitle className="text-base">哪些素材需要避開？</CardTitle>
              <CardDescription>高風險素材會直接封鎖，中度風險會作警示與降權。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                {ALLERGEN_OPTIONS.map((option) => (
                  <label key={option.id} className="flex min-h-14 items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm leading-6 active:bg-slate-50">
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5"
                      checked={Boolean(state.allergenAnswers[option.id])}
                      onChange={(e) =>
                        dispatch({
                          type: "ANSWER_ALLERGEN",
                          payload: { id: option.id as keyof AllergenAnswers, value: e.target.checked },
                        })
                      }
                    />
                    <span>
                      <span className="font-medium text-slate-900">{option.label}</span>
                      {option.helper ? <span className="mt-1 block text-slate-500">{option.helper}</span> : null}
                    </span>
                  </label>
                ))}
              </div>

              <Button
                variant={state.allergenConfirmed ? "secondary" : "default"}
                className="w-full rounded-2xl"
                onClick={() => dispatch({ type: "CONFIRM_ALLERGENS" })}
              >
                {state.allergenConfirmed ? "已確認過敏與排除條件" : "確認這一頁"}
              </Button>
            </CardContent>
          </Card>
        );

      case "RESULT_READY":
        return (
          <Card className="rounded-[1.5rem] border-slate-200 shadow-sm shadow-slate-200/50">
            <CardHeader>
              <CardTitle>可以產生結果了</CardTitle>
              <CardDescription>目前必要題已完成，下一步將正式產生主型、邊界型、主素材標識與原型匹配。</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <Badge variant={state.validation.coreAxesValid ? "default" : "secondary"} className="justify-center rounded-full py-2">主型四軸</Badge>
              <Badge variant={state.validation.flavorProfileValid ? "default" : "secondary"} className="justify-center rounded-full py-2">風味傾向</Badge>
              <Badge variant={state.validation.proteinPreferencesValid ? "default" : "secondary"} className="justify-center rounded-full py-2">素材接受度</Badge>
              <Badge variant={state.validation.noodleToppingValid ? "default" : "secondary"} className="justify-center rounded-full py-2">麵條與配料</Badge>
              <Badge variant={state.validation.allergenConfirmed ? "default" : "secondary"} className="justify-center rounded-full py-2">過敏與排除</Badge>
            </CardContent>
          </Card>
        );

      case "RESULT_VIEW":
        return <ResultSection state={state} />;

      default:
        return null;
    }
  }, [state]);

  return (
    <>
      <div ref={topAnchorRef} />
      <div className="mx-auto max-w-5xl space-y-8 px-4 pb-[calc(env(safe-area-inset-bottom)+110px)] pt-[calc(env(safe-area-inset-top)+16px)] md:px-6 md:pb-10 md:pt-6">
        <div className="space-y-3">
          <div className="space-y-3 overflow-x-auto pb-1">
            <div className="flex min-w-max items-center gap-2 text-xs text-slate-500">
              {FLOW_STEPS.map((item, index) => (
                <span
                  key={item.state}
                  className={`rounded-full px-3 py-2 ${item.state === state.currentState ? "bg-slate-900 font-medium text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  {index + 1}. {item.label}
                </span>
              ))}
            </div>
            <Progress value={progressValue(state.currentState)} className="mt-1 h-2.5" />
          </div>

          <div className="flex items-start gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{pageTitle(state.currentState)}</h1>
            </div>
          </div>
        </div>

        <div className="relative z-10">{body}</div>

        <div className="sticky bottom-0 z-20 -mx-4 border-t border-slate-200 bg-white/95 px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-4 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur md:static md:mx-0 md:border-t md:bg-transparent md:px-0 md:pb-0 md:pt-4 md:shadow-none md:backdrop-blur-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="min-h-12 flex-1 rounded-2xl sm:flex-none"
                onClick={() => dispatch(state.currentState === "INTRO" ? { type: "RESET_FLOW" } : { type: "PREV_STEP" })}
                disabled={state.currentState === "INTRO"}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />上一步
              </Button>
              <Button variant="outline" className="min-h-12 rounded-2xl sm:hidden" onClick={() => dispatch({ type: "RESET_FLOW" })}>
                <RotateCcw className="mr-2 h-4 w-4" />重設
              </Button>
            </div>

            <div className="flex gap-3">
              {state.currentState !== "RESULT_VIEW" ? (
                <Button
                  className="min-h-12 flex-1 rounded-2xl px-5 sm:flex-none"
                  onClick={() => dispatch(state.currentState === "INTRO" ? { type: "START_FLOW" } : { type: "NEXT_STEP" })}
                  disabled={!canGoNext(state)}
                >
                  {nextLabel(state.currentState)}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button className="min-h-12 flex-1 rounded-2xl px-5 sm:flex-none" onClick={() => dispatch({ type: "RESTART_FROM_RESULT" })}>
                  重新分類
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {state.currentState === "INTRO" && <TypePreviewSection />}
    </>
  );
}
