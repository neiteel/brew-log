// English dictionary — the source of truth for the message shape. Every other
// locale must satisfy the `Messages` type derived from this object.
//
// Scope reminder: only fixed UI strings the app itself writes live here (field
// labels, section headings, buttons, hints). User input (notes, bean names,
// roasteries, origins) and stored enum values (methods, countries, processes,
// roast levels) are never translated. Strings with `{token}` are interpolated
// by the caller.

export const en = {
  // Bottom + desktop navigation.
  nav: {
    journal: "Journal",
    explore: "Explore",
    newBrew: "New Brew",
    settings: "Settings",
    signIn: "Sign in",
    signUp: "Sign up",
  },
  // Landing page — only ever seen signed out, so its locale comes from
  // Accept-Language.
  landing: {
    headline: "A journal for beans, recipes and tasting notes.",
    body: "Log every bean and brew, dial in your recipes, and share what’s worth sharing.",
    publicBrews: "Public brews",
    publicBrewsHint: "Latest notes shared by the community.",
    noPublicBrews: "No public brews yet — be the first to share one.",
    exploreAll: "Explore all public brews",
  },
  // Journal + explore: list headings, empty states, filter bar, pagination.
  list: {
    journalTitle: "Journal",
    exploreKicker: "Public brews",
    exploreTitle: "Explore",
    publicJournal: "Public journal",
    beansHeading: "Beans",
    brewsHeading: "Brews",
    noBeans: "No beans yet — add the first one.",
    noBrews: "No brews yet — log the first one.",
    noBrewsMatch: "No brews match these filters.",
    noPublicBrews: "No public brews match these filters yet.",
    noPublicBrewsYet: "No public brews yet.",
    newBean: "New bean",
    newBrew: "New brew",
  },
  filters: {
    bean: "Bean",
    method: "Method",
    origin: "Origin",
    roast: "Roast",
    all: "All",
    apply: "Apply",
    clear: "Clear filters",
  },
  pagination: {
    previous: "Previous",
    next: "Next",
    pageOf: "Page {page} of {total}",
  },
  // Labels for the closed sets of values the app stores in English: the brew
  // method radio and the roast-level radio. The stored value never changes —
  // `isEspresso()` matches on it, filters compare it, seeds write it — so these
  // are display labels only, looked up with `label()`. Brand names stay as they
  // are in every locale. Free-text fields with datalist suggestions (country,
  // process, grinder) are NOT here: their value is whatever the user types.
  enums: {
    methods: {
      V60: "V60",
      "Kalita Wave": "Kalita Wave",
      Chemex: "Chemex",
      AeroPress: "AeroPress",
      "French Press": "French Press",
      "Clever Dripper": "Clever Dripper",
      Origami: "Origami",
      "Moka Pot": "Moka Pot",
      Espresso: "Espresso",
      "Cold Brew": "Cold Brew",
      Other: "Other",
    },
    roastLevels: {
      Light: "Light",
      "Medium-Light": "Medium-Light",
      Medium: "Medium",
      "Medium-Dark": "Medium-Dark",
      Dark: "Dark",
      Unknown: "Unknown",
    },
    visibility: {
      Private: "Private",
      Public: "Public",
    },
  },
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
    grind: "Grind",
    viewBean: "View bean",
    repeatBrew: "Brew this again",
    editBrew: "Edit brew",
    deleteBrew: "Delete brew",
    deleteBrewConfirm: "Delete this brew?",
  },
  // Brew Master — the AI tuning-advice block on the brew detail page.
  brewMaster: {
    heading: "Brew Master",
    notReady:
      "Add an overall rating and score all five taste dimensions to ask the Brew Master for tuning advice on your next cup.",
    intro:
      "Get tailored suggestions for your next brew of this coffee, based on this cup, the roaster’s flavor notes, and your brew history.",
    ask: "Ask the Brew Master",
    regenerate: "Regenerate",
    thinking: "Thinking…",
    takesSeconds: "This can take a few seconds.",
    depleted: "Monthly limit reached — resets next month.",
    remaining: "{remaining} of {limit} left this month",
    failed: "Something went wrong. Please try again.",
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
  // AI features: the bag scanner on the new-bean page and the Brew Master's
  // server-side refusals.
  ai: {
    scanHeading: "Scan a bag photo",
    scanIntro:
      "Upload, drag in, or snap a photo of the coffee bag and AI will pre-fill the fields below. Check everything before saving — the photo isn’t stored.",
    scanButton: "Scan bag photo",
    scanning: "Reading photo…",
    takesSeconds: "This can take a few seconds.",
    scansLeft: "{remaining} of {limit} scans left this month",
    notAnImage: "That's not an image. Upload a photo of the coffee bag.",
    scanFailed: "Something went wrong reading that photo. Please try again.",
    verifyEmailScan: "Please verify your email address to use AI scanning.",
    noPhoto: "Please upload a photo of the coffee bag.",
    imageTooLarge: "That image is too large. Try again.",
    verifyEmailAdvice:
      "Please verify your email address to use the Brew Master.",
    brewNotFound: "Brew not found.",
    notReviewed:
      "Add an overall rating and score all five taste dimensions first.",
    emptyAdvice: "The Brew Master had nothing to add. Try again.",
    unavailable: "The Brew Master is unavailable right now. Please try again.",
  },
  // Server-side validation + whole-form errors. Whole sentences, not composed
  // fragments — word order and measure words differ per language. The six
  // taste scales share two templates because they are identical in shape;
  // `{field}` there is filled from the `taste` section.
  validation: {
    textTooLong: "Keep this under 300 characters.",
    longTextTooLong: "Keep this under 4,000 characters.",
    notesTooLong: "Keep notes under 4,000 characters.",
    scaleNumber: "{field} must be a number.",
    scaleRange: "{field} must be 0–10.",
    // Brew form.
    pickBean: "Pick a bean.",
    methodRequired: "Method is required.",
    methodTooLong: "Method must be 120 characters or fewer.",
    doseNumber: "Dose must be a number.",
    dosePositive: "Dose must be greater than 0 g.",
    waterNumber: "Water must be a number.",
    waterPositive: "Water must be greater than 0 g.",
    temperatureNumber: "Temperature must be a number.",
    temperatureRange: "Temperature must be between 0 and 100 °C.",
    timeFormat: "Time must look like 2:25 (or seconds).",
    yieldNumber: "Yield must be a number.",
    yieldPositive: "Yield must be greater than 0 g.",
    tdsNumber: "TDS must be a number.",
    tdsRange: "TDS must be between 0 and 100%.",
    extractionNumber: "Extraction yield must be a number.",
    extractionRange: "Extraction yield must be between 0 and 100%.",
    brewDateInvalid: "Brew date must be a valid date.",
    beanNotFound: "Bean not found.",
    brewNotFound: "Brew not found.",
    brewLimit:
      "You've reached the limit of {max} brews. Delete one to log another.",
    // Bean form.
    nameRequired: "Name is required.",
    nameTooLong: "Name must be 120 characters or fewer.",
    roasteryRequired: "Roastery is required.",
    roasteryTooLong: "Roastery must be 120 characters or fewer.",
    roastDateInvalid: "Roast date must be a valid date.",
    cuppingNumber: "Cupping score must be a number.",
    cuppingRange: "Cupping score must be between 0 and 100.",
    weightNumber: "Weight must be a number.",
    weightInteger: "Weight must be a whole number of grams.",
    weightPositive: "Weight must be greater than 0 grams.",
    urlScheme: "Product URL must start with http:// or https://.",
    urlTooLong: "Product URL is too long.",
    beanLimit:
      "You've reached the limit of {max} beans. Delete one to add another.",
  },
  // Browser tab titles. The root layout's "%s — Brew.log" template wraps these.
  titles: {
    journal: "Journal",
    explore: "Explore",
    settings: "Settings",
    newBrew: "New Brew",
    newBean: "New Bean",
    editBrew: "Edit Brew",
    editBean: "Edit Bean",
    bean: "Bean",
    brew: "Brew",
    notFound: "Not found",
    signIn: "Sign in",
    signUp: "Sign up",
    forgotPassword: "Forgot password",
    resetPassword: "Reset password",
  },
  // Sign-in / sign-up / password-reset pages and their forms. Only ever seen
  // signed out, so the locale comes from Accept-Language.
  auth: {
    signIn: "Sign in",
    signingIn: "Signing in…",
    signUp: "Sign up",
    createAccount: "Create account",
    creatingAccount: "Creating account…",
    name: "Name",
    username: "Username",
    usernameHint: "for your public page: /u/username",
    email: "Email",
    password: "Password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    forgotPassword: "Forgot password?",
    noAccount: "No account yet?",
    haveAccount: "Already have an account?",
    signInFailed: "Sign in failed.",
    signUpFailed: "Sign up failed.",
    socialDivider: "or",
    continueWithGoogle: "Continue with Google",
    redirecting: "Redirecting…",
    resetPassword: "Reset password",
    googleFailed: "Couldn’t start Google sign-in.",
    accountNotLinked:
      "This email already has a password. Sign in with it below. Once you verify your email, you can also use Google.",
    socialGenericError: "Something went wrong signing in. Please try again.",
    forgotTitle: "Forgot password",
    forgotIntro:
      "Enter your email and we’ll send you a link to reset your password.",
    sendResetLink: "Send reset link",
    sending: "Sending…",
    resetLinkSent:
      "If an account exists for that email, we’ve sent a link to reset your password. Check your inbox and spam folder.",
    rememberedIt: "Remembered it?",
    resetTitle: "Reset password",
    resetIntro: "Choose a new password for your account.",
    resetting: "Resetting…",
    resetFailed: "Couldn’t reset your password.",
    passwordMismatch: "Passwords don’t match.",
    linkExpiredTitle: "Link expired",
    linkExpiredBody:
      "This password reset link is invalid or has expired. Request a new one to try again.",
    requestNewLink: "Request a new link",
  },
  // Settings page + the small client forms it renders.
  settings: {
    kicker: "Account",
    title: "Settings",
    profile: "Profile",
    language: "Language",
    password: "Password",
    data: "Data",
    session: "Session",
    name: "Name",
    email: "Email",
    verified: "Verified",
    notVerified: "Not verified",
    publicPage: "Public page",
    publicPageHint: "Where your public brews appear",
    username: "Username",
    saveUsername: "Save username",
    saving: "Saving…",
    updateUsernameFailed: "Could not update username.",
    updateLanguageFailed: "Could not update language.",
    notVerifiedPrompt:
      "Your email isn’t verified. Verify it to also sign in with Google using this address.",
    resend: "Resend verification email",
    sending: "Sending…",
    resendSent: "Verification email sent. Check your inbox and spam folder.",
    resendFailed: "Couldn’t send verification email.",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    changePassword: "Change password",
    updating: "Updating…",
    passwordMismatch: "New passwords don’t match.",
    changePasswordFailed: "Could not change password.",
    passwordUpdated: "Password updated. Other devices have been signed out.",
    setPasswordPrompt:
      "You signed in with Google. Set a password to also sign in with your email address.",
    setPassword: "Set password",
    setPasswordMismatch: "Passwords don’t match.",
    passwordSet: "Password set.",
    exportData: "Export data (JSON)",
    signOut: "Sign out",
  },
  // 404 page. (The uncaught-error boundary carries its own copy of five
  // strings — see the comment in `app/error.tsx`: it wraps every route, so
  // importing the dictionaries there would ship both of them app-wide.)
  notFound: {
    title: "Page not found",
    body: "The link may be wrong, or the brew or bean it pointed to was deleted or made private.",
    journal: "Back to your journal",
    explore: "Explore public brews",
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
    // Example values. Numbers, URLs and product names ("18", "https://…",
    // "Comandante") read the same in every locale and are not here. Neither are
    // the country and process examples: those fields feed the explore filters,
    // so a localized example would invite localized values and split one facet
    // into two.
    egName: "Ibis",
    egRoastery: "Scarlett Coffee Roastery",
    egRegion: "Sul de Minas",
    egAltitude: "1,150–1,250 m",
    egVarietals: "Red Catuaí, Yellow Catuaí",
    egPrice: "£8.50 / 225 g",
    egFlavorNotes: "Almond, Raisins, Strawberries",
    egMoreInfo: "Story, lot number, anything else.",
    egGrindSetting: "26 clicks",
    egBrewNotes: "How did it taste? What would you change?",
  },
} as const

// Widen the literal string values to `string` so other locales can supply their
// own text while still being checked for the exact same keys and structure.
type Widen<T> = {
  [K in keyof T]: T[K] extends string ? string : Widen<T[K]>
}

export type Messages = Widen<typeof en>
