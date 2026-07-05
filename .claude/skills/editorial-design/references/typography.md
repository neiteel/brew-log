# Typography Reference

Typography is the core of editorial design: even a section with no color and no
imagery still has text, so type is the most constant carrier of personality.

## Classification = mood (how to choose a typeface)

Each classification was born in a historical era and carries that era's mood. Choosing
a typeface = mapping the brand's personality onto a classification, not picking what
looks nice.

**Serif** (strokes end in small feet):

| Subclass             | Traits                                             | Example     | Mood                      |
| -------------------- | -------------------------------------------------- | ----------- | ------------------------- |
| Old Style / Humanist | low contrast, diagonal stress, rounded serifs      | Garamond    | traditional, humane, warm |
| Transitional         | more contrast, vertical stress, flat-bottom serifs | Baskerville | classic, rational         |
| Modern               | extreme contrast, hairline serifs                  | Didot       | fashion, luxury           |
| Slab                 | no contrast, thick block serifs                    | Rockwell    | loud, advertising         |

**Sans-serif**:

| Subclass      | Traits                                          | Example         | Mood                          |
| ------------- | ----------------------------------------------- | --------------- | ----------------------------- |
| Grotesque     | slight contrast, double-story g, open apertures | Franklin Gothic | vintage-industrial            |
| Neo-grotesque | no contrast, single-story g, closed apertures   | Helvetica       | maximum neutrality, Swiss     |
| Humanist      | contrast, diagonal stress                       | Gill Sans       | friendly, humane              |
| Geometric     | built on circles/squares                        | Futura          | modern, constructed, Art Deco |

**Display** (designed for large sizes, short text only — never body copy). Includes
handwritten (casual, human) and script (formal calligraphy).

**Monospace** (every character same width): technical, experimental. Great for
metadata, data values, code-adjacent products.

Rule of thumb: body text gets a highly readable neutral face (neo-grotesque sans or a
text serif); personality lives in the headings.

## Display vs text variants

Some families ship both (SF Pro Display / SF Pro Text). Text variants have wider
tracking, taller x-height, and reduced stroke contrast so they survive small sizes.
Use Display for large headings, Text for body. If the font has no variants, simulate:
add negative tracking to large headings yourself (`letter-spacing: -0.02em`), and
leave body tracking at 0.

## Pairing (a system of jobs, not a collection)

**Default: no pairing.** One neutral sans in 1–2 weights, differentiated by size
and gray, carries an entire site (the strongest reference projects use exactly
this). Add a second face only when the direction demands it:

1. Choose the **display font** (personality) and **text font** (readability) first.
2. Add a secondary/accent font only if it has a distinct job.
3. **Consistency**: each font has a fixed job used identically across the whole site.
4. **Pairing within one family is the safest move**: one typeface, varied by weight,
   size, case, and color, can carry an entire site (e.g. one Medium weight, sizes and
   gray doing all the work).
5. **Contrast between paired fonts must be unmistakable** — serif × sans, or a big
   size gap. Two similar sans faces read as a mistake.

2–3 typefaces is the ceiling. When tempted to add one, first try weight/size/color
of an existing one.

## Type scale (the single source of truth)

A type scale is a flat list of every text style in the project + where it's used.
Its jobs: keep the design consistent, and give developers one place to look (each
text style ≈ one CSS class).

- Aim for **3–5 styles**. If two styles are nearly identical, merge them.
- A paragraph style can reuse a heading's size with only a color change (gray) —
  one fewer style, hierarchy intact.
- Keep 1–2 "graphical" one-off styles outside the scale for special moments
  (huge numbers, marquee words). These do **not** occupy `h1`–`h6` semantics.
- One scale per breakpoint (desktop + mobile is enough).
- In CSS, encode it as variables/utilities so no ad-hoc font sizes appear in
  components.

## Characters as graphic elements

Editorial design doesn't use decorative graphics — it uses the typographic system's
own parts to add interest, grouping, and wayfinding without visual noise:

- **Dashes / slashes** — connect things that belong together, catch the eye.
- **Arrows** — direct attention; use for CTAs.
- **Parentheses** — demote secondary info _without_ shrinking or graying it:
  `(Label)` reads as metadata at the same size and color.
- **Numbers** — `01 / 02 / 03` prefixes group items and guide scanning, and act as
  compositional weight.
- **Business characters** (© ® ™) — trendy compositional detail; only if truly
  registered.
- **Indents and drop caps** — traditional flavor; an indent creates an alignment
  line other elements can hang from.

## The pro-detail checklist

The difference between good and great is the sum of these small calls:

- Never letterspace lowercase; uppercase first, then track out.
- No widows (`text-wrap: balance` / `pretty`, or rewrite the line).
- Body line-height = size × 1.3–1.5. Big headings: tighter, judged by eye, can be
  negative (140/130).
- Long text left-aligned, always.
- Large headings get negative tracking (~-2%).
- At least 2–3 clearly distinct hierarchy levels in any type-driven layout.
- Low x-height fonts are display-only, not body.
