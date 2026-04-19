# Aventus — aventus.au

End-to-end content platform for automotive and real estate.

## Stack
- HTML / CSS / Vanilla JS
- GSAP 3 + ScrollTrigger (loaded from CDN)
- Plus Jakarta Sans (Google Fonts)
- No build step — deploy-ready for GitHub Pages

## Structure
```
aventus-site/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── img/
    ├── logo-aventus.png
    ├── favicon.png
    ├── porsche-day.jpg
    ├── porsche-twilight.jpg
    ├── house-day.jpg
    ├── house-golden.jpg
    ├── house-twilight.jpg
    ├── room-empty.jpg
    └── room-staged.jpg
```

## Deploy (GitHub Pages)
1. Push to main branch
2. Repo Settings → Pages → Deploy from a branch → main → / (root)
3. Point `aventus.au` DNS to GitHub Pages

## Section map
1. Hero — Porsche day→twilight scroll demo
2. Positioning statement
3. Three divisions overview (Media / Studio / Agency)
4. The Foundation — 100,000+ products data story
5. Media header
6. Media gallery — 12 portfolio tiles (placeholders)
7. Studio header
8. Daylight → Golden Hour → Twilight pinned demo
9. Virtual Staging pinned demo
10. Studio capabilities grid — 5 features
11. Mobile app moment — 60 seconds from your phone
12. Agency header
13. Agency metrics — animated counters
14. The unified model — conceptual statement
15. Built For — 4 audience profiles
16. Stats — Years / Products / Awards / Publications
17. CTA
18. Footer

## Placeholders to swap
Gallery tiles in section 6 are labelled placeholders (AUTO-01 through RE-06) showing grid position and orientation. Replace each `.gal-placeholder` div with an `<img>` tag pointing at the actual image.
