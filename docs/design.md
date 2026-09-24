# Design — UI/UX & Design Tokens

Reference: [`assignment/Objective_Page.png`](./assignment/Objective_Page.png). Light theme, card-based, teal brand on white. Typeface **Poppins** (600/700 headings, 400/500 body) — matches the reference's geometric sans.

## 1. Color palette

| Token | Hex | Tailwind equivalent | Usage |
|---|---|---|---|
| `primary` | `#0E7C74` | teal-700 (adjusted) | Primary buttons (Upload Submission, Refer Now), active tab, ENG pill |
| `primaryStrong` | `#0B655E` | — | Button pressed state |
| `accent` | `#0D9488` | teal-600 | Countdown digits, links, position labels, icons |
| `mint` | `#E7F4F1` | — | Banner/card backgrounds (countdown, refer, registered badge bg, play buttons) |
| `mintBorder` | `#D3EAE5` | — | Mint card borders |
| `navy` | `#1C3D5A` | — | Headings, prices, names, primary text |
| `textBody` | `#5B7183` | slate-500 | Body copy, subtitles |
| `textMuted` | `#8FA3B0` | slate-400 | Captions, labels ("Judge", timestamps) |
| `border` | `#E9EEF2` | gray-200 | Card borders, dividers |
| `surface` | `#FFFFFF` | white | Cards |
| `bg` | `#F7FAFB` | gray-50 | Screen background |
| `chipBg` | `#F1F5F7` | gray-100 | Chips, pill backgrounds |
| `amber` | `#F59E0B` | amber-500 | "Hurry up!" alarm, 1st-place trophy |
| `silver` | `#94A3B8` | slate-400 | 2nd/3rd medals, star outlines |
| `danger` | `#DC2626` | red-600 | Destructive/error text |
| `success` | `#0D9488` | teal-600 | Registered badge, submitted state |

## 2. Typography scale (Poppins)

| Style | Size/line | Weight | Usage |
|---|---|---|---|
| `title` | 22/30 | 700 | Competition title |
| `heading` | 17/24 | 600 | Section titles ("Important Dates", "Rewards") |
| `price` | 24/32 | 700 | ₹1,500 / ₹99 |
| `body` | 13.5/21 | 400 | Paragraphs |
| `bodyStrong` | 14/20 | 600 | Names, row labels |
| `caption` | 12/16 | 400 | Time labels, subtitles |
| `chip` | 12/16 | 500 | Chips, badges, buttons small |

## 3. Spacing & radii

- Base unit **4**; screen gutter **16**; card padding **14–16**; section gap **12**; grid gap **8**.
- Radius: cards **16**, inner panels **12**, buttons **12**, chips **8**, pills **999**, progress bar **999**.
- Shadows: none/faint — cards defined by 1px `border` (matches reference, better for low-end devices).

## 4. Core component styles

- **Card:** `surface` bg, radius 16, border `#E9EEF2`, padding 16.
- **Primary button:** `primary` bg, white 600 label, radius 12, height 52; disabled 40% opacity; subtitle line 12px white 70%.
- **Pill/badge (Registered):** `mint` bg, radius 999, teal check-circle icon + teal 500 label.
- **Chip:** `chipBg` bg, navy 500 text, radius 8, padding 6×10.
- **Progress bar:** track `#DDE7EA` radius 999 h6; fill `accent`; right-aligned "N / M Booked" caption.
- **Countdown banner:** mint bg radius 12; hourglass icon; "Registration closes in" navy 600; digits teal 700; alarm + "Hurry up!".
- **Tabs:** inactive `textBody`; active navy 600 with 2.5px `accent` underline; hairline divider row.
- **Input (referral link):** white bg, `mintBorder` border, radius 10, readonly, 12px text + "Copy Link" bordered button.
- **Ad slot:** dashed `border` radius 12, megaphone + "Ad Here" muted.
- **Empty state:** icon + one-line message in `textMuted` (e.g., "No winners announced yet").
- **Skeleton:** `#EEF2F5` shimmering blocks shaped like cards; used while loading.
- **Error state:** centered icon, message, "Try again" primary button.
- **Bottom tab bar:** white, top hairline; 5 slots; center **+** raised teal rounded-square (radius 12, 48×44) overlapping bar; active item teal, inactive silver; Profile shows avatar.

## 5. Motion

- Countdown ticks every second (text-only, no layout shift — tabular alignment).
- "View more" expands with height animation; tab switch is instant content swap (no parallax gimmicks).
- Button press: opacity 0.9. No ambient animation elsewhere — discipline per reference.

## 6. Accessibility

- All touch targets ≥ 44×44; icon-only controls have `accessibilityLabel`.
- Text contrast: navy on white 10.6:1, teal-600 on white 4.6:1 (AA for large/bold where used), white on primary 5.1:1.
- Respect `prefersReducedMotion` (skip expansion animation).
