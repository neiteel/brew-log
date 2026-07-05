# Layout Reference: Grid, Hierarchy, Spacing, Scale, Flow

## Column grid (the backbone)

A grid is an invisible skeleton of columns that gives every element a shared
alignment line. Messy layouts are almost always layouts where edges don't share a
baseline. Use **column grids only** — Fibonacci/golden/modular grids are theory you
don't need.

Defaults (safe in almost every project):

- **Desktop: 12 columns**, margin 20px, gutter 20px, content max-width ~1500px.
- **Mobile: 4 columns**, margin 12px, gutter 12px.

```css
.wrap {
  max-width: 1500px;
  margin-inline: auto;
  padding-inline: 20px;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
}
@media (max-width: 600px) {
  .wrap {
    padding-inline: 12px;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
}
```

Column-count character: **even columns = balanced, symmetric** (12 divides by
2/3/4 — flexible and calm); **odd columns (5) = asymmetric, experimental**. If
desktop uses odd, mobile must use odd too — the temperaments must match.

**The 90/10 rule**: align ~90% of elements to columns (order), deliberately break
the grid for ~10% (highlights) — a full-bleed image (`grid-column: 1 / -1`), a huge
number spanning everything, a footer list that ignores columns. Grid serves you;
don't be imprisoned by it, and don't ignore it either (only ever using
left/center/right alignment = no editorial feel at all).

**Grids also work vertically.** When two adjacent sections look _different_
(image-heavy vs text), share an alignment line between them to stitch them together.
When they look _similar_ (both white, text-heavy), deliberately offset their
alignment so the reader feels the section change. Two questions decide placement:
"do these belong together?" and "what is their relationship?"

**Optional: 8px vertical rhythm** (8/16/24/36/44…) as a spacing scale — useful as
training wheels and for design systems; hand-tuned spacing is fine for custom work.

## Hierarchy: five contrast knobs

The eye goes to whatever differs from its surroundings. To create a focal point,
create difference — five ways:

1. **Size** — the big thing wins. The headline gets the content's single most
   valuable sentence, huge.
2. **Color** — works in reverse too: gray the supporting text so the black headline
   pops harder.
3. **Alignment** — the element that breaks the expected alignment gets attention.
4. **Character** — texture/shape/underline/prefix, e.g. `(01)` before a title.
5. **Animation** — the element that moves last on load steals the final glance.

Turn 1–2 knobs hard rather than all five gently. Timid contrast is the defining
beginner error: **overdo it first, then dial back**. Adjacent levels should differ
by roughly 1.5–2× or more, never 19px-vs-21px.

## Spacing: proximity is structure

The brain groups whatever sits close together. So spacing isn't decoration, it's
information architecture:

- **Within-group spacing < between-group spacing, always and visibly.** Equal
  spacing everywhere is the most common layout error and it erases all structure.
- Groups nest: a section splits into major groups, each with its own tighter
  internal rhythm.

```css
.group > * + * {
  margin-top: 8px;
} /* inside a group: tight */
.section > .group + .group {
  margin-top: 48px;
} /* between groups: loose */
```

## Whitespace and balance

- Whitespace does two jobs: **function** (separating unrelated groups) and **mood**
  (generous emptiness reads premium, confident, expensive; packed reads cheap).
  Knowing what _not_ to put somewhere is a superpower.
- **Balance = horizontal + vertical.** Everyone aligns horizontally; forgetting
  vertical spacing relative to neighboring elements/edges is the main reason a
  layout feels cheap. Every element sits relative to something — an image next to
  text becomes that text's "edge"; check both axes against it.
- For a premium moment, give one element an entire viewport with nothing competing.

## Page flow: viewports, rhythm, repetition

A page is sections stacked; flow is the rhythm of scrolling through them.

- **Section height ≈ 80–120% of the viewport** — one idea per screen. A section
  with little content earns its height through scale, imagery, or whitespace. Two
  unrelated topics sharing a screen get misread as one group.
- **Rhythm = visual breaks between sections.** Simplest: alternate white sections
  with image/color-block sections. Also works: alternating big type ↔ quiet type,
  a full-width rule, a full-bleed image. A rule that spans only the grid (not the
  full width) says "these items are one set"; a full-width rule says "new
  chapter".
- **Repetition marks a set.** Repeating one layout for N features (even mirrored
  left/right) tells users "same kind of thing". Never reuse the previous section's
  layout for an unrelated next section — the reader won't notice the boundary.

## Scale

Scale **is** contrast. Huge type creates highlight moments and gives everything
else breathing room. There are no design police: make the number/word enormous,
check it reads at a squint, then dial back only if it fights the content. Remember
huge graphical text is styled with a display class, not `h1`.

## The bottom-edge problem (print vs web)

Print controls all four edges; a scrolling page has no bottom edge, so lower edges
of layouts feel like they trail off. Manufacture an edge:

1. **Align to a neighbor's bottom** — text column bottom-aligned to the image
   beside it (`align-items: end`).
2. **Cut a hard edge** — end the section with a full-width image, color block, or
   rule.
3. **Horizontal scrolling** — fixed height brings the bottom edge back (closest to
   print spreads).
4. **Control the hero** — `min-height: 100svh` with
   `justify-content: space-between` pins key content to the fold on every aspect
   ratio.
