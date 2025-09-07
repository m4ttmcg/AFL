# Repository Guidelines

## Project Structure & Module Organization
- `client/`: React + Vite SPA. Entry: `client/index.html` → `client/src/main.tsx`. UI components in `client/src/components`, game engine in `client/src/lib/game`, state in `client/src/lib/stores`, static assets in `client/public`.
- `server/`: Express app. Entry: `server/index.ts`; add API routes in `server/routes.ts` (prefix with `/api`). Dev/static serving in `server/vite.ts`. In‑memory storage in `server/storage.ts`.
- `shared/`: Shared types and Drizzle ORM schema (`shared/schema.ts`).
- `dist/`: Build output. Client bundles to `dist/public`; server bundle to `dist/index.js`.

## Build, Test, and Development Commands
- `npm run dev`: Start Express with Vite HMR on `http://localhost:5000`.
- `npm run build`: Build client (Vite) and bundle server (esbuild) to `dist/`.
- `npm start`: Run production bundle (`NODE_ENV=production`).
- `npm run check`: Type-check the workspace (tsc).
- `npm run db:push`: Push Drizzle schema to Postgres (requires `DATABASE_URL`).

Example (PowerShell): `$env:DATABASE_URL="postgres://user:pass@host/db"; npm run db:push`

## Coding Style & Naming Conventions
- TypeScript strict. Prefer explicit types for public APIs.
- Indentation: 2 spaces; semicolons required; keep quote style consistent per file.
- React: Components PascalCase (`GameCanvas.tsx`); hooks start with `use*` (`useFooty.tsx`); utilities camelCase (`utils.ts`).
- Imports: Use aliases `@` → `client/src` and `@shared` → `shared/`.
- Styling: TailwindCSS classes in JSX; globals in `client/src/index.css`.

## Testing Guidelines
- No tests yet. Name future tests `*.test.ts`/`*.test.tsx` (tsconfig excludes tests from builds).
- Suggested tools: Vitest + React Testing Library (client), Supertest (server).
- Prioritize: shared schema validation and core engine logic in `client/src/lib/game/*`.

## Commit & Pull Request Guidelines
- Commits: Imperative, concise (e.g., "Add player animations", "Improve collision physics"). Group related changes.
- PRs: Clear description and rationale; link issues; include run steps (dev/build), API changes, and screenshots for UI.
- Checks: Ensure `npm run check` and `npm run build` succeed; do not commit secrets or `.env`.

## Security & Configuration Tips
- Env: Set `DATABASE_URL` for Drizzle and session storage (see `drizzle.config.ts`). Use platform secrets or `.env` (ignored).
- Server: All routes under `/api`; app serves on port `5000`.
- Data: Use `IStorage` to swap MemStorage for a database-backed implementation.
