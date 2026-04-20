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
      return "拉麵口味分類器";
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
    case "RESULT_VIEW":
      return "你的拉麵口味風格";
    default:
      return "拉麵口味風格";
  }
}

function pageDescription(state: FlowState): string {
  switch (state) {
    case "INTRO":
      return "這是一個以整體口味偏好為核心的拉麵分類器，透過逐步問卷分析湯頭、風味、麵體與食材接受度，幫助你找出最適合自己的拉麵口味風格與相近類型。";
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
    case "RESULT_VIEW":
      return false;
    default:
      return false;
  }
}

function nextLabel(state: FlowState): string {
  if (state === "INTRO") return "開始分類";
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
    <Card className="border-ink-soft">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base leading-6">{question.title}</CardTitle>
            {question.helper ? <CardDescription className="mt-1 leading-6">{question.helper}</CardDescription> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-xs text-ink-faint sm:text-sm">
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

        <div className="grid grid-cols-5">
          {QUICK_VALUES.map((preset, index) => {
            const active = Math.round(value) === preset;
            const sizes = [28, 22, 22, 22, 28];
            const size = sizes[index];
            const hollow = preset === 50;
            const color = active ? "oklch(0.52 0.14 35)" : "oklch(0.26 0.01 60 / 0.25)";
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onChange(preset)}
                className="flex items-center justify-center min-h-11 transition"
                aria-label={String(preset)}
              >
                <span
                  style={{
                    width: size,
                    height: size,
                    borderRadius: "50%",
                    display: "block",
                    flexShrink: 0,
                    backgroundColor: hollow ? "transparent" : color,
                    border: `2px solid ${color}`,
                  }}
                />
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
    <div className="border border-ink-soft bg-paper p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-ink">{label}</div>
          <div className="mt-1 text-xs text-ink-faint">{axisState(value, left, right)}</div>
        </div>
        <div className="bg-paper-deep px-2.5 py-1 font-code text-xs font-medium text-ink-soft">{Math.round(value)}%</div>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-ink-faint">
          <span>{left}</span>
          <span>{right}</span>
        </div>
        <div className="relative h-2.5 bg-paper-deep border border-ink-soft/30">
          <div className="absolute inset-y-0 left-0 bg-ink" style={{ width: `${value}%` }} />
          <div
            className="absolute top-1/2 h-4 w-4 -translate-y-1/2 border-2 border-paper bg-stamp"
            style={{ left: `calc(${value}% - 8px)` }}
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
        <span className={dark ? "text-white/70" : "text-ink-soft"}>{label}</span>
        <span className={dark ? "font-medium text-white" : "font-medium text-ink"}>{value}%</span>
      </div>
      <div className={`h-1.5 overflow-hidden ${dark ? "bg-white/15" : "bg-paper-deep"}`}>
        <div className={`h-full ${dark ? "bg-white" : "bg-ink"}`} style={{ width: `${value}%` }} />
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
        <Card className="overflow-hidden border-ink bg-ink text-white transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_oklch(0.4_0.02_60/0.25)]">
          <CardHeader className="space-y-4">
            <div className="inline-flex w-fit items-center border border-white/30 px-3 py-1 font-code text-[10px] uppercase tracking-widest text-white/80">
              你的口味主型
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="text-4xl tracking-tight text-white sm:text-5xl">{snapshot.archetype.code}</CardTitle>
                <div className="text-xl font-semibold text-white sm:text-2xl">{snapshot.archetype.name}</div>
              </div>
            </div>
            <CardDescription className="max-w-3xl text-base leading-8 text-white/70">
              {snapshot.archetype.summary}
            </CardDescription>
            <CardDescription className="text-sm leading-7 text-white/60">
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
        <Card className="border-ink-soft bg-paper ">
          <CardHeader>
            <CardTitle className="text-base text-ink">最像你的風格</CardTitle>
            <CardDescription className="text-ink-soft">這是最接近你目前整體口味輪廓的一種實際風格。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-paper-light p-4 border border-ink-soft/40">
              <div className="font-code text-xs uppercase tracking-widest text-ink-faint">Top Match</div>
              <div className="mt-1 text-xl font-semibold text-ink">{snapshot.topResult.displayName}</div>
              <div className="mt-2 text-sm leading-7 text-ink-soft">{snapshot.topResult.summary}</div>
            </div>
            <div className="space-y-3 border border-ink-soft bg-paper p-4">
              <ScoreBar label="匹配度" value={snapshot.topResult.score} />
              <ScoreBar label="推薦比例" value={snapshot.topResult.share} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-ink-soft bg-paper ">
          <CardHeader>
            <CardTitle className="text-base text-ink">你偏愛的食材方向</CardTitle>
            <CardDescription className="text-ink-soft">這不是在幫你硬分成某一種肉，而是告訴你，你這型通常最容易被哪些食材方向吸引。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.ingredientTags.map((item) => (
              <ScoreBar key={item.tag} label={item.tag} value={item.score} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="border-ink-soft bg-paper ">
          <CardHeader>
            <CardTitle className="text-base text-ink">四軸分析</CardTitle>
            <CardDescription className="text-ink-soft">這四條軸更能代表你的整體口味，不會被單一湯底或主食材綁死。</CardDescription>
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
              <Card className="border-dashed border-ink-soft bg-paper transition hover:bg-paper-light">
                <CardHeader>
                  <CardTitle className="text-base text-ink">你其實也很靠近這型</CardTitle>
                  <CardDescription className="text-ink-soft">
                    {snapshot.borderlineHint.code}・{snapshot.borderlineHint.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-7 text-ink-soft">
                  <div>{snapshot.borderlineHint.summary}</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="">{strengthLabel(snapshot.borderlineHint.strength)}</Badge>
                    <Badge variant="secondary" className="">距離 {snapshot.borderlineHint.distance}</Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ) : null}

          <Card className="border-ink-soft bg-paper ">
            <CardHeader>
              <CardTitle className="text-base text-ink">為什麼會是這型</CardTitle>
              <CardDescription className="text-ink-soft">這些是影響你結果最明顯的幾個關鍵方向。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {snapshot.reasons.map((reason) => (
                <ScoreBar key={reason.label} label={reason.label} value={reason.score} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-ink-soft bg-paper ">
        <CardHeader>
          <CardTitle className="text-base text-ink">最像你的幾款風格</CardTitle>
          <CardDescription className="text-ink-soft">這裡是把你的口味風格，對應到實際比較像你的幾種拉麵方向。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[snapshot.topResult, ...snapshot.secondaryResults].map((item, index) => (
            <div key={item.typeId} className={`border p-4 ${index === 0 ? "border-ink bg-ink text-white" : "border-ink-soft bg-paper"}`}>
              <div className="flex items-start gap-4">
                <div>
                  <div className={`text-xs uppercase tracking-wide ${index === 0 ? "text-white/70" : "text-ink-soft"}`}>
                    {index === 0 ? "Top Match" : `候選 ${index + 1}`}
                  </div>
                  <div className={`mt-1 text-lg font-semibold ${index === 0 ? "text-white" : "text-ink"}`}>{item.displayName}</div>
                  <div className={`mt-1 text-sm leading-7 ${index === 0 ? "text-white/70" : "text-ink-soft"}`}>{item.summary}</div>
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
        <Card className="border-amber-300 bg-amber-50">
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

  const introView = null;

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
              <div className="border-l-2 border-stamp bg-paper-light p-4 text-sm leading-6 text-ink-soft">
                <div className="font-hand font-medium text-ink">配料偏好</div>
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
          <Card className="border-ink-soft ">
            <CardHeader>
              <CardTitle className="text-base">哪些素材需要避開？</CardTitle>
              <CardDescription>高風險素材會直接封鎖，中度風險會作警示與降權。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                {ALLERGEN_OPTIONS.map((option) => (
                  <label key={option.id} className="flex min-h-14 items-start gap-3 border border-ink-soft p-4 text-sm leading-6 active:bg-paper-light">
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
                      <span className="font-medium text-ink">{option.label}</span>
                      {option.helper ? <span className="mt-1 block text-ink-faint">{option.helper}</span> : null}
                    </span>
                  </label>
                ))}
              </div>

              <Button
                variant={state.allergenConfirmed ? "secondary" : "default"}
                className="w-full"
                onClick={() => dispatch({ type: "CONFIRM_ALLERGENS" })}
              >
                {state.allergenConfirmed ? "已確認過敏與排除條件" : "確認這一頁"}
              </Button>
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
      <div className={`mx-auto max-w-5xl px-4 md:px-6 ${state.currentState === "INTRO" ? "flex min-h-[100svh] flex-col pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+1rem)] md:pt-6 md:pb-8" : "space-y-8 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+110px)] md:pt-6 md:pb-10"}`}>
        <div className={state.currentState === "INTRO" ? "flex flex-1 flex-col items-center justify-center" : "space-y-3"}>
          {state.currentState !== "INTRO" && (
            <div className="space-y-3 overflow-x-auto pb-1">
              <div className="flex min-w-max items-center gap-2 text-xs text-ink-faint">
                {FLOW_STEPS.map((item, index) => (
                  <span
                    key={item.state}
                    className={`px-3 py-1.5 font-code text-[10px] uppercase tracking-wider ${item.state === state.currentState ? "bg-ink font-medium text-white" : "bg-paper-deep text-ink-faint"}`}
                  >
                    {index + 1}. {item.label}
                  </span>
                ))}
              </div>
              <Progress value={progressValue(state.currentState)} className="mt-1 h-2.5" />
            </div>
          )}

          {state.currentState === "INTRO" ? (
            <div className="w-full max-w-xl text-center">
              <h1 className="font-hand text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{pageTitle(state.currentState)}</h1>
              <p className="mt-4 text-base leading-8 text-ink-soft">{pageDescription(state.currentState)}</p>
              <div className="mt-10">
                <a
                  href="#type-preview-cards"
                  className="inline-flex items-center gap-2 border border-ink-soft bg-paper px-5 py-2.5 font-code text-xs tracking-widest text-ink-soft uppercase transition hover:bg-paper-deep hover:text-ink"
                >
                  先看看有哪些口味風格
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <h1 className="font-hand text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{pageTitle(state.currentState)}</h1>
              <Button variant="outline" className="shrink-0 px-3 py-2 text-xs" onClick={() => dispatch({ type: "RESET_FLOW" })}>
                <RotateCcw className="mr-1.5 h-3 w-3" />重設
              </Button>
            </div>
          )}
        </div>

        <div className="relative z-10">{body}</div>

        <div className="sticky bottom-0 z-20 -mx-4 border-t border-ink bg-paper-light px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-4 shadow-[0_-4px_0_oklch(0.42_0.01_60/0.15)] md:static md:mx-0 md:border-t md:bg-transparent md:px-0 md:pb-0 md:pt-4 md:shadow-none">
          <div className="flex gap-3">
            {state.currentState !== "INTRO" && (
              <Button
                variant="outline"
                className="min-h-12 flex-1"
                onClick={() => dispatch({ type: "PREV_STEP" })}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />上一步
              </Button>
            )}
            {state.currentState !== "RESULT_VIEW" ? (
              <Button
                className="min-h-12 flex-1 px-5"
                onClick={() => dispatch(state.currentState === "INTRO" ? { type: "START_FLOW" } : { type: "NEXT_STEP" })}
                disabled={!canGoNext(state)}
              >
                {nextLabel(state.currentState)}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button className="min-h-12 flex-1 px-5" onClick={() => dispatch({ type: "RESTART_FROM_RESULT" })}>
                重新分類
              </Button>
            )}
          </div>
        </div>
      </div>
      {state.currentState === "INTRO" && <TypePreviewSection />}
    </>
  );
}
