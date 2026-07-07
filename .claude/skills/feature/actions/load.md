# Load Action

1. Check $ARGUMENTS (after "load"):
   - If it looks like a filename (single word, no spaces): Look for `plans/features/{name}.md` OR `plans/fixes/{name}.md`
   - If it's multiple words: Use as inline feature description, generate goals
   - If empty: Load the FIRST unchecked item in `plans/build-plan.md`. If there are no unchecked items, say so and stop

2. Update current-feature.md:
   - Update H1 heading to include feature name (e.g., `# Current Feature: Add Navbar`)
   - Write goals as bullet points under ## Goals
   - Break the implementation into small steps under ## Build Steps, one checkbox per step, each ending with an observable acceptance condition:
     `- [ ] <step> — done when: <something you can see/run/click to confirm>`
     Keep steps small enough that each produces a reviewable diff
   - Write any additional notes/context under ## Notes
   - Set Status to "Not Started"

3. Confirm spec loaded and show the feature summary — including the build steps — and stop for the user to review BEFORE any code is written
