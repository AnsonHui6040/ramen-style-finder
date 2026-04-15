# 拉麵分類器 MVP

這是一個以 Next.js + React + TypeScript 製作的逐步卡片式拉麵分類器。

## 功能

- 主分類與子分類流程
- `not_sure` 模糊推定邏輯
- 分支專屬問題與共通問題
- 過敏原排除與警示
- 正式結果頁：主結果、次選項、原因與推薦比例

## 本機執行

```bash
npm install
npm run dev
```

瀏覽器開啟：

```bash
http://localhost:3000
```

## 建置檢查

```bash
npm run build
npm run typecheck
```

## 專案結構

- `app/`：Next.js app router 頁面
- `components/`：UI 元件與主容器
- `data/`：題庫、分類分支與原型資料
- `lib/`：reducer、推定邏輯、計分邏輯
- `types/`：型別定義
