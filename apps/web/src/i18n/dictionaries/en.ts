export const enDictionary = {
  localeLabel: "English",
  shared: {
    brand: "VibeBasket",
    navigation: {
      who: "Who it's for",
      how: "How it works",
      catalog: "Catalog",
      faq: "FAQ",
      documentation: "Documentation",
      installFlow: "Install flow",
      buildBasket: "Build your basket",
      login: "Login",
      home: "Home",
      back: "Back",
      backToCatalog: "Back to catalog",
      backToBuilder: "Back to builder",
      openDocs: "Open docs",
      returnHome: "Return home",
      selfHostGuide: "Self-host guide",
      startBuildingFree: "Start building free",
      viewCatalog: "View catalog",
    },
    auth: {
      signIn: "Sign in",
      signOut: "Sign out",
      myStacks: "My Stacks",
      stacks: "Stacks",
      admin: "Admin",
      signedIn: "Signed in",
      continueWith: "Continue with",
      accountSync: "Account sync",
      signInToSaveStacks: "Sign in to save your stacks",
      loginNotConfigured: "Login is not configured yet.",
      loginNotConfiguredBody:
        "No social auth provider is enabled in this environment right now. Add provider credentials and an AUTH_SECRET to turn sign-in on.",
      profileSync: "Profile sync",
      profileSyncBody: "Saved stacks stay attached to your account.",
      providerChoice: "Provider choice",
      providerChoiceBody: "Only the providers enabled in this environment appear.",
      safeReturn: "Safe return",
      safeReturnBody: "After sign-in, you land back on the flow you started from.",
      savedBasketsLead:
        "Keep your favorite baskets tied to your profile so you can reopen them, share them, and reuse them across sessions.",
      authenticationRequired: "Authentication required",
      signInToAccessSavedStacks: "Sign in to access saved stacks",
      signInToAccessSavedStacksBody:
        "Saved stacks live on your profile, so this area is only available after authentication.",
      savedStacks: "Saved stacks",
      yourSavedStacks: "Your saved stacks",
      yourSavedStacksBody:
        "Reopen baskets you use often, rename them as your workflow evolves, or remove stale setups when they are no longer useful.",
    },
    status: {
      nextStep: "Next step",
      nextStepBody:
        "Head back to a known route, continue browsing the catalog, or reopen the docs.",
      notFoundEyebrow: "404 · Missing route",
      notFoundTitle: "Page not found",
      notFoundSummary:
        "That route is not available anymore, never existed, or was typed with the wrong path. Head back to the catalog or reopen the docs.",
      forbiddenEyebrow: "403 · Access restricted",
      forbiddenTitle: "You do not have access to this page",
      forbiddenSummary:
        "This area is reserved for an authorized account in the current environment. Return to the main catalog or sign in with an approved administrator profile.",
      openLogin: "Open login",
    },
    localeSwitcher: {
      label: "Language",
    },
  },
  home: {
    metadata: {
      title: "VibeBasket — AI Setup Bundles for MCPs, Skills, and Rules",
      description:
        "Bundle trusted MCP servers, skills, and rules into one shareable install. Pick your stack, generate a link, and apply it across every AI IDE and CLI.",
      ogDescription:
        "Share one install flow for your AI dev stack. Trusted MCPs, skills, and rules for Cursor, Windsurf, Claude Code, and more.",
      twitterDescription:
        "Share one install flow for trusted MCPs, skills, and rules across every AI coding tool.",
    },
    hero: {
      badge: "Open source · 24 IDE targets",
      titleMobile: "Bundle your AI dev setup. Share it with one link.",
      titleDesktop: ["Bundle your AI", "dev setup.", "Share it with", "one link."],
      description:
        "Curate trusted MCP servers, reusable skills, and project rules. Generate one install command that travels cleanly across Cursor, Windsurf, VS Code, and the rest of your AI coding stack.",
      github: "GitHub",
      npm: "npm",
      livePreview: "Live preview",
      previewPrimaryLabel: "repository context",
      previewSecondaryLabel: "coding rules",
      copied: "copied",
      terminalLines: [
        "> Fetching trusted basket configuration...",
        "> Writing MCP config for your selected targets...",
        "> Context ready in Cursor, Windsurf, and VS Code.",
      ],
      trustTitle: "Trusted discovery",
      trustBody: "Official registries and curated records, deduped into one catalog.",
      localSecretsTitle: "Local secrets",
      localSecretsBody: "Sensitive values stay on your machine during apply.",
      safeRerunsTitle: "Safe re-runs",
      safeRerunsBody: "Idempotent writes with backups so setup changes stay reversible.",
    },
    who: {
      eyebrow: "Who is this for",
      title: "Built for teams that move fast.",
      description:
        "Whether you work solo or run a team, VibeBasket eliminates the friction of setting up AI coding tools one machine at a time.",
      cards: [
        {
          tag: "Solo Developer",
          headline: "One command, every editor.",
          body: "Stop copy-pasting MCP configs across Cursor, Windsurf, and VS Code. Build a bundle once and apply it everywhere with a single npx command.",
        },
        {
          tag: "Startup Team",
          headline: "Onboard in minutes, not hours.",
          body: "Share a bundle URL with new hires. They run one command and get the exact same MCPs, skills, and rules as the rest of the team — no manual setup.",
        },
        {
          tag: "Platform Maintainer",
          headline: "Curate trusted defaults.",
          body: "Publish verified MCP servers and project rules your users can install with zero configuration. Control what goes into every environment without shipping config files.",
        },
      ],
    },
    how: {
      eyebrow: "How it works",
      title: "Three steps from zero to configured.",
      description:
        "No config files to copy. No IDE settings to hunt down. Just browse, bundle, and apply.",
      steps: [
        {
          step: "01",
          title: "Browse trusted components",
          body: "Catalog entries are pulled from curated data and trusted upstream sources, then normalized and deduplicated.",
        },
        {
          step: "02",
          title: "Assemble your basket",
          body: "Select MCPs, skills, and rules directly from the builder. The UI keeps the basket state visible and reversible.",
        },
        {
          step: "03",
          title: "Apply with one command",
          body: "Generate a single install command and apply the same setup across multiple editors without manual reconfiguration.",
        },
      ],
    },
    command: {
      title: ["Stop reconfiguring.", "Start coding."],
      terminalLine: "$ npx vibebasket apply <bundle-url>",
      kicker: "Open source. Low ceremony. Built for teams that move fast.",
    },
    faq: {
      eyebrow: "FAQ",
      title: "The questions that usually come up first.",
      description:
        "Short answers for the trust, install, and self-hosting details people usually want before they standardize a workflow around VibeBasket.",
      entries: [
        {
          question: "Does VibeBasket ever receive my runtime API keys?",
          answer:
            "No. Bundle manifests do not carry end-user runtime secrets. When a selected MCP needs credentials, the CLI resolves that value locally during apply and writes it into the target tool's own config surface on your machine.",
        },
        {
          question: "What happens if my IDE already has MCPs, skills, or rules configured?",
          answer:
            "VibeBasket merges into the target's supported config surface instead of pretending every file is blank. Existing blocks stay in place, VibeBasket-managed blocks remain idempotent, and unchanged MCP state is skipped so repeated applies do not keep rewriting the same target.",
        },
        {
          question: "What do Verified, Official, and Community mean?",
          answer:
            "Verified means the item was curated by VibeBasket. Official means the upstream source exposed an explicit owner- or vendor-certified signal. Community is everything else that still passes the catalog normalization and deduplication pipeline.",
        },
        {
          question: "Can I self-host VibeBasket for my team?",
          answer:
            "Yes. The web app, CLI, catalog sync, auth, admin tools, and backup flows all live in this repo. The default self-hosting shape is one VPS, one app instance, and one SQLite database with persistent storage and external backups.",
        },
        {
          question: "Is re-running npx vibebasket apply safe?",
          answer:
            "That is the default expectation. The CLI is backup-aware, skips no-op MCP writes, and keeps target-specific install behavior idempotent so the same basket can be re-applied without turning every run into a destructive rewrite.",
        },
        {
          question: "Can I use a bundle again later after I create it?",
          answer:
            "Yes. If you sign in, saved stacks and your account-level basket history let you come back to the same setup later. Even outside that flow, a generated bundle URL can still be re-used or shared as long as that bundle remains available on the hosted or self-hosted instance.",
        },
      ],
    },
    footer: {
      description:
        "AI-engineered setup infrastructure for teams that want reproducible context across modern coding tools.",
      madeWith: "Made with",
      by: "by",
      for: "for",
      vibeCoding: "Vibe Coding",
      vibeCoders: "Vibe Coders",
    },
  },
  catalogUi: {
    builderEyebrow: "The Builder",
    builderTitle: "Build your stack without reconfiguring everything by hand.",
    builderDescription:
      "Browse trusted components, assemble your basket, and generate a single install command for the editors your team actually uses.",
    chips: {
      trustedSources: "Trusted sources",
      trustAwareDiscovery: "Trust-aware discovery",
      itemsPerPage: "{count} items per page",
    },
    tabs: {
      mcps: {
        label: "MCP Servers",
        eyebrow: "Trusted runtime connectors",
        empty: "No MCP servers match this search yet.",
      },
      skills: {
        label: "Skills",
        eyebrow: "Reusable agent capabilities",
        empty: "No skills match this search yet.",
      },
      rules: {
        label: "Rules",
        eyebrow: "Portable working conventions",
        empty: "No rules match this search yet.",
      },
    },
    searchPlaceholder: "Search {label}...",
    filters: {
      toggle: "Filters",
      clear: "Clear",
      trust: "Trust",
      sort: "Sort",
      trustOptions: {
        all: "All trust",
        verified: "Verified",
        official: "Official",
        community: "Community",
      },
      sortOptions: {
        recommended: "Recommended",
        freshest: "Freshest",
        name: "A-Z",
      },
    },
    summary: {
      showing: "Showing {start}-{end} of {total}",
      page: "Page {page}",
      pageOf: "Page {page} / {totalPages}",
    },
    states: {
      loading: "Loading catalog",
      retry: "Retry request",
      retryFailed: "Retry failed",
      emptyHint: "Try a broader search term or switch to another catalog category.",
      performanceHint:
        "Large catalogs stay fast by loading only the current page and active category.",
    },
    pagination: {
      previous: "Previous page",
      next: "Next page",
    },
    itemCard: {
      selected: "Selected",
      details: "Details",
      fallbackDescription: "Trusted catalog component ready to bundle into your AI dev setup.",
    },
    detail: {
      close: "Close item details",
      installCommand: "Install Command",
      source: "Source",
      ruleContent: "Rule Content",
      env: "env",
      url: "url",
      requiresSecrets:
        "Requires secrets: {secrets}. Prompts locally by CLI. Never sent to servers.",
      synced: "Synced {date}",
    },
    trust: {
      tiers: {
        verified: "Verified",
        official: "Official",
        community: "Community",
      },
      details: {
        verified: "Hand-curated by the VibeBasket team. Takes precedence over upstream sources.",
        official:
          "Explicitly marked official by the upstream catalog owner or registry, without local heuristics.",
        community: "Discovered from community repositories and public skill directories.",
      },
      sources: {
        "verified-catalog": "Curated by VibeBasket",
        "official-mcp-registry": "MCP Registry",
        "skills-sh-official": "skills.sh Curated",
        "skills-sh-community": "skills.sh Community",
        community: "Community",
      },
    },
  },
  basketUi: {
    eyebrow: "Your Basket",
    title: "Ready to bundle",
    itemsOne: "{count} item",
    itemsOther: "{count} items",
    closeAria: "Close basket",
    empty: "Select MCPs, skills, and rules from the builder to assemble your setup.",
    typeLabels: {
      mcp: "MCP",
      skill: "Skill",
      rule: "Rule",
      mcps: "MCPs",
      skills: "Skills",
      rules: "Rules",
    },
    removeAria: "Remove {name}",
    collapseList: "Collapse list",
    showMore: "Show {count} more",
    targetIdes: "Target IDEs",
    clear: "Clear",
    worksToday: "Works today",
    targetsCount: "{count} targets",
    ecosystemWatchlist: "Ecosystem watchlist",
    soonCount: "{count} soon",
    unsupportedTargets:
      "{targets}: doesn't support {capabilities}. These will be skipped during apply.",
    scopeConflict:
      "Selected targets do not share one install scope. Combine user-scope targets together, or switch to a project-scope-only target set.",
    signInToSave: "Sign in to save reusable stacks to your profile.",
    bundlePreview: "Bundle Preview",
    previewEmpty: "Select items to preview your bundle.",
    previewItems: "{count} items: {breakdown}",
    previewItemsOne: "{count} item: {breakdown}",
    previewTargets: "{count} targets",
    previewTargetsOne: "{count} target",
    previewScope: "scope: {scope}",
    previewAutoSelected: " (auto-selected)",
    previewIncompatible: "{targets}: skills/rules skipped",
    previewBlocked: "no shared scope across selected targets; bundle generation is blocked",
    installCommand: "Install Command",
    fetching: "Fetching basket configuration...",
    resolving: "Resolving trusted MCP components...",
    ready: "Ready to apply across your selected IDEs.",
    generatedCommandWillAppear: "Your generated command will appear here{scopeSuffix}",
    generating: "Generating",
    copyFreshCommand: "Copy Fresh Command",
    generateInstallCommand: "Generate Install Command",
    pickAtLeastOne: "Pick at least one item and one target IDE.",
    sharedScopeRequired:
      "Those targets do not share one install scope yet. Pick only user-scope or only project-scope targets together.",
    failedToBuild: "Failed to build bundle",
    copiedToClipboard: "Install command copied to clipboard.",
    failedToGenerate: "Failed to generate bundle command.",
    plannedTarget: "This target is planned, but not supported by the apply engine yet.",
    basketCleared: "Basket cleared.",
    open: "Open",
  },
  docs: {
    metadataHub: {
      title: "VibeBasket Documentation — AI Dev Setup Infrastructure",
      description:
        "Guides for the VibeBasket catalog, CLI, IDE adapters, block delimiters, security model, and self-hosting deployment.",
    },
    metadataGettingStarted: {
      title: "Getting Started — VibeBasket Docs",
      description:
        "Install your first AI context bundle in under 2 minutes. Browse the catalog, pick MCPs and skills, generate a bundle URL, and apply it with the CLI.",
    },
    metadataCli: {
      title: "CLI Reference — VibeBasket Docs",
      description:
        "Complete reference for vibebasket apply, list, search, doctor, init, and rollback commands. Flags, scopes, dry-run, verification, and environment variables.",
    },
    metadataAdapters: {
      title: "IDE Adapters — 24 Targets — VibeBasket Docs",
      description:
        "Multi-IDE adapter reference covering Cursor, Windsurf, VS Code, Claude Code, GitHub Copilot, and 19 more. Config paths, MCP/skills/rules support per target.",
    },
    metadataDelimiters: {
      title: "Block Delimiters — VibeBasket Docs",
      description:
        "How VibeBasket uses comment-block delimiters for idempotent file merging across shell scripts, markdown, and YAML config files.",
    },
    metadataSecurity: {
      title: "Security — Zero-Trust Model — VibeBasket Docs",
      description:
        "Zero-secret policy, rate limiting, security headers, CSP enforcement, and local credential prompting for the VibeBasket platform.",
    },
    metadataSelfHosting: {
      title: "Self-Hosting Guide — VibeBasket Docs",
      description:
        "Deploy VibeBasket on your own infrastructure with Docker, manual Node.js setup, or Kubernetes via Helm. Environment variables, backup storage, and upgrade procedures.",
    },
    guideCards: {
      quickStart: {
        title: "Quick Start Guide",
        description:
          "Get your first AI context bundle running in under 2 minutes. Browse the catalog, pick MCP servers and skills, generate a bundle URL, and apply it locally with the CLI.",
        linkText: "Read quickstart",
      },
      cli: {
        title: "CLI Reference",
        description:
          "Complete reference for the vibebasket apply command: bundle URLs, the --force flag, --scope overrides, --dry-run preview mode, and verification controls.",
        linkText: "View CLI reference",
      },
      adapters: {
        title: "IDE Adapters",
        description:
          "Every supported IDE target, its config paths, MCP/skills/rules capability matrix, and adapter implementation notes.",
        linkText: "Browse adapters",
      },
      delimiters: {
        title: "Block Delimiters",
        description:
          "How VibeBasket uses comment-block delimiters for idempotent file merging across shell scripts, markdown, and YAML.",
        linkText: "Learn delimiters",
      },
      security: {
        title: "Secret Security",
        description:
          "Zero-secret cloud policy, local credential prompting, rate limiting architecture, and hardened HTTP security headers.",
        linkText: "Review security",
      },
      selfHosting: {
        title: "Self-Hosting Guide",
        description:
          "Run VibeBasket on your own infrastructure with Docker, plain Node.js, or Kubernetes. Backup storage, OAuth, and upgrade procedures.",
        linkText: "Self-host now",
      },
    },
    shell: {
      noResults: "No results for",
      tryDifferentKeyword: "Try a different keyword.",
      searchPlaceholder: "Search docs…",
      searchAriaLabel: "Search documentation",
      mobileSectionLabel: "Documentation section",
      tabs: {
        hub: "Docs",
        gettingStarted: "Getting Started",
        cli: "CLI",
        adapters: "Adapters",
        delimiters: "Delimiters",
        security: "Security",
        selfHosting: "Self-hosting",
      },
      docsHome: "Docs",
      architecturalHub: "Architectural Hub",
      technicalSpecs: "VibeBasket Technical Specs",
      documentationHub: "Documentation Hub",
      hubDescription:
        "Everything you need to configure, run, and maintain VibeBasket honestly. Start with Getting Started for the shortest path, Self Hosting for deployment expectations, and Security when you are preparing a public launch.",
      githubRepository: "GitHub Repository",
      npmPackage: "npm Package",
    },
  },
  admin: {
    badge: "Admin",
    backToCatalog: "Back to Catalog",
    title: "System Operations & Metrics",
    description: "Real-time analytics, user saved stack leaderboards, and central registry health.",
    navAriaLabel: "Admin sections",
    sections: {
      overview: "Overview",
      readiness: "Readiness",
      catalogOps: "Catalog Ops",
      catalogData: "Catalog Data",
      collectors: "Collectors",
      syncRuns: "Sync Runs",
      backups: "Backups",
      storage: "Storage",
      schedules: "Schedules",
      systemHealth: "System Health",
      users: "Users",
    },
  },
} as const;

type WidenLiteral<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly WidenLiteral<U>[]
    : T extends object
      ? { [K in keyof T]: WidenLiteral<T[K]> }
      : T;

export type AppDictionary = WidenLiteral<typeof enDictionary>;
