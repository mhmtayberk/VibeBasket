import type { AppDictionary } from "./en";

export const hiDictionary: AppDictionary = {
  localeLabel: "हिन्दी",
  shared: {
    brand: "VibeBasket",
    navigation: {
      who: "किसके लिए",
      how: "कैसे काम करता है",
      catalog: "कैटलॉग",
      faq: "अक्सर पूछे जाने वाले प्रश्न",
      documentation: "दस्तावेज़",
      installFlow: "इंस्टॉल फ़्लो",
      buildBasket: "अपना बास्केट बनाएं",
      login: "लॉगिन",
      home: "होम",
      back: "वापस",
      backToCatalog: "कैटलॉग पर वापस जाएं",
      backToBuilder: "बिल्डर पर वापस जाएं",
      openDocs: "दस्तावेज़ खोलें",
      returnHome: "होम पर लौटें",
      selfHostGuide: "स्व-होस्ट गाइड",
      startBuildingFree: "मुफ़्त में बनाना शुरू करें",
      viewCatalog: "कैटलॉग देखें",
    },
    auth: {
      signIn: "साइन इन",
      signOut: "साइन आउट",
      myStacks: "मेरे Stack",
      stacks: "Stack",
      admin: "एडमिन",
      signedIn: "साइन इन हो चुका है",
      continueWith: "इसके साथ जारी रखें",
      accountSync: "अकाउंट सिंक",
      signInToSaveStacks: "अपने Stack सहेजने के लिए साइन इन करें",
      loginNotConfigured: "लॉगिन अभी कॉन्फ़िगर नहीं है।",
      loginNotConfiguredBody:
        "इस environment में अभी कोई social auth provider सक्षम नहीं है। साइन-इन चालू करने के लिए provider credentials और AUTH_SECRET जोड़ें।",
      profileSync: "प्रोफ़ाइल सिंक",
      profileSyncBody: "सहेजे गए Stack आपके अकाउंट से जुड़े रहते हैं।",
      providerChoice: "प्रोवाइडर चयन",
      providerChoiceBody: "केवल वही प्रोवाइडर दिखते हैं जो इस environment में सक्षम हैं।",
      safeReturn: "सुरक्षित वापसी",
      safeReturnBody: "साइन-इन के बाद आप उसी फ़्लो में वापस जाते हैं जहाँ से शुरू किया था।",
      savedBasketsLead:
        "अपनी पसंदीदा baskets को अपनी प्रोफ़ाइल से जोड़कर रखें ताकि आप उन्हें दोबारा खोल सकें, साझा कर सकें और sessions के बीच फिर से उपयोग कर सकें।",
      authenticationRequired: "प्रमाणीकरण आवश्यक है",
      signInToAccessSavedStacks: "सहेजे गए Stack देखने के लिए साइन इन करें",
      signInToAccessSavedStacksBody:
        "सहेजे गए Stack आपकी प्रोफ़ाइल में रहते हैं, इसलिए यह क्षेत्र केवल प्रमाणीकरण के बाद उपलब्ध है।",
      savedStacks: "सहेजे गए Stack",
      yourSavedStacks: "आपके सहेजे गए Stack",
      yourSavedStacksBody:
        "जिन baskets का आप अक्सर उपयोग करते हैं उन्हें फिर से खोलें, workflow बदलने पर उनका नाम बदलें, या पुरानी setups हटा दें।",
    },
    status: {
      nextStep: "अगला कदम",
      nextStepBody: "किसी ज्ञात route पर लौटें, कैटलॉग ब्राउज़ करते रहें, या दस्तावेज़ फिर से खोलें।",
      notFoundEyebrow: "404 · Route नहीं मिला",
      notFoundTitle: "पेज नहीं मिला",
      notFoundSummary:
        "यह route अब उपलब्ध नहीं है, कभी था ही नहीं, या गलत path के साथ टाइप किया गया था। कैटलॉग पर लौटें या दस्तावेज़ फिर से खोलें।",
      forbiddenEyebrow: "403 · पहुँच प्रतिबंधित",
      forbiddenTitle: "आपको इस पेज की पहुँच नहीं है",
      forbiddenSummary:
        "यह क्षेत्र केवल वर्तमान environment में अधिकृत अकाउंट के लिए आरक्षित है। मुख्य कैटलॉग पर लौटें या स्वीकृत administrator profile से साइन इन करें।",
      openLogin: "लॉगिन खोलें",
    },
    localeSwitcher: {
      label: "भाषा",
    },
  },
  home: {
    metadata: {
      title: "VibeBasket — MCPs, Skills और Rules के लिए AI सेटअप बंडल",
      description:
        "विश्वसनीय MCP servers, skills और rules को एक साझा किए जा सकने वाले install flow में bundle करें। अपना stack चुनें, link बनाएँ और हर AI IDE व CLI में apply करें।",
      ogDescription:
        "अपने AI dev stack के लिए एक install flow साझा करें। Cursor, Windsurf, Claude Code और अन्य के लिए विश्वसनीय MCPs, skills और rules।",
      twitterDescription:
        "हर AI coding tool में विश्वसनीय MCPs, skills और rules के लिए एक ही install flow साझा करें।",
    },
    hero: {
      badge: "ओपन सोर्स · 24 IDE targets",
      titleMobile: "अपने AI dev setup को bundle करें। एक लिंक से साझा करें।",
      titleDesktop: ["अपने AI dev", "setup को bundle करें।", "एक लिंक से", "साझा करें।"],
      description:
        "विश्वसनीय MCP servers, reusable skills और project rules को curate करें। एक install command बनाएँ जो Cursor, Windsurf, VS Code और आपके बाकी AI coding stack में साफ़-सुथरे ढंग से काम करे।",
      github: "GitHub",
      npm: "npm",
      livePreview: "लाइव प्रीव्यू",
      previewPrimaryLabel: "repository context",
      previewSecondaryLabel: "coding rules",
      copied: "कॉपी हो गया",
      terminalLines: [
        "> विश्वसनीय basket configuration प्राप्त की जा रही है...",
        "> चुने गए targets के लिए MCP config लिखी जा रही है...",
        "> Cursor, Windsurf और VS Code में context तैयार है।",
      ],
      trustTitle: "विश्वसनीय खोज",
      trustBody: "Official registries और curated records को dedupe करके एक कैटलॉग में जोड़ा जाता है।",
      localSecretsTitle: "लोकल secrets",
      localSecretsBody: "संवेदनशील values apply के दौरान आपकी मशीन पर ही रहती हैं।",
      safeRerunsTitle: "सुरक्षित दोबारा चलाना",
      safeRerunsBody: "Backups के साथ idempotent writes, ताकि setup changes reversible रहें।",
    },
    who: {
      eyebrow: "किसके लिए",
      title: "तेज़ी से काम करने वाली teams के लिए बनाया गया।",
      description:
        "चाहे आप अकेले काम करते हों या टीम चलाते हों, VibeBasket AI coding tools को machine-by-machine सेट करने की friction हटाता है।",
      cards: [
        {
          tag: "Solo developer",
          headline: "एक command, हर editor।",
          body: "Cursor, Windsurf और VS Code के बीच MCP configs को copy-paste करना बंद करें। एक बार bundle बनाएँ और एक npx command से हर जगह apply करें।",
        },
        {
          tag: "Startup team",
          headline: "घंटों नहीं, मिनटों में onboarding।",
          body: "नई hires के साथ bundle URL साझा करें। वे एक command चलाते हैं और टीम के बाकी लोगों जैसे ही MCPs, skills और rules पा लेते हैं — बिना manual setup के।",
        },
        {
          tag: "Platform maintainer",
          headline: "विश्वसनीय defaults curate करें।",
          body: "Verified MCP servers और project rules प्रकाशित करें जिन्हें आपके users बिना configuration के install कर सकें। Config files भेजे बिना हर environment की सामग्री नियंत्रित करें।",
        },
      ],
    },
    how: {
      eyebrow: "कैसे काम करता है",
      title: "शून्य से configured होने तक तीन कदम।",
      description:
        "कॉपी करने के लिए config files नहीं। IDE settings खोजने की ज़रूरत नहीं। बस browse करें, bundle करें और apply करें।",
      steps: [
        {
          step: "01",
          title: "विश्वसनीय components ब्राउज़ करें",
          body: "Catalog entries curated data और trusted upstream sources से ली जाती हैं, फिर normalize और dedupe की जाती हैं।",
        },
        {
          step: "02",
          title: "अपना basket तैयार करें",
          body: "Builder से सीधे MCPs, skills और rules चुनें। UI basket state को visible और reversible रखता है।",
        },
        {
          step: "03",
          title: "एक command से apply करें",
          body: "एक install command बनाएँ और बिना manual reconfiguration के वही setup कई editors में apply करें।",
        },
      ],
    },
    command: {
      title: ["बार-बार configuration बंद करें।", "Coding शुरू करें।"],
      terminalLine: "$ npx vibebasket apply <bundle-url>",
      kicker: "ओपन सोर्स। कम रस्में। तेज़ teams के लिए।",
    },
    faq: {
      eyebrow: "अक्सर पूछे जाने वाले प्रश्न",
      title: "वे सवाल जो सबसे पहले आते हैं।",
      description:
        "VibeBasket के आसपास workflow standardize करने से पहले लोग जिन trust, install और self-hosting details के बारे में जानना चाहते हैं, उनके छोटे जवाब।",
      entries: [
        {
          question: "क्या VibeBasket कभी मेरी runtime API keys प्राप्त करता है?",
          answer:
            "नहीं। Bundle manifests end-user runtime secrets नहीं ले जाते। जब किसी चुने गए MCP को credentials चाहिए होते हैं, CLI apply के दौरान उन्हें locally resolve करता है और आपकी मशीन पर target tool के अपने config surface में लिखता है।",
        },
        {
          question: "अगर मेरे IDE में पहले से MCPs, skills या rules configured हैं तो क्या होगा?",
          answer:
            "VibeBasket यह मानने के बजाय कि हर file खाली है, target के supported config surface में merge करता है। Existing blocks बने रहते हैं, VibeBasket-managed blocks idempotent रहते हैं, और unchanged MCP state को skip किया जाता है ताकि repeat apply बार-बार वही चीज़ न लिखे।",
        },
        {
          question: "Verified, Official और Community का क्या मतलब है?",
          answer:
            "Verified का अर्थ है item को VibeBasket ने curate किया है। Official का अर्थ है upstream source ने स्पष्ट owner- या vendor-certified signal दिया है। Community बाकी सब कुछ है जो catalog normalization और deduplication pipeline से गुजरता है।",
        },
        {
          question: "क्या मैं अपनी टीम के लिए VibeBasket self-host कर सकता हूँ?",
          answer:
            "हाँ। Web app, CLI, catalog sync, auth, admin tools और backup flows सभी इसी repo में हैं। Default self-hosting shape एक VPS, एक app instance और persistent storage व external backups के साथ एक SQLite database है।",
        },
        {
          question: "क्या npx vibebasket apply को दोबारा चलाना सुरक्षित है?",
          answer:
            "हाँ, यही default expectation है। CLI backup-aware है, no-op MCP writes को skip करता है, और target-specific install behavior को idempotent रखता है, ताकि वही basket दोबारा apply करने पर destructive rewrite न हो।",
        },
        {
          question: "क्या bundle बनाने के बाद मैं उसे बाद में फिर इस्तेमाल कर सकता हूँ?",
          answer:
            "हाँ। यदि आप साइन इन करते हैं, तो saved stacks और account-level basket history आपको बाद में उसी setup पर वापस आने देते हैं। इसके बाहर भी, generated bundle URL को तब तक reuse या share किया जा सकता है जब तक bundle hosted या self-hosted instance में उपलब्ध है।",
        },
      ],
    },
    footer: {
      description:
        "ऐसी teams के लिए AI-powered setup infrastructure जो modern coding tools में reproducible context चाहती हैं।",
      madeWith: "बनाया गया",
      by: "द्वारा",
      for: "के लिए",
      vibeCoding: "Vibe Coding",
      vibeCoders: "Vibe Coders",
    },
  },
  catalogUi: {
    builderEyebrow: "बिल्डर",
    builderTitle: "सब कुछ हाथ से फिर से कॉन्फ़िगर किए बिना अपना stack बनाइए।",
    builderDescription:
      "विश्वसनीय components ब्राउज़ करें, अपना basket तैयार करें, और उन editors के लिए एक install command बनाइए जिन्हें आपकी team वास्तव में इस्तेमाल करती है।",
    chips: {
      trustedSources: "विश्वसनीय स्रोत",
      trustAwareDiscovery: "विश्वास-सचेत खोज",
      itemsPerPage: "प्रति पेज {count} आइटम",
    },
    tabs: {
      mcps: {
        label: "MCP Servers",
        eyebrow: "विश्वसनीय runtime connectors",
        empty: "इस search से मेल खाने वाले MCP servers अभी नहीं मिले।",
      },
      skills: {
        label: "Skills",
        eyebrow: "Reusable agent capabilities",
        empty: "इस search से मेल खाने वाले skills अभी नहीं मिले।",
      },
      rules: {
        label: "Rules",
        eyebrow: "Portable working conventions",
        empty: "इस search से मेल खाने वाले rules अभी नहीं मिले।",
      },
    },
    searchPlaceholder: "{label} खोजें...",
    filters: {
      toggle: "फ़िल्टर",
      clear: "साफ़ करें",
      trust: "विश्वास",
      sort: "क्रम",
      trustOptions: {
        all: "सभी trust",
        verified: "Verified",
        official: "Official",
        community: "Community",
      },
      sortOptions: {
        recommended: "Recommended",
        freshest: "नवीनतम",
        name: "A-Z",
      },
    },
    summary: {
      showing: "{total} में से {start}-{end} दिखाए जा रहे हैं",
      page: "पेज {page}",
      pageOf: "पेज {page} / {totalPages}",
    },
    states: {
      loading: "कैटलॉग लोड हो रहा है",
      retry: "Request फिर चलाएँ",
      retryFailed: "Retry असफल रहा",
      emptyHint: "थोड़ा broader search term आज़माएँ या किसी दूसरे catalog category पर जाएँ।",
      performanceHint: "बड़े catalogs तेज़ रहते हैं क्योंकि केवल current page और active category लोड होती है।",
    },
    pagination: {
      previous: "पिछला पेज",
      next: "अगला पेज",
    },
    itemCard: {
      selected: "चयनित",
      details: "विवरण",
      fallbackDescription:
        "विश्वसनीय catalog component, जिसे आपके AI dev setup में bundle किया जा सकता है।",
    },
    detail: {
      close: "Item details बंद करें",
      installCommand: "Install Command",
      source: "Source",
      ruleContent: "Rule Content",
      env: "env",
      url: "url",
      requiresSecrets:
        "ज़रूरी secrets: {secrets}. CLI इन्हें locally prompt करता है। इन्हें servers पर नहीं भेजा जाता।",
      synced: "{date} को sync किया गया",
    },
    trust: {
      tiers: {
        verified: "Verified",
        official: "Official",
        community: "Community",
      },
      details: {
        verified: "VibeBasket team द्वारा hand-curated. यह upstream sources पर precedence लेता है।",
        official:
          "Upstream catalog owner या registry द्वारा explicitly official mark किया गया, बिना local heuristics के।",
        community: "Community repositories और public skill directories से discover किया गया।",
      },
      sources: {
        "verified-catalog": "VibeBasket द्वारा curated",
        "official-mcp-registry": "MCP Registry",
        "skills-sh-official": "skills.sh Curated",
        "skills-sh-community": "skills.sh Community",
        community: "Community",
      },
    },
  },
  basketUi: {
    eyebrow: "आपका Basket",
    title: "Bundle के लिए तैयार",
    itemsOne: "{count} item",
    itemsOther: "{count} items",
    closeAria: "Basket बंद करें",
    empty: "अपना setup assemble करने के लिए builder से MCPs, skills और rules चुनें।",
    typeLabels: {
      mcp: "MCP",
      skill: "Skill",
      rule: "Rule",
      mcps: "MCPs",
      skills: "Skills",
      rules: "Rules",
    },
    removeAria: "{name} हटाएँ",
    collapseList: "सूची समेटें",
    showMore: "{count} और दिखाएँ",
    targetIdes: "Target IDEs",
    clear: "साफ़ करें",
    worksToday: "आज उपलब्ध",
    targetsCount: "{count} targets",
    ecosystemWatchlist: "Ecosystem watchlist",
    soonCount: "{count} soon",
    unsupportedTargets:
      "{targets}: {capabilities} support नहीं करता। Apply के दौरान इन्हें skip किया जाएगा।",
    scopeConflict:
      "चुने गए targets एक shared install scope साझा नहीं करते। User-scope targets को साथ चुनें, या केवल project-scope target set पर जाएँ।",
    signInToSave: "Reusable stacks को अपनी profile में save करने के लिए sign in करें।",
    bundlePreview: "Bundle Preview",
    previewEmpty: "अपने bundle का preview देखने के लिए items चुनें।",
    previewItems: "{count} items: {breakdown}",
    previewItemsOne: "{count} item: {breakdown}",
    previewTargets: "{count} targets",
    previewTargetsOne: "{count} target",
    previewScope: "scope: {scope}",
    previewAutoSelected: " (auto-selected)",
    previewIncompatible: "{targets}: skills/rules skip किए गए",
    previewBlocked: "selected targets में shared scope नहीं है; bundle generation blocked है",
    installCommand: "Install Command",
    fetching: "Basket configuration fetch की जा रही है...",
    resolving: "Trusted MCP components resolve किए जा रहे हैं...",
    ready: "आपके चुने हुए IDEs पर apply करने के लिए तैयार।",
    generatedCommandWillAppear: "आपकी generated command यहाँ दिखाई देगी{scopeSuffix}",
    generating: "Generating",
    copyFreshCommand: "नई Command कॉपी करें",
    generateInstallCommand: "Install Command बनाएँ",
    pickAtLeastOne: "कम से कम एक item और एक target IDE चुनें।",
    sharedScopeRequired:
      "ये targets अभी एक shared install scope साझा नहीं करते। केवल user-scope या केवल project-scope targets साथ चुनें।",
    failedToBuild: "Bundle बनाना असफल रहा",
    copiedToClipboard: "Install command clipboard में कॉपी हो गई।",
    failedToGenerate: "Bundle command generate नहीं हो सकी।",
    plannedTarget: "यह target planned है, लेकिन apply engine अभी इसे support नहीं करता।",
    basketCleared: "Basket साफ़ कर दिया गया।",
    open: "खोलें",
  },
  docs: {
    metadataHub: {
      title: "VibeBasket दस्तावेज़ — AI डेवलपर सेटअप इन्फ्रास्ट्रक्चर",
      description:
        "VibeBasket catalog, CLI, IDE adapters, block delimiters, security model और self-hosting deployment के लिए guides।",
    },
    metadataGettingStarted: {
      title: "शुरुआत करें — VibeBasket दस्तावेज़",
      description:
        "अपना पहला AI context bundle 2 मिनट से कम में install करें। Catalog ब्राउज़ करें, MCPs और skills चुनें, bundle URL बनाएँ और CLI से apply करें।",
    },
    metadataCli: {
      title: "CLI संदर्भ — VibeBasket दस्तावेज़",
      description:
        "vibebasket apply, list, search, doctor, init और rollback commands के लिए पूरा संदर्भ। Flags, scopes, dry-run, verification और environment variables शामिल हैं।",
    },
    metadataAdapters: {
      title: "IDE अडैप्टर्स — 24 लक्ष्य — VibeBasket दस्तावेज़",
      description:
        "Cursor, Windsurf, VS Code, Claude Code, GitHub Copilot और 19 अन्य लक्ष्यों को कवर करने वाला multi-IDE adapter reference। Config paths और target-specific MCP/skills/rules support शामिल है।",
    },
    metadataDelimiters: {
      title: "ब्लॉक डिलिमिटर्स — VibeBasket दस्तावेज़",
      description:
        "VibeBasket shell scripts, markdown और YAML config files में idempotent file merging के लिए comment-block delimiters का उपयोग कैसे करता है।",
    },
    metadataSecurity: {
      title: "सुरक्षा — Zero-Trust मॉडल — VibeBasket दस्तावेज़",
      description:
        "VibeBasket platform के लिए zero-secret policy, rate limiting, security headers, CSP enforcement और local credential prompting.",
    },
    metadataSelfHosting: {
      title: "सेल्फ-होस्टिंग गाइड — VibeBasket दस्तावेज़",
      description:
        "Docker, manual Node.js setup या Helm/Kubernetes के साथ अपनी infrastructure पर VibeBasket deploy करें। Environment variables, backup storage और upgrade procedures.",
    },
    guideCards: {
      quickStart: {
        title: "क्विक स्टार्ट गाइड",
        description:
          "अपना पहला AI context bundle 2 मिनट से कम में चलाएँ। Catalog ब्राउज़ करें, MCP servers और skills चुनें, bundle URL बनाएँ और CLI से locally apply करें।",
        linkText: "क्विक स्टार्ट पढ़ें",
      },
      cli: {
        title: "CLI संदर्भ",
        description:
          "vibebasket apply command के लिए पूरा संदर्भ: bundle URLs, --force flag, --scope overrides, --dry-run preview mode और verification controls।",
        linkText: "CLI संदर्भ देखें",
      },
      adapters: {
        title: "IDE अडैप्टर्स",
        description:
          "हर supported IDE target, उसके config paths, MCP/skills/rules capability matrix और adapter implementation notes.",
        linkText: "अडैप्टर्स देखें",
      },
      delimiters: {
        title: "ब्लॉक डिलिमिटर्स",
        description:
          "VibeBasket shell scripts, markdown और YAML में idempotent file merging के लिए comment-block delimiters का उपयोग कैसे करता है।",
        linkText: "डिलिमिटर्स समझें",
      },
      security: {
        title: "सीक्रेट सुरक्षा",
        description:
          "Zero-secret cloud policy, local credential prompting और hardened HTTP security headers.",
        linkText: "सुरक्षा देखें",
      },
      selfHosting: {
        title: "सेल्फ-होस्टिंग गाइड",
        description:
          "Docker, plain Node.js या Kubernetes के साथ अपनी infrastructure पर VibeBasket चलाएँ। Backup storage, OAuth और upgrade procedures.",
        linkText: "सेल्फ-होस्टिंग शुरू करें",
      },
    },
    shell: {
      noResults: "इसके लिए कोई परिणाम नहीं मिला:",
      tryDifferentKeyword: "कोई दूसरा keyword आज़माएँ।",
      searchPlaceholder: "Docs खोजें…",
      searchAriaLabel: "दस्तावेज़ खोजें",
      mobileSectionLabel: "दस्तावेज़ अनुभाग",
      tabs: {
        hub: "दस्तावेज़",
        gettingStarted: "शुरुआत",
        cli: "CLI",
        adapters: "अडैप्टर्स",
        delimiters: "डिलिमिटर्स",
        security: "सुरक्षा",
        selfHosting: "सेल्फ-होस्टिंग",
      },
      docsHome: "दस्तावेज़",
      architecturalHub: "दस्तावेज़ केंद्र",
      technicalSpecs: "VibeBasket तकनीकी स्पेसिफिकेशन",
      documentationHub: "दस्तावेज़ केंद्र",
      hubDescription:
        "VibeBasket को ईमानदारी से configure, run और maintain करने के लिए ज़रूरी सब कुछ। सबसे तेज़ रास्ते के लिए शुरुआत, deployment expectations के लिए Self-hosting, और public launch की तैयारी के समय सुरक्षा से शुरुआत करें।",
      githubRepository: "GitHub रिपॉज़िटरी",
      npmPackage: "npm पैकेज",
    },
  },
  admin: {
    badge: "एडमिन",
    backToCatalog: "कैटलॉग पर वापस जाएँ",
    title: "सिस्टम ऑपरेशंस और मेट्रिक्स",
    description:
      "Real-time analytics, saved stack leaderboards और central registry health का अवलोकन।",
    navAriaLabel: "एडमिन अनुभाग",
    sections: {
      overview: "अवलोकन",
      readiness: "तैयारी",
      catalogOps: "कैटलॉग ऑप्स",
      catalogData: "कैटलॉग डेटा",
      collectors: "कलेक्टर्स",
      syncRuns: "सिंक रन",
      backups: "बैकअप्स",
      storage: "स्टोरेज",
      schedules: "शेड्यूल्स",
      systemHealth: "सिस्टम हेल्थ",
      users: "यूज़र्स",
    },
  },
};
