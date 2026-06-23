# Changes — Frontend (Cloud-project)

Connected the app to the real backend: configurable API base URL, real
server-driven analysis, keyword-based popular-paper suggestions, and `keywords`
threaded through the data layer.

## New files
| File | Purpose |
|------|---------|
| `src/vite-env.d.ts` | Types `import.meta.env` (VITE_API_URL) |

## Modified files
| File | Change |
|------|--------|
| `src/app/services/api.ts` | API base URL from `VITE_API_URL` env var (fallback to localhost:5000) |
| `src/app/services/analysisService.ts` | Replaced mock with real `POST /papers/analysis`; role-shaped DTOs |
| `src/app/services/paperService.ts` | Map `keywords` from API; add `getSuggestions` + `PaperSuggestion` |
| `src/app/components/analysis/AnalysisResultsModal.tsx` | Lecturer view renders from server payload (not client compute) + loading state |
| `src/app/components/library/Library.tsx` | "Most Popular in Your Topics" — external suggestions ranked by citations |
| `src/app/data/mockData.ts` | Added optional `Article.keywords` |
| `.env.local` | `VITE_API_URL` aligned to backend (port 5000) |

## Behavior changes
- **Analysis** is now authoritative on the server. Lecturers get computed
  charts/insights; students get a receipt only (chart data is no longer shipped
  to the client).
- **Library / All Articles** shows highly-cited related papers fetched from the
  backend, based on the most-cited paper's extracted keywords, with external
  links and live citation counts.

## Configuration
Set the API base in `.env.local`:
```
VITE_API_URL=http://localhost:5000
```
Restart the dev server after changing env values (Vite reads env at startup).

## Verification
- `tsc --noEmit` — 0 errors.
- `vite build` — succeeds.
