# JNUS website (jagonariunnayon.org)

Static, animated website for Jago Nari Unnayon Sangstha (JNUS), built with HTML, Tailwind CSS, GSAP and Lenis.

## Structure

```
public/                 <- deploy this folder (the finished site)
  *.html                <- generated pages (do not edit directly)
  assets/css/style.css  <- generated Tailwind CSS
  assets/js/main.js     <- all interactions & animations
  assets/js/icons.js    <- icon set (Lucide subset)
  assets/js/vendor/     <- GSAP, ScrollTrigger, Lenis
  assets/img/           <- photos, logos, favicon
src/
  pages/*.html          <- page content (edit these)
  partials/layout.html  <- <head>, scripts, preloader
  partials/header.html  <- navigation
  partials/footer.html  <- newsletter band + footer
  styles.css            <- Tailwind source + custom CSS
tailwind.config.js      <- brand colours, fonts, sizes
build.ps1               <- build script
tools/tailwindcss.exe   <- Tailwind standalone CLI (no Node needed)
```

## Edit and build

The Tailwind CLI (`tools/tailwindcss.exe`, ~40 MB) is not stored in git. After cloning, download it once:
```
mkdir tools
curl -L -o tools/tailwindcss.exe https://github.com/tailwindlabs/tailwindcss/releases/download/v3.4.17/tailwindcss-windows-x64.exe
```

1. Edit a file in `src/pages/` (or the header/footer in `src/partials/`).
2. Run the build:
   ```
   powershell -ExecutionPolicy Bypass -File build.ps1
   ```
3. Open `public/index.html` in a browser to check.

Each page starts with a small header block (`title`, `description`, `page`, `theme`, `image`) used for SEO tags and the active menu item.

## Before going live: please complete

- **Bank details** in `src/pages/donate.html` (search for `To be added`): account number, bank name, branch, SWIFT, routing number.
- **NGO Affairs Bureau registration number** in `src/pages/donate.html`.
- Check the **governance names** (Executive Committee, etc.) in `src/pages/about.html`.
- Report PDFs currently link to the old WordPress uploads (`jagonariunnayon.org/wp-content/uploads/...`). If WordPress is removed, copy the PDFs into `public/assets/docs/` and update the links in `src/pages/publications.html` and `src/pages/donate.html`.
- Forms (newsletter, contact, donation notice) open the visitor's email app addressed to `jagonariunnayon@gmail.com`. To receive submissions without email apps, connect a form service later.

## Deploy

Upload the contents of `public/` to any static host (Cloudflare Pages, Netlify, Vercel, cPanel `public_html`).

## Motion & accessibility

- Animations respect the visitor's "reduce motion" setting.
- The site works without JavaScript (all content visible).
- Add `?nomotion` to any URL to view it without animations.
