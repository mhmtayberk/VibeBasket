import type { AppDictionary } from "./en";

export const zhDictionary: AppDictionary = {
  localeLabel: "简体中文",
  shared: {
    brand: "VibeBasket",
    navigation: {
      who: "适合谁用",
      how: "工作方式",
      catalog: "目录",
      faq: "常见问题",
      documentation: "文档",
      installFlow: "安装流程",
      buildBasket: "构建你的篮子",
      login: "登录",
      home: "首页",
      back: "返回",
      backToCatalog: "返回目录",
      backToBuilder: "返回构建器",
      openDocs: "打开文档",
      returnHome: "返回首页",
      selfHostGuide: "自托管指南",
      startBuildingFree: "免费开始构建",
      viewCatalog: "MCP Server",
    },
    auth: {
      signIn: "登录",
      signOut: "退出登录",
      myStacks: "我的 Stack",
      stacks: "Stack",
      admin: "管理",
      signedIn: "已登录",
      continueWith: "继续使用",
      accountSync: "账户同步",
      signInToSaveStacks: "登录以保存你的 Stack",
      loginNotConfigured: "登录尚未配置。",
      loginNotConfiguredBody:
        "当前环境尚未启用任何社交登录提供方。添加提供方凭据和 AUTH_SECRET 后即可启用登录。",
      profileSync: "资料同步",
      profileSyncBody: "保存的 Stack 会绑定到你的账户。",
      providerChoice: "提供方选择",
      providerChoiceBody: "这里只显示当前环境已启用的提供方。",
      safeReturn: "安全返回",
      safeReturnBody: "登录后会回到你最初开始的流程。",
      savedBasketsLead:
        "将你常用的篮子绑定到个人资料，这样你就可以在不同会话中重新打开、分享并重复使用它们。",
      authenticationRequired: "需要身份验证",
      signInToAccessSavedStacks: "登录以访问已保存的 Stack",
      signInToAccessSavedStacksBody:
        "已保存的 Stack 存放在你的个人资料下，因此只有登录后才能访问此区域。",
      savedStacks: "已保存的 Stack",
      yourSavedStacks: "你的已保存 Stack",
      yourSavedStacksBody:
        "重新打开你常用的篮子，随着工作流演进为它们重命名，或删除已经过时的配置。",
    },
    status: {
      nextStep: "下一步",
      nextStepBody: "返回已知页面、继续浏览目录，或重新打开文档。",
      notFoundEyebrow: "404 · 路由未找到",
      notFoundTitle: "页面未找到",
      notFoundSummary: "该路由已经不可用、从未存在，或者路径输入有误。请返回目录或重新打开文档。",
      forbiddenEyebrow: "403 · 访问受限",
      forbiddenTitle: "你无权访问此页面",
      forbiddenSummary:
        "此区域仅对当前环境中的授权账户开放。请返回主目录，或使用获准的管理员账户登录。",
      openLogin: "打开登录",
    },
    localeSwitcher: {
      label: "语言",
    },
  },
  home: {
    metadata: {
      title: "VibeBasket — 面向 MCP、Skills 和 Rules 的 AI 配置包",
      description:
        "将可信 MCP 服务器、skills 和 rules 打包成一个可分享的安装流程。选择你的技术栈，生成链接，并在各类 AI IDE 与 CLI 中应用。",
      ogDescription:
        "为你的 AI 开发栈共享统一安装流程。适用于 Cursor、Windsurf、Claude Code 等工具的可信 MCP、skills 与 rules。",
      twitterDescription: "为所有 AI 编码工具共享一套可信 MCP、skills 与 rules 的统一安装流程。",
    },
    hero: {
      badge: "开源 · 24 个 IDE 目标",
      titleMobile: "把你的 AI 开发配置打成包。用一个链接分享出去。",
      titleDesktop: ["打包你的 AI", "开发配置。", "用一个链接", "分享出去。"],
      description:
        "整理可信的 MCP 服务器、可复用的 skills 和项目 rules。生成一条可在 Cursor、Windsurf、VS Code 以及其余 AI 编码工具之间稳定迁移的安装命令。",
      github: "GitHub",
      npm: "npm",
      livePreview: "实时预览",
      previewPrimaryLabel: "仓库上下文",
      previewSecondaryLabel: "编码规则",
      copied: "已复制",
      terminalLines: [
        "> 正在获取可信篮子配置...",
        "> 正在为所选目标写入 MCP 配置...",
        "> Cursor、Windsurf 和 VS Code 已准备好上下文。",
      ],
      trustTitle: "可信发现",
      trustBody: "官方注册表和精选记录会被去重并汇总到一个目录中。",
      localSecretsTitle: "本地密钥",
      localSecretsBody: "敏感值在 apply 过程中始终保留在你的机器上。",
      safeRerunsTitle: "安全重跑",
      safeRerunsBody: "幂等写入加备份机制，让配置变更始终可回退。",
    },
    who: {
      eyebrow: "适合谁用",
      title: "为高节奏团队打造。",
      description:
        "无论你是独立开发者还是团队维护者，VibeBasket 都能消除逐台机器配置 AI 编码工具的摩擦。",
      cards: [
        {
          tag: "独立开发者",
          headline: "一条命令，覆盖每个编辑器。",
          body: "不再在 Cursor、Windsurf 和 VS Code 之间手动复制 MCP 配置。构建一次 bundle，然后用一条 npx 命令在所有地方应用。",
        },
        {
          tag: "创业团队",
          headline: "几分钟完成入职，不是几小时。",
          body: "给新成员分享一个 bundle URL。他们运行一条命令，就能获得和团队其他人完全一致的 MCP、skills 和 rules，无需手动配置。",
        },
        {
          tag: "平台维护者",
          headline: "策划可信默认值。",
          body: "发布经过验证的 MCP 服务器和项目 rules，让用户零配置安装。无需分发配置文件，也能控制每个环境的默认内容。",
        },
      ],
    },
    how: {
      eyebrow: "工作方式",
      title: "从零到完成配置，只需三步。",
      description: "无需复制配置文件。无需四处查找 IDE 设置。只要浏览、打包、应用。",
      steps: [
        {
          step: "01",
          title: "浏览可信组件",
          body: "目录条目会从精选数据和可信上游来源中拉取，然后统一规范化并去重。",
        },
        {
          step: "02",
          title: "组装你的篮子",
          body: "直接在构建器中选择 MCP、skills 和 rules。界面会让篮子状态始终可见且可撤销。",
        },
        {
          step: "03",
          title: "用一条命令应用",
          body: "生成一条安装命令，在多个编辑器之间复用同一套配置，而无需手工重配。",
        },
      ],
    },
    command: {
      title: ["停止反复配置。", "开始编码。"],
      terminalLine: "$ npx vibebasket apply <bundle-url>",
      kicker: "开源。低摩擦。为高速团队打造。",
    },
    faq: {
      eyebrow: "常见问题",
      title: "最常被先问到的问题。",
      description:
        "在人们围绕 VibeBasket 标准化工作流之前，通常最关心的是信任、安装和自托管细节。这里给出简短答案。",
      entries: [
        {
          question: "VibeBasket 会接收我的运行时 API 密钥吗？",
          answer:
            "不会。Bundle 清单不会携带终端用户的运行时密钥。当选中的 MCP 需要凭据时，CLI 会在 apply 期间于本地解析该值，并将其写入你机器上目标工具自己的配置位置。",
        },
        {
          question: "如果我的 IDE 已经配置了 MCP、skills 或 rules，会发生什么？",
          answer:
            "VibeBasket 会合并到目标支持的配置面，而不是假设所有文件都是空的。已有内容会保留；由 VibeBasket 管理的块保持幂等；未变化的 MCP 状态会被跳过，因此重复 apply 不会不停重写相同目标。",
        },
        {
          question: "Verified、Official 和 Community 分别是什么意思？",
          answer:
            "Verified 表示该条目由 VibeBasket 人工精选。Official 表示上游来源明确提供了所有者或厂商认证信号。Community 则是其余通过目录规范化和去重流程的条目。",
        },
        {
          question: "我可以为团队自托管 VibeBasket 吗？",
          answer:
            "可以。Web 应用、CLI、目录同步、认证、管理工具和备份流程都在这个仓库中。默认自托管形态是一个 VPS、一个应用实例，以及一个带持久化存储和外部备份的 SQLite 数据库。",
        },
        {
          question: "重复运行 npx vibebasket apply 安全吗？",
          answer:
            "这是默认预期行为。CLI 具备备份感知能力，会跳过无变化的 MCP 写入，并让目标相关安装行为保持幂等，因此同一个篮子可以重复应用，而不会变成破坏性重写。",
        },
        {
          question: "创建 bundle 之后，之后还能再次使用吗？",
          answer:
            "可以。如果你登录了，已保存的 Stack 和账户级篮子历史会让你之后回到同一套配置。即使不走这一流程，只要生成的 bundle 仍在托管或自托管实例中可用，它仍然可以被再次使用或分享。",
        },
      ],
    },
    footer: {
      description: "为希望在现代编码工具中获得可复现上下文的团队打造的 AI 配置基础设施。",
      madeWith: "制作于",
      by: "由",
      for: "面向",
      vibeCoding: "Vibe Coding",
      vibeCoders: "Vibe Coders",
    },
  },
  catalogUi: {
    builderEyebrow: "构建器",
    builderTitle: "无需手动重新配置所有内容，也能搭建你的技术栈。",
    builderDescription: "浏览可信组件，组装你的篮子，并为团队真正使用的编辑器生成一条安装命令。",
    chips: {
      trustedSources: "可信来源",
      trustAwareDiscovery: "带信任语义的发现",
      itemsPerPage: "每页 {count} 项",
    },
    tabs: {
      mcps: {
        label: "MCP 服务器",
        eyebrow: "可信运行时连接器",
        empty: "当前还没有匹配这次搜索的 MCP 服务器。",
      },
      skills: {
        label: "Skills",
        eyebrow: "可复用的代理能力",
        empty: "当前还没有匹配这次搜索的 skill。",
      },
      rules: {
        label: "Rules",
        eyebrow: "可移植的工作约定",
        empty: "当前还没有匹配这次搜索的 rule。",
      },
    },
    searchPlaceholder: "搜索{label}...",
    filters: {
      toggle: "筛选",
      clear: "清除",
      trust: "信任",
      sort: "排序",
      trustOptions: {
        all: "全部信任级别",
        verified: "Verified",
        official: "Official",
        community: "Community",
      },
      sortOptions: {
        recommended: "推荐",
        freshest: "最新",
        name: "A-Z",
      },
    },
    summary: {
      showing: "显示第 {start}-{end} 项，共 {total} 项",
      page: "第 {page} 页",
      pageOf: "第 {page} / {totalPages} 页",
    },
    states: {
      loading: "目录加载中",
      retry: "重试请求",
      retryFailed: "重试失败",
      emptyHint: "试试更宽泛的搜索词，或切换到另一个目录分类。",
      performanceHint: "大型目录通过只加载当前页和当前分类来保持快速响应。",
    },
    pagination: {
      previous: "上一页",
      next: "下一页",
    },
    itemCard: {
      selected: "已选择",
      details: "详情",
      fallbackDescription: "可信目录组件，已可加入你的 AI 开发配置。",
    },
    detail: {
      close: "关闭条目详情",
      installCommand: "安装命令",
      source: "来源",
      ruleContent: "Rule 内容",
      env: "env",
      url: "url",
      requiresSecrets: "需要 secrets：{secrets}。CLI 会在本地提示输入，绝不会发送到服务器。",
      synced: "同步于 {date}",
    },
    trust: {
      tiers: {
        verified: "Verified",
        official: "Official",
        community: "Community",
      },
      details: {
        verified: "由 VibeBasket 团队手工精选，优先级高于上游来源。",
        official: "由上游目录所有者或注册表明确标记为官方，不依赖本地启发式判断。",
        community: "来自社区仓库和公开 skill 目录的发现结果。",
      },
      sources: {
        "verified-catalog": "由 VibeBasket 精选",
        "official-mcp-registry": "MCP Registry",
        "skills-sh-official": "skills.sh 精选",
        "skills-sh-community": "skills.sh Community",
        community: "Community",
      },
    },
  },
  basketUi: {
    eyebrow: "你的篮子",
    title: "已准备好打包",
    itemsOne: "{count} 项",
    itemsOther: "{count} 项",
    closeAria: "关闭篮子",
    empty: "从构建器中选择 MCP、skills 和 rules 来组装你的配置。",
    typeLabels: {
      mcp: "MCP",
      skill: "Skill",
      rule: "Rule",
      mcps: "MCPs",
      skills: "Skills",
      rules: "Rules",
    },
    removeAria: "移除 {name}",
    collapseList: "收起列表",
    showMore: "再显示 {count} 项",
    targetIdes: "目标 IDE",
    clear: "清空",
    worksToday: "当前可用",
    targetsCount: "{count} 个目标",
    ecosystemWatchlist: "生态观察列表",
    soonCount: "{count} 个即将到来",
    unsupportedTargets: "{targets}：不支持 {capabilities}。这些会在 apply 时被跳过。",
    scopeConflict:
      "所选目标之间没有共享的 install scope。请只组合 user-scope 目标，或切换到仅 project-scope 的目标集合。",
    signInToSave: "登录后可将可复用的 stacks 保存到你的个人资料。",
    bundlePreview: "Bundle 预览",
    previewEmpty: "选择条目后即可预览你的 bundle。",
    previewItems: "{count} 项：{breakdown}",
    previewItemsOne: "{count} 项：{breakdown}",
    previewTargets: "{count} 个目标",
    previewTargetsOne: "{count} 个目标",
    previewScope: "scope：{scope}",
    previewAutoSelected: "（自动选择）",
    previewIncompatible: "{targets}：skills/rules 已跳过",
    previewBlocked: "所选目标之间没有共享 scope；bundle 生成已被阻止",
    installCommand: "安装命令",
    fetching: "正在获取 basket 配置...",
    resolving: "正在解析可信 MCP 组件...",
    ready: "已准备好应用到你选择的 IDE。",
    generatedCommandWillAppear: "生成的命令会显示在这里{scopeSuffix}",
    generating: "生成中",
    copyFreshCommand: "复制最新命令",
    generateInstallCommand: "生成安装命令",
    pickAtLeastOne: "至少选择一个条目和一个目标 IDE。",
    sharedScopeRequired:
      "这些目标目前还不能共享同一个 install scope。请选择仅 user-scope 或仅 project-scope 的目标组合。",
    failedToBuild: "生成 bundle 失败",
    copiedToClipboard: "安装命令已复制到剪贴板。",
    failedToGenerate: "生成 bundle 命令失败。",
    plannedTarget: "这个目标已在计划中，但 apply 引擎尚未支持。",
    basketCleared: "篮子已清空。",
    open: "打开",
  },
  docs: {
    metadataHub: {
      title: "VibeBasket 文档 — AI 开发配置基础设施",
      description:
        "关于 VibeBasket 目录、CLI、IDE 适配器、块分隔符、安全模型和自托管部署的文档指南。",
    },
    metadataGettingStarted: {
      title: "快速开始 — VibeBasket 文档",
      description:
        "在 2 分钟内安装你的第一个 AI 上下文 bundle。浏览目录、选择 MCP 和 skills、生成 bundle URL，并通过 CLI 应用。",
    },
    metadataCli: {
      title: "CLI 参考 — VibeBasket 文档",
      description:
        "vibebasket apply、list、search、doctor、init 和 rollback 的完整参考。包含参数、作用域、dry-run、校验和环境变量。",
    },
    metadataMcp: {
      title: "本地 MCP — VibeBasket 文档",
      description:
        "本地 VibeBasket MCP 服务如何工作：stdio 传输、目标指导、目录搜索、安装规划、apply、rollback 以及当前 phase-1 边界。",
    },
    metadataAdapters: {
      title: "IDE 适配器 — 24 个目标 — VibeBasket 文档",
      description:
        "覆盖 Cursor、Windsurf、VS Code、Claude Code、GitHub Copilot 等 24 个目标的多 IDE 适配器参考，包括配置路径以及每个目标对 MCP/skills/rules 的支持。",
    },
    metadataDelimiters: {
      title: "块分隔符 — VibeBasket 文档",
      description:
        "VibeBasket 如何在 shell 脚本、Markdown 和 YAML 配置文件中使用注释块分隔符实现幂等文件合并。",
    },
    metadataSecurity: {
      title: "安全 — 零信任模型 — VibeBasket 文档",
      description:
        "VibeBasket 平台的 zero-secret 策略、速率限制、安全响应头、CSP 强制以及本地凭据提示流程。",
    },
    metadataSelfHosting: {
      title: "自托管指南 — VibeBasket 文档",
      description:
        "通过 Docker、手动 Node.js 部署或 Helm/Kubernetes 在自己的基础设施上运行 VibeBasket。包括环境变量、备份存储和升级步骤。",
    },
    guideCards: {
      quickStart: {
        title: "快速开始指南",
        description:
          "在 2 分钟内让你的第一个 AI 上下文 bundle 运行起来。浏览目录、选择 MCP 服务器和 skills、生成 bundle URL，并在本地通过 CLI 应用。",
        linkText: "阅读快速开始",
      },
      cli: {
        title: "CLI 参考",
        description:
          "vibebasket apply 命令的完整参考：bundle URL、--force、--scope 覆盖、--dry-run 预览模式和校验控制。",
        linkText: "查看 CLI 参考",
      },
      mcp: {
        title: "本地 MCP",
        description:
          "在 AI IDE 中将 VibeBasket 作为本地 stdio MCP 服务接入，并在不离开对话的情况下使用目标指导、目录搜索、安装规划与 apply 工具。",
        linkText: "打开 MCP 指南",
      },
      adapters: {
        title: "IDE 适配器",
        description:
          "每个受支持 IDE 目标的配置路径、MCP/skills/rules 能力矩阵，以及适配器实现说明。",
        linkText: "浏览适配器",
      },
      delimiters: {
        title: "块分隔符",
        description:
          "VibeBasket 如何在 shell 脚本、Markdown 和 YAML 中使用注释块分隔符实现幂等合并。",
        linkText: "了解分隔符",
      },
      security: {
        title: "密钥安全",
        description:
          "zero-secret 云策略、本地凭据提示、速率限制架构，以及加固后的 HTTP 安全响应头。",
        linkText: "查看安全",
      },
      selfHosting: {
        title: "自托管指南",
        description:
          "通过 Docker、原生 Node.js 或 Kubernetes 在自己的基础设施上运行 VibeBasket。包含备份存储、OAuth 和升级流程。",
        linkText: "开始自托管",
      },
    },
    shell: {
      noResults: "没有找到与以下内容匹配的结果：",
      tryDifferentKeyword: "请尝试其他关键词。",
      searchPlaceholder: "搜索文档…",
      searchAriaLabel: "搜索文档",
      mobileSectionLabel: "文档分区",
      tabs: {
        hub: "文档",
        gettingStarted: "快速开始",
        cli: "CLI",
        mcp: "MCP",
        adapters: "适配器",
        delimiters: "分隔符",
        security: "安全",
        selfHosting: "自托管",
      },
      docsHome: "文档",
      architecturalHub: "架构中心",
      technicalSpecs: "VibeBasket 技术规格",
      documentationHub: "文档中心",
      hubDescription:
        "这里包含你为清晰地配置、运行和维护 VibeBasket 所需的全部信息。最短路径请先看快速开始；部署预期请看自托管；准备公开发布时请查看安全部分。",
      githubRepository: "GitHub 仓库",
      npmPackage: "npm 包",
    },
  },
  admin: {
    badge: "管理",
    backToCatalog: "返回目录",
    title: "系统运维与指标",
    description: "实时分析、用户已保存 Stack 排行以及中央注册表健康状态。",
    navAriaLabel: "管理分区",
    sections: {
      overview: "概览",
      readiness: "发布准备",
      catalogOps: "目录操作",
      catalogData: "目录数据",
      collectors: "采集器",
      syncRuns: "同步记录",
      backups: "备份",
      storage: "存储",
      schedules: "计划任务",
      systemHealth: "系统健康",
      users: "用户",
    },
  },
};
