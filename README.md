# Holiday - Mobile Travel Execution Panel

移动端优先 H5 应用，用于导入外部旅行计划并在旅途中执行。

核心能力：
- 创建旅行
- 粘贴导入外部计划文本
- 按天查看行程
- 勾选任务（出发前/途中）
- 通过 URL 共享给旅伴协作

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- React Router v6
- Zustand
- Supabase (可选，推荐用于跨设备共享)

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

访问 [http://localhost:5173](http://localhost:5173)

## Supabase Setup (Recommended)

1. 在 Supabase 创建项目
2. 打开 SQL Editor，执行 `supabase/schema.sql`
3. 在 `.env` 写入：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. 重启开发服务

## Data Storage Strategy

- 有 Supabase 环境变量：使用 Supabase，支持跨设备共享访问
- 无 Supabase 环境变量：自动退化到 localStorage（本机可用，无法跨设备）

## Routes

- `/` 旅行列表
- `/trip/new` 创建 + 导入
- `/trip/:id` 旅行总览
- `/trip/:id/today` 今天快览
- `/trip/:id/itinerary` 行程页
- `/trip/:id/tasks` 任务清单

## Import Parser Rules (MVP)

解析器文件：`src/lib/parser.ts`

支持规则：
- 识别天标题：`第一天` / `Day 1` / `4月20日`
- 识别时间行：`09:00 去机场`
- 识别准备事项：`准备事项` 后的列表
- 识别途中任务：`途中事项` 后的列表

解析失败会返回可读错误提示；无法识别的行会作为 warning 展示。

## Deploy to Vercel

1. 推送代码到 Git 仓库
2. 在 Vercel 导入项目
3. 配置环境变量（同 `.env`）
4. 部署

项目包含 `vercel.json`，已处理 SPA 路由刷新问题。

## Project Structure

```text
src/
  components/      # 页面组件
  data/            # mock 数据和导入示例文本
  hooks/           # 视图逻辑 hooks
  lib/             # supabase / parser / service
  pages/           # 页面
  store/           # Zustand 状态
  types/           # 类型定义
supabase/schema.sql
```

## Next Extensions

- 协作身份（旅伴昵称 + 操作日志）
- 更强文本解析（地点、备注、航班号自动拆分）
- 行程拖拽排序与编辑
- 分享权限（只读/可编辑）
