---
name: Brew.log
description: A coffee brewing journal where the parameters are the content — near-monochrome, typographic, built so the next cup can be better than the last.
colors:
  ink: "#0a0a0a"
  paper: "#ffffff"
  annotation-gray: "#717171"
  rule-gray: "#8e8e8e"
  hairline-gray: "#e7e7e7"
  wash: "#f5f5f5"
  correction-red: "#e7000b"
typography:
  display:
    fontFamily: "Inter Tight, PingFang TC, Noto Sans TC, Microsoft JhengHei, sans-serif"
    fontSize: "clamp(4rem, 8vw, 7.5rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter Tight, PingFang TC, Noto Sans TC, Microsoft JhengHei, sans-serif"
    fontSize: "clamp(2.5rem, 4vw, 3.75rem)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter Tight, PingFang TC, Noto Sans TC, Microsoft JhengHei, sans-serif"
    fontSize: "clamp(1.75rem, 2.7vw, 2.5rem)"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  subtitle:
    fontFamily: "Inter Tight, PingFang TC, Noto Sans TC, Microsoft JhengHei, sans-serif"
    fontSize: "clamp(1.125rem, 1.35vw, 1.25rem)"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Inter Tight, PingFang TC, Noto Sans TC, Microsoft JhengHei, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "-0.015em"
  label:
    fontFamily: "Inter Tight, PingFang TC, Noto Sans TC, Microsoft JhengHei, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  none: "0px"
  pip: "9999px"
spacing:
  row: "12px"
  field: "24px"
  block: "40px"
  section-tight: "48px"
  chapter: "144px"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-quiet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
  button-quiet-hover:
    backgroundColor: "{colors.wash}"
    textColor: "{colors.ink}"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  text-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "0px"
  data-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "12px 0px"
    width: "832px"
---

# Design System: Brew.log

## Overview

**Creative North Star: "The Lab Notebook"**

Brew.log is a lab notebook for coffee. The parameters are the content: dose, ratio, temperature, grind, time, and a five-axis taste profile. Everything the interface does is in service of two questions — *can I reproduce this cup*, and *what do I change next time*. Typography and rules do all the work; there is no color to fall back on, and that constraint is the point. When four levels of hierarchy have to come out of one ink and three grays, every decision has to be deliberate.

The system is near-monochrome by commitment, not by austerity fashion. Ink on paper, three functional grays, and one red reserved for correction. Density is generous at the chapter level and tight inside a record: a page breathes between its sections and then packs its figures close, because a recipe is read as a block, not as a list. Data rows are measured (832px) while headings run the full width of the shell — the hairline ends where the content ends, and a rule that outruns its content reads as a row that failed to load.

The clearest expression of the whole system is a brew's ratio: `1:16.7` at up to 120px, a quiet `(Ratio)` label above it, and the unit inside the number set in gray. Four levels of hierarchy, zero color. Anything new should be able to justify itself the same way.

**Anti-references — this product is none of these:**

- **Not a dashboard.** No card grids, KPI tiles, progress rings, or trend charts. The AI produces a next action, not a statistic.
- **Not a lifestyle app.** No hero photography, no warm palette, no handwriting faces, no coffee-bean iconography. This is an instrument, not a magazine about coffee.
- **Not a SaaS landing page.** No gradients, no accent-colored CTA, no "three cards explaining the features".

**Key Characteristics:**

- One ink, three grays, one correction red — no accent color exists
- Hierarchy built from type size, weight, and gray level only
- Hairline rules and whitespace instead of cards, shadows, or fills
- Figures are foreground; labels are demoted into gray parentheses
- Sharp corners everywhere except the radio pip
- Traditional Chinese and English are equal-tier, with their own typographic metrics

## Colors

A single ink on paper, three grays that each have one job, and one red that only ever means "this is wrong".

### Primary

- **Ink** (`#0a0a0a`): Every piece of primary content — headings, figures, values, the border of a commit button, and the focus ring. There is no second brand color; emphasis is produced by size, weight, and the gray levels below, never by hue.

### Neutral

- **Paper** (`#ffffff`): The only background. Surfaces are never tinted to imply grouping or depth.
- **Annotation Gray** (`#717171`, 4.88:1 on paper): Secondary text — field labels inside parentheses, dates, hints, subtitles, empty states, quota lines. It is the margin note beside the record, and it passes AA as body text because it carries real information, not decoration.
- **Rule Gray** (`#8e8e8e`, 3.28:1 on paper): Borders that have to *carry* something — the outline of a control (an input has no fill, so its border is the only thing saying it is an input) and the unfilled half of a scale. On a 0–10 bar the empty segments **are** the data; they are what says the scale runs to ten.
- **Hairline Gray** (`#e7e7e7`): Purely decorative rules — row separators, section hairlines, the AI panels' dashed frame. Things you read past.
- **Wash** (`#f5f5f5`): The hover fill of a quiet button. The only tinted surface in the system, and only as a response to a pointer.

### Tertiary

- **Correction Red** (`#e7000b`, 4.76:1 on paper): Validation errors, destructive actions, and nothing else. It is the only hue in the product; spending it anywhere else destroys its meaning.

### Named Rules

**The One Ink Rule.** There is no accent color and none may be introduced. If something needs to stand out, it gets more size, more weight, or a darker gray — never a hue. The single exception already spent is Correction Red, and Google's mark on the OAuth button, which is a third-party brand asset and not part of this palette.

**The Two Weights Rule.** Every border is either decorative (Hairline Gray, 10%) or load-bearing (Rule Gray, 46%). Before styling a border, ask whether it encodes information or identifies a control. If yes it must clear 3:1 and use Rule Gray. If it only separates, it uses Hairline Gray. There is no third weight.

## Typography

**Display / Body Font:** Inter Tight (with `PingFang TC`, `Noto Sans TC`, `Microsoft JhengHei`, `sans-serif`)

One family carries the entire system. Latin runs in Inter Tight; Han characters fall through per-glyph to the system CJK faces, all of which are resident on their platforms, so zh-Hant costs nothing to serve.

**Character:** Tight, neutral, and slightly condensed — a face that reads as instrumentation rather than editorial voice. Negative tracking on the large sizes keeps headlines dense; the 13px label size deliberately tapers that tracking back to normal so small text stays legible.

### Hierarchy

- **Display** (500, `clamp(4rem, 8vw, 7.5rem)`, 1.0, −0.02em): Graphical numbers only, never an `h1`–`h6`. In practice this slot is spent on one thing per page at most — a brew's ratio. If a page has no single number that decides something, it has no display type.
- **Headline** (500, `clamp(2.5rem, 4vw, 3.75rem)`, 1.12, −0.02em): The page title. One per page.
- **Title** (500, `clamp(1.75rem, 2.7vw, 2.5rem)`, 1.25, −0.02em): Section headings, and the figure values in a recipe grid. Form section headings use this same step — a `Taste` heading is the same size whether you are reading a brew or writing one.
- **Subtitle** (500, `clamp(1.125rem, 1.35vw, 1.25rem)`, 1.4, normal): List-row titles.
- **Body** (400, 16px, 1.45, −0.015em): Paragraphs, data rows, field labels, form controls. 16px is a floor on mobile, not a preference — iOS Safari force-zooms focused inputs below it.
- **Label** (400, 13px, 1.4, normal): Meta text, captions, hints, dates, quota lines. The page kicker uses this size in uppercase with `0.08em` tracking, which is what separates a category tag from an ordinary gray meta line.

### Named Rules

**The Single Scale Rule.** Six steps exist and nothing else. Never reach for a raw utility size (`text-3xl`, `text-sm`) — if a size seems missing, the design is wrong, not the scale. The one sanctioned exception is the `Brew.log` wordmark, which is a logotype sized to itself and carries a comment saying so.

**The Han Metrics Rule.** Traditional Chinese gets its own metrics, applied via `:lang(zh-Hant)`: letter-spacing returns to `normal` at every size, body line-height opens from 1.45 to 1.75, and label from 1.4 to 1.6. Han glyphs fill their em box and have no ascenders or descenders to create optical leading, so Latin's negative tracking closes their counters and Latin's leading reads cramped. Any new type role must set both metrics or it is only half-designed.

**The Gray Parenthesis Rule.** A read-only field label is demoted by wrapping it in gray parentheses — `(Dose)`, `(Ratio)`, `(Cupping)` — while its value stays ink. This is the system's signature and it belongs to *read* contexts only. Data-entry forms use a solid high-contrast label above the control instead, because a fill target needs a label you can find before you have a value.

## Layout

The shell is centered with a 1500px maximum (`max-w-375`) and 12px / 20px side padding. Desktop compositions are drawn against a 1500px reference artboard, and the single breakpoint that matters is `md` (768px).

**Vertical rhythm is proportional to content weight, not uniform.** Major chapters — the page header, then each substantive section — are separated by 144px on desktop (80px on mobile). Sections whose body is a single line or a single link are grouped together and separated by 48–80px instead, with only 16px between such a heading and its content. A 144px gap above four gray words does not say "new chapter"; it says "something failed to load."

**Data rows are measured; headings are not.** Field rows, taste scales, and scale inputs share one 832px maximum so every hairline on a page ends on the same vertical, while headings and page titles run the full shell width. Rows use content-shaped columns (`8rem` label / `16rem` value / remainder for detail) so a label and its value sit adjacent; a row with no detail lets the value take the rest of the measure rather than wrapping early against an empty track.

List rows use a 12-column grid on `md` and stack on mobile, where the date leads the row as a small gray line instead of taking a column of its own. The date ships at every width: it is the journal's ordering principle, and the primary usage context is a phone at the brewing station.

**Density inside a record is tight.** Field rows are 12px vertical padding on a hairline; form fields sit on a 24px/40px gap grid; the recipe figure grid is 2 columns on mobile and 4 on desktop.

### Named Rules

**The Content-Ends-The-Rule Rule.** A hairline stops where its content stops, or the content reaches the hairline. A 1400px rule holding nine pixels of ink reads as a broken row, not a spare one. When a row cannot fill its width, cap the measure instead of stretching the content.

## Elevation & Depth

**This system has no depth.** There are no shadows, no cards, no tinted surfaces implying layers, and no scrims. Everything sits on paper at the same plane.

Separation is produced by exactly three devices: whitespace, hairline rules, and gray level. A "grouped" set of fields is grouped because it shares a heading and sits inside a rhythm, not because it is inside a box.

### Named Rules

**The No-Shadow Rule.** Never add a `box-shadow`, a card container, or a tinted panel to create grouping or emphasis. This is not a default that a brief can override — it is the system. If content needs separation, use space, a hairline, or a heading. The two dashed-border panels marking AI surfaces are the only enclosures in the product, and they are a deliberate signal that a machine wrote what is inside, not a depth device.

## Shapes

**Sharp corners, universally.** Buttons, inputs, textareas, scale segments, and panels are all `border-radius: 0`. The only curved element in the entire product is the radio pip, which is a circle because a radio is a circle everywhere.

Borders are 1px at both weights. Enclosures, when they exist at all, are the dashed AI panels. There is no clipping, no masking, and no recurring silhouette beyond the horizontal rule.

## Components

**Character: precise and restrained.** No element decorates itself. Every line in the interface has a job, down to the border weight — and the fact that a decorative rule and a load-bearing rule are visibly different densities is itself part of the language.

### Buttons

- **Shape:** Square (0 radius), 1px border, 8px/16px padding.
- **Primary:** Reserved for actions that **commit** — saving a record, creating an account, changing a password. Ink border and ink text on paper.
- **Hover / Focus:** Inverts completely — ink fill, paper text. The strongest element on the page is also the one that responds most. Focus adds the 2px ink ring at 2px offset.
- **Quiet:** An alternative route to the same destination, not a second decision — currently only "Continue with Google". Rule Gray border, Wash fill on hover.
- **Disabled:** Hairline Gray border, Annotation Gray text, no hover response.

### Text Buttons and Links

- **Style:** Underlined text at 4px offset, medium weight for the primary of a pair, Annotation Gray for the secondary.
- **Role:** Navigation, utilities, and destructive actions — signing out, exporting, cancelling, deleting. A destructive action is deliberately *not* the most prominent thing on its page.
- **Hover:** Fades to Annotation Gray. Never fades below it; a link that loses contrast when pointed at is a reversed affordance.

### Inputs / Fields

- **Style:** Transparent fill, 1px Rule Gray border, square corners. Because there is no fill, the border is the only thing identifying the control, which is why it is load-bearing rather than decorative.
- **Label:** Solid ink, medium weight, above the control. Required fields carry a gray asterisk — the majority here are optional, so marking the minority reads cleaner than tagging everything.
- **Hint:** Persistent Annotation Gray text below the field, preferred over a placeholder that vanishes on the first keystroke.
- **Focus:** Border inks to full foreground. Inputs opt out of the global focus ring (`outline-none`) because the border shift is a stronger and quieter signal.
- **Error:** Border and message turn Correction Red, `aria-invalid` is set, and the message replaces the hint at the same position wired through `aria-describedby`.

### Navigation

- **Desktop:** Body-size text links, 32px apart, top right. Active route is underlined.
- **Mobile:** A fixed bottom bar, 48px tall, links divided by hairlines, respecting `env(safe-area-inset-bottom)`.
- **Hover:** Annotation Gray.

### Data Row

The system's workhorse: a gray parenthetical label, an ink value, and an optional Annotation Gray detail, sitting on a hairline at 12px vertical padding within the 832px measure. Read-only contexts only.

### Segmented Scale (signature)

The five taste axes render as a ten-segment bar — filled segments in ink, unfilled in Rule Gray outline — with the numeral right-aligned to the end of the measure. The overall rating does **not**: on a brew it is a `Figure`, a Title-step numeral with a gray `/10`. This document previously claimed the rating was a bar too; the implementation is right and the claim was wrong. A verdict and its components should not be drawn in one language — the big numeral says "this is the conclusion" and the bars say "this is what it was made of" — and the numeral also widens the distance from the community 1–5 star meter, which must never look like the 0–10 self-rating. The same anatomy serves display and input, plus one narrow leading marker for an explicit 0 — ten counting segments can only express 1–10, and 0 is a real score. The marker sits outside the count, detached by a wider gap, so a 7 still shows seven filled segments; the display row needs no marker because it prints the numeral. This is the product's only visualization, and it exists because integers on a 0–10 scale need to stay countable at a glance.

As an input the row is **one radio group of native radios**, not a row of toggle buttons. Each segment keeps its 14px bar inside a 24×24 hit area — the zero marker included, its 16px bar centred in a full-size box. The browser then supplies the whole contract: one tab stop per axis rather than eleven, arrow keys that move and select, and a grouped announcement. The group is named by the axis and each radio by its bare numeral, so nothing here needs a sentence template — the one that existed shipped an English "7 of 10" to zh-Hant readers. Re-picking the current score clears the axis back to unrecorded; Backspace is the keyboard twin of that, because an already-checked radio swallows Space. An unscored axis submits no form key at all, which is how null survives the round trip.

**The Scale Is A Radio Group Rule.** Anything offering a fixed set of scores is a radio group, and it gets the browser's keyboard behaviour rather than a hand-rolled one. If a future control needs a roving tabindex or a keydown map to do what `<input type="radio">` already does, it is the wrong element.

### Star Meter

Community ratings (1–5) use a partial-fill star: an ink star clipped to a percentage over a Rule Gray outline, so an average can show a fraction. Distinct from the 0–10 self-rating scale on purpose — two different measurements must never look alike.

## Do's and Don'ts

### Do:

- **Do** build hierarchy from the six type steps and the three grays. Four levels without color is the demonstrated ceiling and the standard to meet.
- **Do** keep secondary text at or above **4.5:1** (Annotation Gray, `#717171`) and load-bearing borders at or above **3:1** (Rule Gray, `#8e8e8e`).
- **Do** give every interactive target at least **24×24px**, and reserve the 2px ink focus ring at 2px offset for every control that is not an input.
- **Do** end a hairline where its content ends. Cap the measure at 832px for data rows rather than stretching content across 1500px.
- **Do** size the gap to the section: 144px between chapters, 48px around a section that holds one line.
- **Do** set both `letter-spacing` and `line-height` for zh-Hant whenever a new type role is added.
- **Do** reserve Primary buttons for actions that write something. If everything is a button, nothing is.
- **Do** state limits as facts. Quotas exist because the product runs at zero cost; they are never framed as an upgrade prompt.

### Don't:

- **Don't** introduce an accent color, a gradient, or a tint. There is one ink, three grays, and one red.
- **Don't** add a shadow, a card, or a tinted panel. Grouping comes from space, hairlines, and headings.
- **Don't** use a raw type utility (`text-3xl`, `text-sm`, `text-2xl`). Six steps exist; the wordmark is the only documented exception.
- **Don't** round a corner. The radio pip is the only circle.
- **Don't** let a hover state reduce contrast below 4.5:1. Fading a link when it is pointed at inverts the affordance.
- **Don't** use Hairline Gray (`#e7e7e7`) for anything that encodes data or outlines a control — at 1.24:1 it is invisible, and the unfilled half of a scale is data.
- **Don't** use gray parentheses as a form label. That treatment belongs to read-only rows; entry fields get a solid ink label above the control.
- **Don't** render a missing value as zero. On a 0–10 scale, 0 is a real score and means the opposite of "not recorded" — use an em dash.
- **Don't** build a card grid, a KPI tile, a progress ring, or a trend chart. This is a notebook, not a dashboard.
