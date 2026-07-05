---
name: editorial-design
description: Editorial-style web design system (typography, grid, hierarchy, spacing, scale) for building interfaces that look premium, minimal, and intentional. Use this skill whenever you build or style any web UI — landing pages, app pages, dashboards, detail pages, forms, components — and whenever the user asks to "make it look better", mentions typography, layout, spacing, hierarchy, whitespace, or wants a clean / minimal / premium / editorial / Swiss look, even if they never say the word "design". Also use it when reviewing or critiquing existing UI.
---

# Editorial Web Design

Editorial design is visual journalism: **content is the hero; design only serves
it.** Personality comes from typography, scale, spacing, and whitespace — never from
added decoration. Four beliefs govern every decision:

1. **Less is more.** Editorial design mostly _removes_ things. If removing an
   element doesn't make the content harder to understand, remove it.
2. **Introduce with intent.** Every element, style, and color needs a reason you
   could defend out loud. "It looked empty" is not a reason — emptiness is a feature.
3. **Contrast must be obvious.** Timid contrast is the #1 beginner error. Overdo it
   first, then dial back. A five-year-old should see the difference between levels.
4. **Spend boldness in one place.** Restraint isn't the absence of a bold move — it's
   having exactly _one_. The permitted move is a huge quiet headline, a single
   full-bleed photograph, or one solid black chapter block. Pick one per page;
   everything around it stays disciplined. Before delivering, remove one more element
   than feels comfortable.

## The default visual grammar

This is the aesthetic the system produces. Follow it literally unless the project
has a documented art direction that overrides specific points. The most common way
to fail is not breaking a rule — it's "improving" the design with tasteful additions
(a serif display font, a warm tint, a colored section) until it becomes a generic
template. Resist. The restraint IS the style.

- **Canvas**: pure white `#fff`. Ink near-black `#111`. **Every gray is
  transparency-adjusted black, never a fixed gray hex**: secondary text
  `rgb(0 0 0 / 65%)`, tertiary/meta `rgb(0 0 0 / 40%)`, hairlines
  `rgb(0 0 0 / 10%)`. Alpha grays compose naturally over any surface — on a black
  block or a photo, flip to white alphas (`rgb(255 255 255 / 65%)` etc.) with the
  same steps. **No cream, beige, or warm tints. No accent color by default** —
  photography and imagery are the only color sources. An accent is opt-in (brand
  reason required), ≤10%, interactive elements only.
- **One typeface, sans-serif, neutral** (neo-grotesque): `"Helvetica Neue",
"Inter", Arial, sans-serif`. Headings font-weight 500, body 400. Size and gray are
  the only differentiators — that's enough. A second typeface (e.g. a serif or a
  monospace for data) is allowed only with a defensible art-direction reason.
- **Zero containers**: no cards, no box-shadows, no border-radius, no pill badges,
  no filled panels, no borders around boxes. Structure comes from whitespace and
  **1px hairline rules** only.
- **The ruled row is the workhorse.** Lists, specs, features, FAQs — everything
  tabular becomes rows separated by hairlines, laid on the column grid:

  ```css
  .row {
    display: grid;
    grid-template-columns: subgrid;
    grid-column: 1 / -1;
    border-top: 1px solid rgb(0 0 0 / 10%);
    padding-block: 12px;
  }
  .row__label {
    grid-column: span 2;
    color: rgb(0 0 0 / 65%);
  } /* "(01)" or "(Label)" */
  .row__value {
    grid-column: span 4;
  }
  ```

- **Labels demote with parentheses, not decoration**: `(Course)`, `(A)`, `(01)` —
  same size, gray, no pill. Or a tiny uppercase letterspaced micro-label. Section
  labels sit at the top-left corner of the section, on the grid.
- **Headlines are huge and quiet**: span 6–11 of 12 columns, weight 500,
  line-height 1.05–1.2, letter-spacing -0.02em, sentence case. The classic hero
  move: one headline block where the key sentence is black and the continuation
  sentence is gray, same size.
- **Sections separate by whitespace** (~120–200px desktop, ~64–96px mobile), not by
  background changes. The permitted rhythm breaks: a full-bleed photograph or a
  solid black full-width block (used sparingly, as chapters). Never alternate
  tinted backgrounds section by section.
- **CTAs**: nearly all links are plain or underlined text. At most one solid
  rectangle per page — black background, white text, **sharp corners**.
- **Nav**: plain small text on the white canvas. No bar background, border, blur, or
  shadow.
- **Numbers are graphic elements**: `01`–`05` step indexes, `(1)`–`(7)` FAQ
  indexes, big prices, stat figures — set large or as labels, aligned to the grid.

## Order of decisions

1. **Direction** — First pin the subject in one sentence: who this page serves and
   its _single_ job. That job decides which sentence is the black headline and which
   action is the one solid CTA — get it wrong and the hierarchy has nothing to point
   at. Then: what personality should this express? Derive it from the brand/product.
   The default grammar above is the starting point; direction only bends it with
   reasons (e.g. heritage brand → serif display for headings).
2. **Typography** — Define a type scale of 3–5 styles total (display / h1 / h2 /
   body / small), each with one job, encoded as CSS variables. Merge any two styles
   that are nearly the same size. See
   [references/typography.md](references/typography.md).
3. **Grid** — Column grid only: desktop 12 columns / mobile 4, margin = gutter =
   20px / 12px, max-width ~1500px. Align ~90% of elements to columns; break it
   deliberately for the other ~10% (a full-bleed image, a giant number).
4. **Layout** — Hierarchy via contrast, structure via spacing, rhythm via section
   flow. See [references/layout.md](references/layout.md).
5. **Responsive** — Hybrid scaling with `clamp()` (1500px reference width), cap
   small elements. See [references/responsive-ux.md](references/responsive-ux.md).

### The plan gate — write this before any code

Produce the plan as a short artifact first, then hold it at the gate: the type scale
(3–5 styles, each with its one job), the grid decision, and the page's single
takeaway line. Now audit it against one question — **is anything here decoration
rather than a decision?** The failure mode of this system is "improving" the design
with tasteful additions until it's a generic template, and additions are cheapest to
delete while they're still text in a plan. Cut them here, then write code to the plan
exactly. Deriving markup from an audited plan beats catching decoration in the
delivery checklist.

## Typography non-negotiables

Violating any of these reads as amateur at a glance:

- Negative tracking (~`-0.02em`) on all large headings.
- Never letterspace lowercase — `text-transform: uppercase` first, then track out.
- Body line-height 1.3–1.5; large headings tighter (can be ~1.0), judged by eye.
- No widows: `text-wrap: balance` on headings, `text-wrap: pretty` on paragraphs.
- Long text left-aligned. Center only short display statements.
- Huge graphical text (prices, stats, marquee words) lives in `<p>`/`<span>` with a
  display class — never `h1`–`h6` (semantics and SEO stay meaningful).

## Hierarchy and spacing

- People scan. Give each section one huge takeaway line; everything else is small.
  Adjacent levels differ ≥1.5–2×, never 19px-vs-21px.
- The cheapest contrast knob: **gray the supporting text** so the black headline
  pops. (Knobs: size, color, alignment, character, animation — turn 1–2 hard.)
- **Within-group spacing < between-group spacing, visibly.** Equal spacing
  everywhere erases structure; it's the most common layout mistake.
- Balance horizontally AND vertically — unchecked vertical spacing is the main
  reason layouts look cheap. When unsure, add more whitespace.
- Sections ≈ 80–120% of viewport height, one idea per screen. Web pages have no
  bottom edge — manufacture one (bottom-align to an image, end on a full-width
  rule/image, control the hero with `min-height: 100svh`).

## UX guardrails

- ≤4 parallel items per glance; headlines ≤3–4 lines. Five+ reads as work.
- Most valuable content first: visitor's problem + your solution at the top,
  "about us" last. First and last items in any sequence get the most attention.
- One primary goal per page: a single solid CTA; everything else is a text link.
- Controls keep their position across states (menu open/close button same spot).

## Data-entry & dense UI

The grammar above is tuned for a **presentation** surface — reading, being convinced,
one idea per screen. A form, table, or dashboard is an **input** surface, and a few of
those defaults actively work against it. When the surface is for entering or scanning
data, keep every editorial discipline — monochrome, sharp corners, one typeface, the
column grid, section labels — but switch these specific defaults:

- **Labels go solid, not demoted.** In read-only rows a label is grayed and
  parenthesized `(Roastery)` so the value leads. In a form the label is the scanning
  anchor: set it near-black, top-aligned, no parentheses. Parenthesized gray labels
  stay for display rows only.
- **Fields get a visible boundary.** Zero-container restraint makes a form ambiguous —
  the fill target and its edges must be obvious. Give inputs a 1px bordered box that
  inks to `--foreground` on focus. Sharp corners and monochrome keep it editorial; the
  box is affordance, not decoration.
- **Mark the minority.** When most fields are optional, flag the few required ones (a
  trailing `*`) rather than tagging every optional field — less noise, clearer signal.
- **Examples and units are persistent hint text**, set small and gray _below_ the
  field — never a placeholder that vanishes on the first keystroke, and never the only
  place a unit or format is stated. (A terse unit may live in the label on a dense
  numeric grid where a hint line per field would bloat it.)
- **Error is the one legitimate color.** This is the accent clause cashing out:
  validation red (`--destructive`) is a semantic, interactive signal, so it's allowed
  even in an otherwise monochrome form. Show it **per field** — red the field and state
  what to fix beneath it — plus a short form-level summary. Never collapse everything to
  one global error string. Wire `aria-invalid` and `aria-describedby` so the message is
  announced.
- **Density over one-idea-per-screen.** Don't give each field a viewport. Tighten
  section spacing and let related fields sit close; the proximity rules still hold
  (within-group < between-group), just at a smaller scale.
- **Match the control to the value.** A precise number is typed (`inputmode` on a text
  input), not dragged — a slider is for imprecise or graphic values. Choose the control
  that makes the real value easy to enter correctly.

The test is the same one editorial always applies: every element earns its place by
making the content easier to use. On an input surface, "easier to use" means fill it
fast and correctly — that's what these switches serve.

## Copy is design material

Content is the hero, so the words are part of the design — bring the same intent to
copy as to spacing and scale. Vague or clever copy makes a clean layout read as
templated just as fast as a stray box-shadow does.

- **Write from the reader's side.** Name things by what people control and recognize,
  never by how the system is built — a person manages notifications, not webhook
  config. Specific beats clever.
- **Active voice; consistent vocabulary.** A control says what happens: "Save
  changes," not "Submit." An action keeps its name across the whole flow — the button
  that says "Publish" produces a toast that says "Published."
- **Failure and emptiness are direction, not mood.** Errors say what went wrong and
  the next step, in the interface's voice — no apologies, never vague. An empty screen
  is an invitation to act.
- **Sentence case, plain verbs, no filler.** One job per element: a label labels, an
  example demonstrates, nothing quietly does double duty.

## Self-check before delivering

Squint at the result and verify:

- [ ] Is it white, black, and gray, with color only in imagery (or one justified accent ≤10%)?
- [ ] One sans family? Hierarchy from size + gray only? ≤5 text styles?
- [ ] Zero cards/shadows/rounded corners/pills? Rows ruled by 1px hairlines?
- [ ] Hierarchy levels obvious at a glance? Group spacing < section spacing?
- [ ] Headings tracked -0.02em, no lowercase letterspacing, no widows, body lh 1.3–1.5?
- [ ] One solid CTA max, everything else quiet text links?
- [ ] Does the page end deliberately (manufactured bottom edge) rather than trail off?
- [ ] Copy in the reader's terms, active voice, one job per element — no vague errors or empty states?
- [ ] If it's an input surface: solid labels, bordered fields, per-field errors, persistent hints, density over one-idea-per-screen?
