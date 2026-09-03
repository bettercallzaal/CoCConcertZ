# Source assets - NOT served

Files here are deliberately outside `public/` so the web server never exposes
them and no page can reference them by accident.

| File | Why it is here |
|---|---|
| `zao-logo-print-master-10500px.png` | 10500x10500, 11.5 MB. Print master. It was sitting in `public/images/zao-logo.png` and being rendered at 40px in `Community.tsx` - 11.2 MB downloaded per visit for nothing. For the web, use `public/images/zao-logo.png` (1000x1000, 343 KB). |

Canonical brand assets live in **github.com/bettercallzaal/zao-brand**. This
directory holds only what this repo genuinely needs at source resolution.
