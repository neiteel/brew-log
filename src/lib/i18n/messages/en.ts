// English dictionary — the source of truth for the message shape. Every other
// locale must satisfy the `Messages` type derived from this object.
//
// Scope reminder: only fixed UI strings the app itself writes live here (field
// labels, section headings, buttons, hints). User input (notes, bean names,
// roasteries, origins) and stored enum values (methods, countries, processes,
// roast levels) are never translated. Strings with `{token}` are interpolated
// by the caller.

export const en = {
  // Taste section — display + the brew form's scale inputs.
  taste: {
    heading: "Taste",
    rating: "Rating",
    aroma: "Aroma",
    sweetness: "Sweetness",
    acidity: "Acidity",
    bitterness: "Bitterness",
    body: "Body",
    notes: "Notes",
  },
  // Community star ratings.
  community: {
    heading: "Community",
    noRatings: "No ratings yet",
    ratingUnit: "rating",
    ratingUnitPlural: "ratings",
    yourRating: "Your rating",
    rateThis: "Rate this brew",
    clear: "Clear",
    starUnit: "star",
    starUnitPlural: "stars",
  },
  // Bean detail page + labels shared with the brew detail page's Bean section.
  bean: {
    heading: "Bean",
    brewsHeading: "Brews",
    addedPrefix: "Bean — added", // followed by a date
    origin: "Origin",
    region: "Region",
    altitude: "Altitude",
    process: "Process",
    varietals: "Varietals",
    flavor: "Flavor",
    cupping: "Cupping",
    roastDate: "Roast date",
    roastSuffix: "roast", // "{level} roast"
    price: "Price",
    url: "URL",
    moreInfo: "More info",
    editBean: "Edit bean",
    newBrewWithBean: "New brew with this bean",
    noBrewsYet: "No brews with this bean yet.",
    deleteBean: "Delete bean",
    deleteBeanConfirm: "Delete this bean and all of its brews?",
    deleteBeanWarning: "Deleting a bean also deletes all of its brews.",
  },
  // Brew detail page (recipe + header chrome).
  brew: {
    kicker: "Brew", // "Brew — {date}"
    public: "Public",
    private: "Private",
    recipe: "Recipe",
    method: "Method",
    dose: "Dose",
    ratio: "Ratio", // "Ratio 1:2.5"
    yield: "Yield",
    water: "Water",
    temperature: "Temperature",
    extraction: "Extraction",
    time: "Time",
    grinder: "Grinder",
    viewBean: "View bean",
    editBrew: "Edit brew",
    deleteBrew: "Delete brew",
    deleteBrewConfirm: "Delete this brew?",
  },
  // Page headers + per-user limit prose on the new/edit pages.
  pages: {
    newBrew: "New Brew",
    newBean: "New Bean",
    edit: "Edit",
    brewsUsed: "{count} of {max} brews used",
    beansUsed: "{count} of {max} beans used",
    brewLimitBefore: "You've reached the limit of {max} brews — ",
    brewLimitLink: "delete one",
    brewLimitAfter: " to log another.",
    beanLimitBefore: "You've reached the limit of {max} beans — ",
    beanLimitLink: "delete one",
    beanLimitAfter: " to add another.",
    needBeanBefore: "You need a bean first — ",
    needBeanLink: "add one",
    needBeanAfter: ", then log the brew.",
  },
  // Form chrome shared by the bean and brew forms.
  form: {
    // Bean form.
    sectionIdentity: "Identity",
    sectionOrigin: "Origin",
    sectionRoast: "Roast",
    sectionPurchase: "Purchase",
    sectionNotes: "Notes",
    name: "Name",
    roastery: "Roastery",
    roasterLocation: "Roaster location",
    origin: "Origin",
    region: "Region",
    altitude: "Altitude",
    varietals: "Varietals",
    process: "Process",
    roastLevel: "Roast level",
    roastDate: "Roast date",
    cuppingScore: "Cupping score",
    cuppingHint: "0–100",
    price: "Price",
    weight: "Weight",
    weightHint: "grams",
    productUrl: "Product URL",
    flavorNotes: "Flavor notes",
    moreInfo: "More info",
    // Brew form.
    sectionBrew: "Brew",
    bean: "Bean",
    pickBean: "— pick a bean",
    date: "Date",
    method: "Method",
    customMethod: "Custom method",
    sectionRecipe: "Recipe",
    doseG: "Dose, g",
    yieldG: "Yield, g",
    waterG: "Water, g",
    temperatureC: "Temperature, °C",
    temperatureHint: "0–100",
    time: "Time",
    timeHint: "mm:ss, or seconds",
    tdsPct: "TDS, %",
    tdsHint: "typically 8–12",
    extractionYieldPct: "Extraction yield, %",
    extractionHint: "typically 18–22",
    extractionAutoHint: "auto ~{value} if left blank", // when value can be computed
    grinder: "Grinder",
    grindSetting: "Grind setting",
    liveRatio: "Ratio {value}",
    liveRatioEmpty: "Ratio —",
    liveExtraction: " · Extraction ~{value}%",
    notes: "Notes",
    sectionVisibility: "Visibility",
    whoCanSee: "Who can see this brew",
    visibilityHint: "Public brews appear on your page and in explore.",
    // Buttons + validation, shared.
    saving: "Saving…",
    saveChanges: "Save changes",
    saveBean: "Save bean",
    saveBrew: "Save brew",
    cancel: "Cancel",
    fixErrors: "Please fix the highlighted fields.",
  },
} as const

// Widen the literal string values to `string` so other locales can supply their
// own text while still being checked for the exact same keys and structure.
type Widen<T> = {
  [K in keyof T]: T[K] extends string ? string : Widen<T[K]>
}

export type Messages = Widen<typeof en>
