# Design Spec: CALM/KIT UI + Purelis Skincare Storefront

Extracted from two reference images, written for frontend use with **Tailwind CSS**.
Hex values marked `~` are estimated from the image; the CALM/KIT palette hexes are printed in the source.

---

## Part 1: CALM / KIT (Interface Study)

### 1.1 Design principles
- Calm, soft, low-contrast, "neumorphic-lite": cream surfaces, big radii, diffuse shadows.
- One accent family (sage greens) plus warm neutrals (ivory, sand).
- Generous padding, pill-shaped controls, thin 1px borders.
- Section labels: numbered, uppercase, wide letter-spacing (`01. COLOR PALETTE`).

### 1.2 Color palette

| Token | Name | Hex | Use |
|---|---|---|---|
| `sage` | Sage | `#6B7F6E` | Primary buttons, active states, toggle on, progress fill, checked box |
| `moss` | Moss | `#A7B8A7` | Secondary accent, hovers, soft fills |
| `mist` | Mist | `#D9E1D9` | Notification bg, subtle fills, tracks |
| `ivory` | Ivory | `#F4EFE8` | Card surfaces |
| `sand` | Sand | `#C9BDAF` | Borders, dividers, avatar bg, muted accents |
| `canvas` | Page bg | `~#F8F3ED` | Page background |
| `ink` | Heading text | `~#1F2A23` | Titles, large type (near-black green) |
| `body` | Body text | `~#2F3A33` | Primary text |
| `muted` | Muted text | `~#8A8F88` | Placeholder, secondary text, hex labels |
| `track` | Off/Track | `~#DDD9D3` | Toggle off, progress track |
| `online` | Status dot | `~#4E8B5A` | Online indicator |

### 1.3 Typography
- Font: **Inter** (weights 300 Light, 400 Regular, 500 Medium, 600 Semibold).
- Page title `CALM / KIT`: ~72px, weight 400, uppercase, tracking `0.25em`, color ink.
- Subtitle `INTERFACE STUDY`: ~20px, uppercase, tracking `0.4em`, weight 300.
- Card section label: 13-14px, uppercase, tracking `0.2em`, weight 500, color body.
- Specimen "Aa": ~160px, weight 400, ink.
- Body / labels: 16px regular. Names: 18-20px semibold. Sublabels: 14px muted.

### 1.4 Surfaces, radius, shadow
- Card: `bg-ivory`, `rounded-[28px]`, padding `p-6`, 1px border `border-white/60`.
- Card shadow (soft double): `0 10px 30px rgba(107,127,110,0.10), 0 2px 6px rgba(0,0,0,0.04)`.
- Inner raised element (search, profile card, nav): `rounded-full` or `rounded-3xl`, shadow `0 6px 18px rgba(0,0,0,0.07)`, inset highlight `inset 0 1px 0 rgba(255,255,255,0.8)`.
- Layout: 2-column grid of cards, gap ~24px (`grid grid-cols-2 gap-6`), page padding ~40px.

### 1.5 Components

**03. Buttons**
- Primary: pill (`rounded-full`), height ~56px, `bg-sage text-white`, px-8, font-medium, trailing arrow icon (→) with gap-3, soft shadow.
- Secondary: pill, same height, `bg-ivory text-ink`, 1px border `sand`, no fill shadow.
- Hover: primary darkens ~6%, secondary gets `bg-white`.

**04. Search input**
- Pill container, height ~56px, `bg-ivory`, raised shadow.
- Left search icon (muted), placeholder `Search anything...` in muted, vertical 1px divider, right "sliders/filter" icon.

**05. Toggles & checkboxes**
- Toggle: 64x36px pill. On: `bg-sage`, white knob (28px) right with shadow. Off: `bg-track`, white knob left.
- Checkbox: 32px square, `rounded-lg`. Checked: `bg-sage` with white check. Unchecked: white/ivory with 1.5px `sand` border.
- Label text 18px, ink, gap-4. A 1px vertical divider separates toggles from checkboxes.

**06. Profile card**
- Raised card `rounded-3xl`, padding 16-20px, flex row.
- Avatar: 88px circle, `sand` bg. Online dot: 14px, `online`, 2px white ring, top-right of avatar.
- Name: 20px semibold. Role: 16px muted. Location: 14px muted with map-pin icon.
- 1px vertical divider, then a 44px circular "..." button (white, soft shadow).

**07. Progress bar**
- Track: height 32px, `rounded-full`, `bg-track`. Fill: `bg-sage` rounded-full, width = value (72%).
- Percentage label on the right, 18px, body color.

**08. Notification (toast)**
- `bg-mist` (slightly gradient to ivory), `rounded-2xl`, padding 16-20px, soft shadow.
- Left: 48px circle `bg-sage` with white check. Title `All set!` 20px semibold; message 15px muted.
- Right: close (X) icon, ink.

**09. Segmented tabs**
- Container: `rounded-2xl`, `bg-ivory`, raised shadow, 3 equal segments separated by 1px dividers.
- Active: `bg-sage text-white`, icon above label (Home). Inactive: transparent, icon + label in body/muted (Projects, Profile).
- Icons ~28px, labels 15px.

**10. Bottom navigation**
- Container `rounded-3xl`, `bg-ivory`, raised shadow, 4 evenly spaced items: Home, Search, Favorites, Settings.
- Icon (28px) over label (14px). Active: `text-sage` icon + label with a 6px dot below. Inactive: ink/muted.

---

## Part 2: Purelis Skincare (E-commerce Homepage)

### 2.1 Design principles
- Clean, natural, premium eco-beauty. Lots of white space, green-tinted photography, leaf motifs.
- Dark forest green for actions, serif for editorial headings, sans for UI.
- Flat, sharp-cornered buttons (`rounded-none` / `rounded-sm`), thin borders.

### 2.2 Color palette

| Token | Hex | Use |
|---|---|---|
| `forest` | `~#1F4A12` | Announcement bar, primary buttons, footer bottom bar, "BEAUTIFULLY YOU." |
| `forest-deep` | `~#183A0E` | Hover state for forest |
| `leaf` | `~#5E7F4A` | Icons, outlined accents |
| `sage-bg` | `~#DCE7D3` | Hero background gradient start |
| `sage-soft` | `~#EAF0E3` | Hero gradient end, banner bg, tinted tiles |
| `cream` | `~#F8F8F0` | Feature strip, footer bg |
| `white` | `#FFFFFF` | Page, cards |
| `ink` | `~#1B2A16` | Headings, nav text |
| `muted` | `~#6B6F66` | Secondary text |
| `line` | `~#E3E5DC` | Borders, card outlines |
| `blush` | `~#E8B7A8` | Lip balm product accent only |

### 2.3 Typography
- Sans (UI, nav, buttons, hero headline): **Montserrat** or Inter. Nav: 12px, uppercase, tracking `0.05em`, weight 500.
- Serif (logo, promo heading, section feel): **Playfair Display** or similar high-contrast serif.
- Logo `PURELIS`: serif, uppercase, tracking `0.15em`, with small `SKINCARE` below (8px, tracking `0.3em`) and leaf icon above the `I`.
- Hero H1: 2 lines. `NATURALLY PURE.` in ink, `BEAUTIFULLY YOU.` in forest. ~44-56px, weight 700, uppercase. (Second line slightly larger.)
- Hero subtext: 14-16px, ink/muted, 2 lines.
- Section titles (`SHOP BY CATEGORY`, `NEW ARRIVALS`): serif-leaning, uppercase, 20-24px, centered, weight 600.
- Promo heading `Up to 25% Off Sitewide`: serif, ~40px, ink. Eyebrow `GOOD FOR YOUR SKIN. GOOD FOR THE PLANET.`: 13px, uppercase, forest, tracking `0.1em`.
- Product name: 13px medium. Price: 14px semibold. Button text: 11px uppercase, tracking `0.08em`, weight 600.

### 2.4 Layout and sections (top to bottom)

1. **Announcement bar**
   - `bg-forest text-white text-xs`, height ~32px, centered text: `Free shipping on orders over ₹499 | Use code: PURE20 for 20% OFF`; social icons (Facebook, Instagram, YouTube) right.

2. **Header**
   - White, height ~72px, border-bottom `line`. 3 zones: logo (left), nav centered (`HOME` active in forest, `SHOP ⌄`, `COLLECTIONS ⌄`, `ABOUT US`, `BLOG`, `CONTACT`, gap-8), icons right (search, user, cart with count badge).

3. **Hero**
   - Height ~320px (mobile-first: stacks), `bg-gradient-to-r from-sage-bg to-sage-soft`, blurred leaf shadow overlay top-right.
   - Left: headline, subtext, `SHOP NOW` button (forest, px-8 py-3, sharp corners).
   - Right: three product shots (face wash tube, dropper serum, moisturizer jar) on a stone/travertine plinth with leaves and a white flower.

4. **Trust strip**
   - `bg-cream`, 4 columns, each: line icon (leaf, flask, rabbit, droplet) + bold title + muted subtitle:
     `Natural Ingredients / Safe & toxin-free`, `Clinically Tested / Dermatologically proven`, `Cruelty Free / We never test on animals`, `For All Skin Types / Gentle & effective care`.

5. **Shop by category**
   - Centered title, 6-column grid (`grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3`). Each tile: image (aspect ~4/5) + label bar below (white, 11px uppercase, centered): `CLEANSERS`, `SERUMS`, `MOISTURIZERS`, `SUN CARE`, `SKIN CARE KITS`, `BEST SELLERS`.

6. **Promo banner**
   - Full-width within container, `bg-sage-soft`, ~230px tall. Left: eyebrow, serif heading, `EXPLORE OFFERS` button (forest). Below: 3 icon+label items (`Clean Beauty`, `Sustainable`, `Eco-Friendly Packaging`) in 11px with line icons. Right: flat-lay of toner bottle, cream jar, SPF tube with leaves.

7. **New arrivals**
   - Title centered with `VIEW ALL` underlined link right. 4-column grid, gap-4.
   - Product card: white, 1px `line` border, image area (tinted bg, ~1:1) with heart icon top-right, name centered, price centered, `ADD TO CART` button (forest, small, px-6 py-2).
   - Items: Calming Green Tea Face Wash `₹499`, Vitamin C Brightening Serum `₹799`, Hydra Barrier Moisturizer `₹649`, Tinted Lip Balm SPF 20 `₹299`.

8. **Footer**
   - `bg-cream`, 3 columns: (a) services list with icons: `FREE SHIPPING On orders over ₹499`, `EASY RETURNS 14 days return policy`, `SECURE PAYMENT 100% secure checkout`; (b) `SUBSCRIBE TO OUR NEWSLETTER` + helper text + email input (white, 1px border) joined to forest `SUBSCRIBE` button, social icons below (Facebook, Instagram, YouTube, Pinterest) as circular outlined icons; (c) `ABOUT PURELIS` paragraph + `LEARN MORE` underlined link.
   - Bottom bar: `bg-forest text-white text-xs`, left: `© 2025 Purelis Skincare. All Rights Reserved.`, right links: Privacy Policy | Terms & Conditions | Shipping Policy | Contact Us.

### 2.5 Responsive notes
- Reference width ~1440px, container `max-w-[1280px] mx-auto px-6`.
- <768px: hamburger nav, hero stacks (text above image), category grid 2 cols, product grid 2 cols, footer stacks.

---

## Part 3: Tailwind configuration

### 3.1 Tailwind v3 (`tailwind.config.js`)

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // CALM / KIT
        calm: {
          sage: "#6B7F6E",
          moss: "#A7B8A7",
          mist: "#D9E1D9",
          ivory: "#F4EFE8",
          sand: "#C9BDAF",
          canvas: "#F8F3ED",
          ink: "#1F2A23",
          body: "#2F3A33",
          muted: "#8A8F88",
          track: "#DDD9D3",
          online: "#4E8B5A",
        },
        // Purelis
        purelis: {
          forest: "#1F4A12",
          "forest-deep": "#183A0E",
          leaf: "#5E7F4A",
          "sage-bg": "#DCE7D3",
          "sage-soft": "#EAF0E3",
          cream: "#F8F8F0",
          ink: "#1B2A16",
          muted: "#6B6F66",
          line: "#E3E5DC",
          blush: "#E8B7A8",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Montserrat", "Inter", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      letterSpacing: {
        label: "0.2em",
        title: "0.25em",
        subtitle: "0.4em",
      },
      borderRadius: {
        card: "28px",
      },
      boxShadow: {
        card: "0 10px 30px rgba(107,127,110,0.10), 0 2px 6px rgba(0,0,0,0.04)",
        raised:
          "0 6px 18px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.8)",
        knob: "0 2px 6px rgba(0,0,0,0.18)",
      },
    },
  },
  plugins: [],
};
```

### 3.2 Tailwind v4 (`app.css`)

```css
@import "tailwindcss";

@theme {
  --color-calm-sage: #6B7F6E;
  --color-calm-moss: #A7B8A7;
  --color-calm-mist: #D9E1D9;
  --color-calm-ivory: #F4EFE8;
  --color-calm-sand: #C9BDAF;
  --color-calm-canvas: #F8F3ED;
  --color-calm-ink: #1F2A23;
  --color-calm-body: #2F3A33;
  --color-calm-muted: #8A8F88;
  --color-calm-track: #DDD9D3;
  --color-calm-online: #4E8B5A;

  --color-purelis-forest: #1F4A12;
  --color-purelis-forest-deep: #183A0E;
  --color-purelis-leaf: #5E7F4A;
  --color-purelis-sage-bg: #DCE7D3;
  --color-purelis-sage-soft: #EAF0E3;
  --color-purelis-cream: #F8F8F0;
  --color-purelis-ink: #1B2A16;
  --color-purelis-muted: #6B6F66;
  --color-purelis-line: #E3E5DC;
  --color-purelis-blush: #E8B7A8;

  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Montserrat", "Inter", sans-serif;
  --font-serif: "Playfair Display", Georgia, serif;

  --radius-card: 28px;
  --shadow-card: 0 10px 30px rgba(107,127,110,0.10), 0 2px 6px rgba(0,0,0,0.04);
  --shadow-raised: 0 6px 18px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.8);
}
```

Fonts (add to `<head>`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## Part 4: Component class recipes (Tailwind)

### CALM / KIT

```html
<!-- Page -->
<body class="bg-calm-canvas font-sans text-calm-body">

<!-- Section label -->
<h3 class="text-[13px] font-medium uppercase tracking-label text-calm-body">01. Color Palette</h3>

<!-- Card -->
<section class="rounded-card bg-calm-ivory p-6 shadow-card border border-white/60">

<!-- Primary button -->
<button class="inline-flex h-14 items-center gap-3 rounded-full bg-calm-sage px-8 font-medium text-white shadow-raised transition hover:brightness-95">
  Primary <span>→</span>
</button>

<!-- Secondary button -->
<button class="h-14 rounded-full border border-calm-sand bg-calm-ivory px-8 font-medium text-calm-ink transition hover:bg-white">
  Secondary
</button>

<!-- Search input -->
<div class="flex h-14 items-center gap-3 rounded-full bg-calm-ivory px-5 shadow-raised">
  <svg class="h-5 w-5 text-calm-muted"></svg>
  <input class="flex-1 bg-transparent placeholder:text-calm-muted focus:outline-none" placeholder="Search anything..." />
  <span class="h-6 w-px bg-calm-sand/60"></span>
  <svg class="h-5 w-5 text-calm-ink"></svg>
</div>

<!-- Toggle (on) -->
<button role="switch" aria-checked="true" class="relative h-9 w-16 rounded-full bg-calm-sage transition">
  <span class="absolute right-1 top-1 h-7 w-7 rounded-full bg-white shadow-knob transition"></span>
</button>
<!-- Toggle (off): bg-calm-track, knob left-1 -->

<!-- Checkbox -->
<span class="grid h-8 w-8 place-items-center rounded-lg bg-calm-sage text-white"><!-- check --></span>
<span class="h-8 w-8 rounded-lg border-[1.5px] border-calm-sand bg-white"></span>

<!-- Profile card -->
<div class="flex items-center gap-4 rounded-3xl bg-calm-ivory p-5 shadow-raised">
  <div class="relative h-[88px] w-[88px] rounded-full bg-calm-sand">
    <span class="absolute right-1 top-1 h-3.5 w-3.5 rounded-full bg-calm-online ring-2 ring-white"></span>
  </div>
  <div class="flex-1">
    <p class="text-xl font-semibold text-calm-ink">Olivia Bennett</p>
    <p class="text-calm-muted">Product Designer</p>
    <p class="mt-1 text-sm text-calm-muted">San Francisco, CA</p>
  </div>
  <span class="h-16 w-px bg-calm-sand/60"></span>
  <button class="grid h-11 w-11 place-items-center rounded-full bg-white shadow-raised">•••</button>
</div>

<!-- Progress -->
<div class="flex items-center gap-4">
  <div class="h-8 flex-1 rounded-full bg-calm-track">
    <div class="h-full w-[72%] rounded-full bg-calm-sage"></div>
  </div>
  <span class="text-lg">72%</span>
</div>

<!-- Notification -->
<div class="flex items-center gap-4 rounded-2xl bg-calm-mist p-4 shadow-raised">
  <span class="grid h-12 w-12 place-items-center rounded-full bg-calm-sage text-white">✓</span>
  <div class="flex-1">
    <p class="text-xl font-semibold text-calm-ink">All set!</p>
    <p class="text-[15px] text-calm-muted">Your changes have been saved.</p>
  </div>
  <button aria-label="Close">✕</button>
</div>

<!-- Segmented tabs -->
<div class="grid grid-cols-3 divide-x divide-calm-sand/50 overflow-hidden rounded-2xl bg-calm-ivory shadow-raised">
  <button class="flex flex-col items-center gap-1 bg-calm-sage py-4 text-white">Home</button>
  <button class="flex flex-col items-center gap-1 py-4 text-calm-muted">Projects</button>
  <button class="flex flex-col items-center gap-1 py-4 text-calm-muted">Profile</button>
</div>

<!-- Bottom nav -->
<nav class="flex justify-around rounded-3xl bg-calm-ivory px-4 py-4 shadow-raised">
  <a class="flex flex-col items-center gap-1 text-calm-sage">Home<span class="h-1.5 w-1.5 rounded-full bg-calm-sage"></span></a>
  <a class="flex flex-col items-center gap-1 text-calm-ink">Search</a>
  <a class="flex flex-col items-center gap-1 text-calm-ink">Favorites</a>
  <a class="flex flex-col items-center gap-1 text-calm-ink">Settings</a>
</nav>
```

### Purelis

```html
<!-- Announcement bar -->
<div class="flex h-8 items-center justify-center bg-purelis-forest px-6 text-xs text-white">
  Free shipping on orders over ₹499 | Use code: PURE20 for 20% OFF
</div>

<!-- Header nav link -->
<a class="font-display text-xs font-medium uppercase tracking-wide text-purelis-ink hover:text-purelis-forest">Shop</a>
<a class="font-display text-xs font-medium uppercase tracking-wide text-purelis-forest">Home</a>

<!-- Hero -->
<section class="bg-gradient-to-r from-purelis-sage-bg to-purelis-sage-soft">
  <div class="mx-auto grid max-w-[1280px] items-center gap-8 px-6 py-12 md:grid-cols-2">
    <div>
      <h1 class="font-display text-4xl font-bold uppercase leading-tight text-purelis-ink md:text-5xl">
        Naturally pure.<br><span class="text-purelis-forest">Beautifully you.</span>
      </h1>
      <p class="mt-4 max-w-sm text-sm text-purelis-muted">Clean, effective &amp; cruelty-free skincare enriched with nature's finest ingredients.</p>
      <a class="mt-6 inline-block bg-purelis-forest px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white hover:bg-purelis-forest-deep">Shop Now</a>
    </div>
  </div>
</section>

<!-- Trust strip -->
<div class="bg-purelis-cream">
  <div class="mx-auto grid max-w-[1280px] grid-cols-2 gap-6 px-6 py-5 md:grid-cols-4">
    <div class="flex items-center gap-3">
      <svg class="h-7 w-7 text-purelis-leaf"></svg>
      <div><p class="text-xs font-semibold text-purelis-ink">Natural Ingredients</p><p class="text-[11px] text-purelis-muted">Safe &amp; toxin-free</p></div>
    </div>
  </div>
</div>

<!-- Section title -->
<h2 class="text-center font-serif text-xl font-semibold uppercase tracking-wide text-purelis-ink">Shop by Category</h2>

<!-- Category tile -->
<a class="block overflow-hidden border border-purelis-line bg-white">
  <img class="aspect-[4/5] w-full object-cover" alt="">
  <span class="block py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-purelis-ink">Cleansers</span>
</a>

<!-- Promo banner -->
<section class="bg-purelis-sage-soft p-8 md:p-12">
  <p class="text-[13px] font-medium uppercase tracking-[0.1em] text-purelis-forest">Good for your skin.<br>Good for the planet.</p>
  <h2 class="mt-3 font-serif text-4xl text-purelis-ink">Up to 25% Off<br>Sitewide</h2>
  <a class="mt-5 inline-block bg-purelis-forest px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">Explore Offers</a>
</section>

<!-- Product card -->
<article class="border border-purelis-line bg-white text-center">
  <div class="relative aspect-square bg-purelis-sage-soft">
    <button class="absolute right-3 top-3 text-purelis-ink" aria-label="Wishlist">♡</button>
  </div>
  <h3 class="mt-3 text-[13px] font-medium text-purelis-ink">Calming Green Tea Face Wash</h3>
  <p class="mt-1 text-sm font-semibold text-purelis-ink">₹499</p>
  <button class="my-4 bg-purelis-forest px-6 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white hover:bg-purelis-forest-deep">Add to cart</button>
</article>

<!-- Newsletter -->
<form class="flex">
  <input class="flex-1 border border-purelis-line bg-white px-3 py-2 text-xs placeholder:text-purelis-muted" placeholder="Enter your email address">
  <button class="bg-purelis-forest px-5 text-[11px] font-semibold uppercase tracking-wide text-white">Subscribe</button>
</form>

<!-- Footer bottom bar -->
<div class="bg-purelis-forest px-6 py-3 text-xs text-white">
  <div class="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-2">
    <span>© 2025 Purelis Skincare. All Rights Reserved.</span>
    <span class="flex gap-4"><a>Privacy Policy</a><a>Terms &amp; Conditions</a><a>Shipping Policy</a><a>Contact Us</a></span>
  </div>
</div>
```

---

## Part 5: Quick reference

| Property | CALM / KIT | Purelis |
|---|---|---|
| Mood | Soft, calm, rounded | Clean, natural, editorial |
| Corners | `rounded-full`, `rounded-3xl`, `rounded-card` (28px) | Sharp (`rounded-none`) |
| Primary color | `#6B7F6E` sage | `~#1F4A12` forest |
| Surface | `#F4EFE8` ivory on `~#F8F3ED` | White / `~#F8F8F0` cream |
| Font | Inter | Montserrat + Playfair Display |
| Depth | Diffuse soft shadows | Flat, 1px borders |
| Icons | Outline, 24-28px, 1.5px stroke | Outline, 24-28px, 1.5px stroke |
| Spacing base | 4px scale, card padding 24px | 4px scale, container 1280px |

### Accessibility notes
- `text-calm-muted` on ivory is ~3:1 contrast; use it for placeholders and secondary text only, and use `calm-body` for essential text.
- White on `calm-sage` (`#6B7F6E`) is ~4.2:1; keep button text at 16px+ medium weight.
- Always add `aria-label` to icon-only buttons (close, wishlist, menu) and visible focus rings (e.g. `focus-visible:ring-2 ring-calm-sage/50`, or `ring-purelis-forest/50`).
- Use `role="switch"` + `aria-checked` for toggles.
