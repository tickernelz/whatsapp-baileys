# Qodo Project Instruction File (qodo.md)

> This file provides essential guidance for AI agents (e.g., Qodo Command CLI) working on the *whatsapp-baileys* repository.
> Keep this document **up-to-date** whenever the codebase changes or new conventions are introduced.

---

## 1. Project Snapshot

| Item              | Details |
|-------------------|---------|
| Project Name      | whatsapp-baileys |
| Framework         | Next.js 14 (App Router) |
| Language          | TypeScript / React 18 |
| Styling           | TailwindCSS v3 with tailwind-merge + clsx |
| DB ORM            | Prisma (output at `src/generated/prisma`) |
| Database          | PostgreSQL (`DATABASE_URL` in `.env`) |
| Utility Libraries | class-variance-authority, lucide-react, baileys |

## 2. Directory Overview

| Path                        | Purpose |
|-----------------------------|---------|
| `src/app`                   | App-router pages/layout/components |
| `src/lib/utils.ts`          | Shared helper `cn(...)` for class names |
| `prisma/schema.prisma`      | Database schema |
| `.qodo/`                    | Reserved for AI/automation artifacts |
| `public/` (implicit)        | Static assets (fonts, images, etc.) |
| `tailwind.config.ts`        | Tailwind configuration |
| `next.config.mjs`           | Next.js settings |

## 3. Coding Conventions & Guidelines

1. **TypeScript First** – All new code should be written in `.tsx` / `.ts`.
2. **TailwindCSS** – Use utility classes; co-locate component-specific styles via className strings.
3. **`cn()` Helper** – Combine conditional classes (import from `src/lib/utils`).
4. **ESLint & Prettier** – Follow `eslint-config-next` defaults; run `npm run lint` before commits.
5. **Prisma** – After editing `prisma/schema.prisma`, run `npx prisma generate` & `npx prisma migrate dev`.
6. **Environment variables** – Define in `.env`; do **not** commit secrets.
7. **Icons** – Use `lucide-react` icon set.
8. **Components** – Prefer server components by default in App Router; mark with `'use client'` when interactivity is required.
9. **Accessibility** – Ensure interactive elements are keyboard accessible and have aria labels when appropriate.

## 4. Common Tasks for AI Agents

| Task | Steps |
|------|-------|
| Add Tailwind class helper | import { cn } from "@/lib/utils"; use `cn()` to merge classes |
| Create new route | Add folder under `src/app/(group)/route/page.tsx` following Next.js file-system routing |
| Add Prisma model | Edit `prisma/schema.prisma` → run generate/migrate |
| Run dev server | `npm run dev` |
| Run lint | `npm run lint` |

## 5. Testing & Verification

* No formal test suite yet. Validate by running dev server locally (`localhost:3000`).
* TODO: integrate Jest/Playwright; update this file when implemented.

## 6. Agent Workflow Tips

1. **Explore** – Use `list_directory` & `read_file` tools to inspect unknown areas.
2. **Small Commits** – When editing, chunk changes via `write_file` ≤30 lines per chunk.
3. **Update qodo.md** – Anytime you create new scripts, config, or patterns → append or modify relevant sections here.
4. **No Git commits** – Unless user explicitly asks. Work on workspace files only.

## 7. Updating This File

After significant project changes (new tools, directories, libs, env vars, conventions), update **qodo.md** accordingly so future AI sessions have accurate context.

---
*Last generated: 2025-07-13T03:15:16Z*
