# Ocean Stallion International — Website

Static website (HTML + CSS + JS, no build step) for an India-based agricultural commodity exporter.

## Files

| File | Purpose |
|------|---------|
| `index.html` | All pages (Home, Products, Certificates, Gallery, Trade Progress, Contact) |
| `script.js` | Page routing, mobile menu, hero slider, loader, contact form |
| `white-maize.jpg` | White Maize product photo |
| `bajra.jpg` | Pearl Millet (Bajra) product photo |

Keep all four files in the same folder.

## Run locally

Open `index.html` in a browser, or run `python3 -m http.server 8000` and visit http://localhost:8000.

## Deploy

**GitHub Pages:** Settings → Pages → Deploy from branch → `main` / root. The contact form falls back to opening the visitor's email app, because GitHub Pages has no form backend.

**Netlify:** drag-and-drop the folder, or connect the repo. The contact form works out of the box (Netlify Forms), and submissions appear in the Netlify dashboard.
