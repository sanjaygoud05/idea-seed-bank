
## Goal

Refactor the existing template (a Supabase-powered requests/approvals demo) into a clean **EcoTwin AI** frontend skeleton. Keep the current design system (dark theme, Tailwind tokens, shadcn UI, sidebar shell, animations, responsive layout). Strip all backend/auth wiring. All data comes from typed mock services.

## Scope

### 1. Project rename
- `index.html`: title → `EcoTwin AI`, meta description, og/twitter tags.
- `package.json` name → `ecotwin-ai`.
- Sidebar/header branding label → `EcoTwin AI`.

### 2. Remove backend & auth (keep design)
- Delete: `src/integrations/supabase/`, `src/hooks/useAuth.tsx`, `src/hooks/useDemoScenario.tsx`, `src/hooks/usePendingApprovals.ts`, `src/hooks/useRequestActivity.ts`, `src/hooks/useRequestTypes.ts`, `src/hooks/useRequestTypesAdmin.ts`, `src/hooks/useRequests.ts`, `src/hooks/useUsers.ts`.
- Delete old pages: `Auth.tsx`, `Requests.tsx`, `Approvals.tsx`, `Profile.tsx`, `admin/Users.tsx`, `admin/Settings.tsx`, `Index.tsx`.
- Delete old feature components under `components/admin`, `components/approvals`, `components/requests`, and request-specific pieces in `components/dashboard` (charts referencing requests).
- Remove `AuthProvider` and `DemoScenarioProvider` from `App.tsx`. Keep `ThemeProvider`, `QueryClientProvider`, `TooltipProvider`, `Sonner`, `BrowserRouter`.
- Do NOT touch `src/components/ui/` (shadcn), `index.css`, `tailwind.config.ts`, `App.css` — preserves design tokens and animations.

### 3. New folder structure
Create the exact tree requested (`app/`, feature folders under `components/`, `layouts/`, `services/mock/`, `utils/`, `constants/`, `types/`, `styles/`). Existing `components/ui`, `hooks`, `lib`, `assets`, `pages` stay in place; new folders are added alongside.

### 4. Types (`src/types/`)
One file per interface, re-exported from `src/types/index.ts`:
`Company`, `Facility`, `UploadFile`, `CarbonMetric`, `EnergyMetric`, `WaterMetric`, `WasteMetric`, `AIRecommendation`, `Report`, `Notification`. Fields modeled realistically (ids, timestamps, units, statuses, relations by id).

### 5. Mock data layer (`src/services/mock/`)
- `mockCompany.ts`, `mockFacilities.ts`, `mockUploads.ts`, `mockCarbon.ts`, `mockEnergy.ts`, `mockWater.ts`, `mockWaste.ts`, `mockRecommendations.ts`, `mockReports.ts`, `mockNotifications.ts`.
- `index.ts` exposes async-style getters (`getCompany()`, `listFacilities()`, …) returning `Promise<T>` so future swap to Express/GraphQL/Prisma is a one-line change. Each file marked with `// TODO: replace with API call (Express/GraphQL/Prisma/Neon)`.

### 6. Layout & navigation
- Move `AppLayout.tsx` + `AppSidebar.tsx` into `src/layouts/`.
- Rewrite sidebar items to the 10 EcoTwin routes (Dashboard, Company Profile, Upload Center, Digital Twin, Analytics, AI Insights, Carbon Calculator, Reports, Notifications, Settings), each with a lucide icon. Preserve `Sidebar collapsible="icon"`, active-route highlight via `NavLink`, `SidebarTrigger` in header.
- Header branding text becomes "EcoTwin AI"; keep theme toggle if present.

### 7. Pages (`src/pages/`)
One folder per page, each with `index.tsx`:
`Dashboard`, `CompanyProfile`, `UploadCenter`, `DigitalTwin`, `Analytics`, `AIInsights`, `CarbonCalculator`, `Reports`, `Notifications`, `Settings`.
Each page uses the existing `PageHeader` pattern and renders placeholder cards/empty states populated from mock data where relevant. `TODO:` comment at top of each noting the backend integration (e.g. `// TODO: fetch via GraphQL query companyProfile`).

### 8. Reusable components
Under `src/components/common/` (generic) and feature folders (domain-specific):
- `common/`: `StatCard`, `ChartCard` (wrapper using existing chart primitives), `DataTable` (wraps shadcn `table`), `ProgressBar` (wraps shadcn `progress`), `LoadingSkeleton` (wraps shadcn `skeleton`), `EmptyState` (move from `shared/`).
- `upload/UploadCard.tsx`, `digitalTwin/FacilityCard.tsx`, `ai/RecommendationCard.tsx`, `notifications/NotificationCard.tsx`.
- `dashboard/`, `analytics/`, `reports/` seeded with one placeholder component each so the folders are non-empty and demonstrate usage.
All components typed against the interfaces from `src/types/`.

### 9. Routing (`App.tsx`)
```
/                    → redirect /dashboard
/dashboard           → Dashboard
/company             → CompanyProfile
/uploads             → UploadCenter
/digital-twin        → DigitalTwin
/analytics           → Analytics
/ai-insights         → AIInsights
/carbon-calculator   → CarbonCalculator
/reports             → Reports
/notifications       → Notifications
/settings            → Settings
*                    → NotFound
```
All routes render inside `AppLayout` (sidebar + header). No auth guards.

### 10. Constants, utils, hooks, styles
- `src/constants/navigation.ts` — sidebar items config (single source of truth).
- `src/constants/units.ts` — CO₂e, kWh, m³, kg units used in mock data.
- `src/utils/format.ts` — `formatNumber`, `formatUnit`, `formatDate` helpers.
- `src/hooks/useMockQuery.ts` — thin wrapper over `useQuery` calling mock services.
- `src/styles/` — currently empty placeholder with a README; global tokens stay in `index.css`.

### 11. Integration-readiness markers
Add a top-level `src/services/README.md` listing the planned backends (Express.js, Apollo GraphQL, Prisma, Neon Postgres, Hugging Face, Python crawler, Firebase Cloud Messaging, SMTP) and where each will plug in. Every mock file carries a matching `TODO`.

## Out of scope (explicit)
- No visual redesign, no new theme, no new fonts, no logo generation.
- No Supabase, no auth, no real API calls, no env vars.
- No new npm dependencies.

## Technical notes
- Keep `@tanstack/react-query` — mocks return promises so `useQuery` still works.
- Keep `sonner`, `TooltipProvider`, `ThemeProvider` in `App.tsx`.
- `src/integrations/supabase/` deletion is safe because all consumers are also deleted; a repo-wide grep for `@/integrations/supabase` will run after edits and any stragglers get cleaned.
- Preserve `tailwind.config.ts`, `index.css`, `components.json`, `App.css` unchanged.
