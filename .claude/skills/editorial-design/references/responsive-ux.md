# Responsive & UX Reference

## Responsive strategy: hybrid (fixed scaling + breakpoints)

Pure fluid layouts drift into widows and odd spacing at in-between widths — you lose
control of the design. Pure breakpoints jump abruptly. The hybrid keeps every width
looking like the design:

- **Between breakpoints, scale proportionally** — the layout keeps its exact
  proportions (a 4-line headline stays 4 lines) as the window narrows, until a
  breakpoint swaps in the next layout.
- **Design reference width: ~1500px desktop.** Tablet portrait gets its own pass
  only if needed; tablet landscape is just scaled-down desktop.
- `clamp(min, ideal-vw, max)` is the CSS embodiment: the `vw` term is the
  proportional scaling, `max` is the cap.

```css
/* type that scales with the viewport but is capped */
h1 {
  font-size: clamp(2.5rem, 4vw, 3.75rem);
} /* 60px @1500 */
```

### Big screens

Scaling everything up forever makes small elements (nav, labels) comically large and
the whole site unwieldy:

- **Cap small elements** — e.g. nav text `clamp(16px, 1.4vw, 25px)`; past the cap
  the element stops growing.
- **Past the "too big" width, switch to fluid**: spacing keeps growing, font sizes
  stop, heading line-heights adjust. The layout visibly changes; that's the price
  of usability.

### Full-viewport sections

Use `100svh` (not `100vh`) so mobile browser chrome collapsing doesn't cause jumps.

## UX rules (conversion & attention)

All of these fight the same enemy: users are lazy, and anything that looks like work
gets skipped.

1. **≤ 4 parallel items per glance.** Four can be taken in at once; five+ reads as
   a task. Split long navs into two groups; keep headlines to 3–4 lines.
2. **Attention decays down the page** (heatmaps are red at top, blue at bottom).
   Put the most valuable information first; keep a findable CTA throughout.
3. **Controls keep their position across states.** The button that opens the menu
   sits exactly where the button that closes it appears.
4. **Lead with the visitor's problem + your solution + their benefit.** "About us /
   team" goes near the bottom — trust matters only after relevance is established.
5. **Copy and design are equal partners**: design earns the read and makes things
   findable; copy does the selling.
6. **First impressions are one-shot** — one distinctive moment (type, first scroll,
   load animation) makes the site memorable; keep it aligned with the direction.
7. **Beauty converts.** Attractive interfaces are perceived as more usable and more
   trustworthy; polish is business value, not vanity.
8. **First and last items in any sequence get the most attention** — order navs and
   headline lines accordingly.
9. **One primary goal per page.** A single primary CTA; every additional competing
   ask dilutes conversion (choice paralysis). Demote the rest to text links.

Exception: these rules assume a conversion-oriented page. Editorial/archival pages
can relax the counts — but never the "don't make it look like work" principle.
