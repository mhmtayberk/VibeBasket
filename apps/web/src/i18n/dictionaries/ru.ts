import { type AppDictionary, enDictionary } from "./en";

export const ruDictionary: AppDictionary = {
  ...enDictionary,
  localeLabel: "Русский",
  shared: {
    ...enDictionary.shared,
    navigation: {
      ...enDictionary.shared.navigation,
      who: "Для кого",
      how: "Как это работает",
      catalog: "Каталог",
      faq: "Вопросы и ответы",
      documentation: "Документация",
      installFlow: "Поток установки",
      buildBasket: "Собрать набор",
      login: "Войти",
      home: "Главная",
      back: "Назад",
      backToCatalog: "Назад к каталогу",
      backToBuilder: "Назад к сборщику",
      openDocs: "Открыть документацию",
      returnHome: "Вернуться на главную",
      selfHostGuide: "Гайд по self-hosting",
      startBuildingFree: "Начать бесплатно",
      viewCatalog: "Открыть каталог",
    },
    auth: {
      ...enDictionary.shared.auth,
      signIn: "Войти",
      signOut: "Выйти",
      myStacks: "Мои стеки",
      stacks: "Стеки",
      admin: "Админ",
      signedIn: "Вы вошли",
      continueWith: "Продолжить через",
      accountSync: "Синхронизация аккаунта",
      signInToSaveStacks: "Войдите, чтобы сохранять стеки",
      loginNotConfigured: "Вход ещё не настроен.",
      loginNotConfiguredBody:
        "В этой среде сейчас не включён ни один социальный провайдер. Добавьте credentials провайдеров и AUTH_SECRET, чтобы включить вход.",
      profileSync: "Синхронизация профиля",
      profileSyncBody: "Сохранённые стеки остаются привязаны к вашему аккаунту.",
      providerChoice: "Выбор провайдера",
      providerChoiceBody: "Отображаются только провайдеры, включённые в этой среде.",
      safeReturn: "Безопасный возврат",
      safeReturnBody: "После входа вы возвращаетесь к тому потоку, с которого начали.",
      savedBasketsLead:
        "Храните любимые наборы в своём профиле, чтобы открывать их снова, делиться ими и переиспользовать между сессиями.",
      authenticationRequired: "Требуется аутентификация",
      signInToAccessSavedStacks: "Войдите, чтобы открыть сохранённые стеки",
      signInToAccessSavedStacksBody:
        "Сохранённые стеки живут в вашем профиле, поэтому эта зона доступна только после аутентификации.",
      savedStacks: "Сохранённые стеки",
      yourSavedStacks: "Ваши сохранённые стеки",
      yourSavedStacksBody:
        "Снова открывайте корзины, которые используете часто, переименовывайте их по мере развития процесса или удаляйте устаревшие конфигурации.",
    },
    status: {
      ...enDictionary.shared.status,
      nextStep: "Следующий шаг",
      nextStepBody:
        "Вернитесь на известный маршрут, продолжайте просмотр каталога или снова откройте документацию.",
      notFoundEyebrow: "404 · Маршрут не найден",
      notFoundTitle: "Страница не найдена",
      notFoundSummary:
        "Этот маршрут больше недоступен, никогда не существовал или был введён с ошибкой. Вернитесь к каталогу или снова откройте документацию.",
      forbiddenEyebrow: "403 · Доступ ограничен",
      forbiddenTitle: "У вас нет доступа к этой странице",
      forbiddenSummary:
        "Эта область доступна только авторизованному аккаунту в текущей среде. Вернитесь к основному каталогу или войдите под одобренным профилем администратора.",
      openLogin: "Открыть вход",
    },
    localeSwitcher: {
      label: "Язык",
    },
  },
  home: {
    ...enDictionary.home,
    metadata: {
      title: "VibeBasket — AI-наборы для MCP, Skills и Rules",
      description:
        "Собирайте доверенные MCP-серверы, skills и rules в одну установку, которой можно делиться. Выберите свой стек, сгенерируйте ссылку и применяйте его во всех AI IDE и CLI.",
      ogDescription:
        "Один install flow для вашего AI dev stack. Доверенные MCP, skills и rules для Cursor, Windsurf, Claude Code и других инструментов.",
      twitterDescription:
        "Делитесь единым install flow для доверенных MCP, skills и rules во всех AI coding tools.",
    },
    hero: {
      ...enDictionary.home.hero,
      badge: "Open source · 24 IDE-цели",
      titleMobile: "Соберите свой AI dev setup. Делитесь им одной ссылкой.",
      titleDesktop: ["Соберите свой", "AI dev setup.", "Делитесь им", "одной ссылкой."],
      description:
        "Собирайте доверенные MCP-серверы, переиспользуемые skills и project rules. Генерируйте одну install-команду, которая чисто переносится между Cursor, Windsurf, VS Code и остальной частью вашего AI coding stack.",
      livePreview: "Live preview",
      previewPrimaryLabel: "контекст репозитория",
      previewSecondaryLabel: "coding rules",
      copied: "скопировано",
      terminalLines: [
        "> Загружаем доверенную конфигурацию набора...",
        "> Записываем MCP-конфиг для выбранных целей...",
        "> Контекст готов в Cursor, Windsurf и VS Code.",
      ],
      trustTitle: "Надёжное обнаружение",
      trustBody: "Официальные реестры и curated-записи, дедуплицированные в единый каталог.",
      localSecretsTitle: "Локальные секреты",
      localSecretsBody: "Чувствительные значения остаются на вашей машине во время apply.",
      safeRerunsTitle: "Безопасные повторы",
      safeRerunsBody: "Идемпотентные записи и backup’ы делают изменения установки обратимыми.",
    },
    who: {
      eyebrow: "Для кого это",
      title: "Создано для команд, которые двигаются быстро.",
      description:
        "Работаете ли вы один или ведёте команду, VibeBasket убирает трение при настройке AI coding tools по одной машине за раз.",
      cards: [
        {
          tag: "Одиночный разработчик",
          headline: "Одна команда для каждого редактора.",
          body: "Хватит копировать MCP-конфиги между Cursor, Windsurf и VS Code. Соберите один bundle и применяйте его везде одной командой npx.",
        },
        {
          tag: "Стартап-команда",
          headline: "Онбординг за минуты, а не за часы.",
          body: "Поделитесь bundle URL с новыми участниками. Они запускают одну команду и получают те же MCP, skills и rules, что и вся команда — без ручной настройки.",
        },
        {
          tag: "Platform maintainer",
          headline: "Курируйте доверенные дефолты.",
          body: "Публикуйте верифицированные MCP-серверы и project rules, которые пользователи смогут установить без ручной конфигурации. Контролируйте, что попадает в каждую среду, не раздавая конфиг-файлы.",
        },
      ],
    },
    how: {
      eyebrow: "Как это работает",
      title: "Три шага от нуля до готовой конфигурации.",
      description:
        "Никаких конфигов для копирования. Никаких охот за настройками IDE. Только browse, bundle и apply.",
      steps: [
        {
          step: "01",
          title: "Изучайте доверенные компоненты",
          body: "Записи каталога подтягиваются из curated-данных и доверенных upstream-источников, затем нормализуются и дедуплицируются.",
        },
        {
          step: "02",
          title: "Соберите свой набор",
          body: "Выбирайте MCP, skills и rules прямо в builder’е. Интерфейс держит состояние корзины видимым и обратимым.",
        },
        {
          step: "03",
          title: "Применяйте одной командой",
          body: "Сгенерируйте одну install-команду и применяйте одинаковую конфигурацию в нескольких редакторах без ручной перенастройки.",
        },
      ],
    },
    command: {
      ...enDictionary.home.command,
      title: ["Хватит перенастраивать.", "Пора писать код."],
      kicker: "Open source. Меньше церемоний. Создано для команд, которые двигаются быстро.",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Вопросы, которые обычно возникают первыми.",
      description:
        "Короткие ответы про trust, установку и self-hosting, которые обычно нужны перед стандартизацией workflow вокруг VibeBasket.",
      entries: [
        {
          question: "Получает ли VibeBasket мои runtime API keys?",
          answer:
            "Нет. Bundle manifest’ы не содержат runtime-секреты конечного пользователя. Когда выбранному MCP нужны credentials, CLI локально запрашивает это значение во время apply и записывает его в конфигурационную поверхность нужного инструмента на вашей машине.",
        },
        {
          question: "Что будет, если в моей IDE уже настроены MCP, skills или rules?",
          answer:
            "VibeBasket делает merge в поддерживаемую конфигурационную поверхность цели, а не притворяется, что каждый файл пуст. Существующие блоки сохраняются, управляемые VibeBasket блоки остаются идемпотентными, а неизменённое состояние MCP пропускается.",
        },
        {
          question: "Что означают Verified, Official и Community?",
          answer:
            "Verified означает, что элемент курирован VibeBasket. Official означает, что upstream-источник явно сообщил сигнал от владельца или вендора. Community — всё остальное, что всё ещё проходит через нормализацию и дедупликацию каталога.",
        },
        {
          question: "Можно ли self-host’ить VibeBasket для своей команды?",
          answer:
            "Да. Веб-приложение, CLI, sync каталога, auth, admin-инструменты и backup-потоки находятся в этом репозитории. Базовая self-hosting-схема — один VPS, один инстанс приложения и одна SQLite-база с persistent storage и внешними backup’ами.",
        },
        {
          question: "Безопасно ли повторно запускать npx vibebasket apply?",
          answer:
            "Да, именно так и задумано. CLI учитывает backup’ы, пропускает no-op записи MCP и сохраняет target-specific поведение идемпотентным, чтобы один и тот же bundle можно было применять повторно без разрушительных перезаписей.",
        },
        {
          question: "Можно ли использовать созданный bundle позже?",
          answer:
            "Да. Если вы вошли в систему, сохранённые стеки и история наборов на уровне аккаунта позволят вернуться к той же конфигурации позже. Даже вне этого потока сгенерированный bundle URL можно повторно использовать или делиться им, пока этот bundle доступен на hosted или self-hosted инстансе.",
        },
      ],
    },
    footer: {
      ...enDictionary.home.footer,
      description:
        "AI-setup инфраструктура для команд, которым нужен воспроизводимый контекст в современных coding tools.",
      madeWith: "Сделано с",
      by: "от",
      for: "для",
    },
  },
  catalogUi: {
    ...enDictionary.catalogUi,
    builderEyebrow: "Сборщик",
    builderTitle: "Соберите свой стек без ручной перенастройки всего подряд.",
    builderDescription:
      "Изучайте доверенные компоненты, собирайте свой набор и генерируйте одну install-команду для редакторов, которыми реально пользуется ваша команда.",
    chips: {
      trustedSources: "Доверенные источники",
      trustAwareDiscovery: "Поиск с учётом доверия",
      itemsPerPage: "{count} элементов на страницу",
    },
    tabs: {
      mcps: {
        label: "MCP-серверы",
        eyebrow: "Доверенные runtime-коннекторы",
        empty: "По этому запросу MCP-серверы пока не найдены.",
      },
      skills: {
        label: "Skills",
        eyebrow: "Переиспользуемые возможности агента",
        empty: "По этому запросу skills не найдены.",
      },
      rules: {
        label: "Rules",
        eyebrow: "Переносимые рабочие соглашения",
        empty: "По этому запросу rules не найдены.",
      },
    },
    searchPlaceholder: "Поиск по {label}...",
    filters: {
      ...enDictionary.catalogUi.filters,
      toggle: "Фильтры",
      clear: "Очистить",
      trust: "Trust",
      sort: "Сортировка",
      trustOptions: {
        all: "Любой trust",
        verified: "Verified",
        official: "Official",
        community: "Community",
      },
      sortOptions: {
        recommended: "Рекомендуемые",
        freshest: "Самые свежие",
        name: "A-Z",
      },
    },
    summary: {
      showing: "Показаны {start}-{end} из {total}",
      page: "Страница {page}",
      pageOf: "Страница {page} / {totalPages}",
    },
    states: {
      loading: "Загрузка каталога",
      retry: "Повторить запрос",
      retryFailed: "Повтор не удался",
      emptyHint:
        "Попробуйте более широкий поисковый запрос или переключитесь в другую категорию каталога.",
      performanceHint:
        "Большие каталоги остаются быстрыми благодаря загрузке только текущей страницы и активной категории.",
    },
    pagination: {
      previous: "Предыдущая страница",
      next: "Следующая страница",
    },
    itemCard: {
      selected: "Выбрано",
      details: "Подробнее",
      fallbackDescription:
        "Доверенный компонент каталога, готовый к добавлению в ваш AI dev setup.",
    },
    detail: {
      close: "Закрыть детали элемента",
      installCommand: "Команда установки",
      source: "Источник",
      ruleContent: "Содержимое rule",
      env: "env",
      url: "url",
      requiresSecrets:
        "Требуются секреты: {secrets}. CLI запрашивает их локально. На серверы не отправляются.",
      synced: "Синхронизировано {date}",
    },
    trust: {
      tiers: {
        verified: "Verified",
        official: "Official",
        community: "Community",
      },
      details: {
        verified:
          "Курируется командой VibeBasket вручную. Имеет приоритет над upstream-источниками.",
        official:
          "Явно помечено как official владельцем upstream-каталога или registry, без локальных эвристик.",
        community: "Обнаружено в community-репозиториях и публичных skill-директориях.",
      },
      sources: {
        "verified-catalog": "Курировано VibeBasket",
        "official-mcp-registry": "MCP Registry",
        "skills-sh-official": "skills.sh Curated",
        "skills-sh-community": "skills.sh Community",
        community: "Community",
      },
    },
  },
  basketUi: {
    ...enDictionary.basketUi,
    eyebrow: "Ваш набор",
    title: "Готово к упаковке",
    itemsOne: "{count} элемент",
    itemsOther: "{count} элементов",
    closeAria: "Закрыть корзину",
    empty: "Выберите MCP, skills и rules в builder’е, чтобы собрать свою конфигурацию.",
    typeLabels: {
      mcp: "MCP",
      skill: "Skill",
      rule: "Rule",
      mcps: "MCP",
      skills: "Skills",
      rules: "Rules",
    },
    removeAria: "Удалить {name}",
    collapseList: "Свернуть список",
    showMore: "Показать ещё {count}",
    targetIdes: "Целевые IDE",
    clear: "Очистить",
    worksToday: "Работает уже сейчас",
    targetsCount: "{count} целей",
    ecosystemWatchlist: "Наблюдение за экосистемой",
    soonCount: "{count} скоро",
    unsupportedTargets:
      "{targets}: не поддерживает {capabilities}. Они будут пропущены во время apply.",
    scopeConflict:
      "Выбранные цели не имеют общей install-scope. Группируйте user-scope цели вместе или переключайтесь на набор только с project-scope.",
    signInToSave: "Войдите, чтобы сохранять переиспользуемые стеки в свой профиль.",
    bundlePreview: "Предпросмотр bundle",
    previewEmpty: "Выберите элементы, чтобы увидеть preview вашего bundle.",
    previewItems: "{count} элементов: {breakdown}",
    previewItemsOne: "{count} элемент: {breakdown}",
    previewTargets: "{count} целей",
    previewTargetsOne: "{count} цель",
    previewScope: "scope: {scope}",
    previewAutoSelected: " (автовыбрано)",
    previewIncompatible: "{targets}: skills/rules пропущены",
    previewBlocked: "нет общего scope между выбранными целями; генерация bundle заблокирована",
    installCommand: "Команда установки",
    fetching: "Получаем конфигурацию набора...",
    resolving: "Разрешаем доверенные MCP-компоненты...",
    ready: "Готово к применению в выбранных IDE.",
    generatedCommandWillAppear: "Сгенерированная команда появится здесь{scopeSuffix}",
    generating: "Генерация",
    copyFreshCommand: "Скопировать свежую команду",
    generateInstallCommand: "Сгенерировать install-команду",
    pickAtLeastOne: "Выберите хотя бы один элемент и одну целевую IDE.",
    sharedScopeRequired:
      "У этих целей пока нет общего scope. Выбирайте вместе только user-scope или только project-scope цели.",
    failedToBuild: "Не удалось собрать bundle",
    copiedToClipboard: "Команда установки скопирована в буфер обмена.",
    failedToGenerate: "Не удалось сгенерировать команду bundle.",
    plannedTarget: "Эта цель запланирована, но пока не поддерживается apply engine.",
    basketCleared: "Корзина очищена.",
    open: "Открыть",
  },
  docs: {
    ...enDictionary.docs,
    metadataHub: {
      title: "Документация VibeBasket — AI dev setup инфраструктура",
      description:
        "Гайды по каталогу VibeBasket, CLI, IDE-адаптерам, block delimiters, security-модели и self-hosting deployment.",
    },
    metadataGettingStarted: {
      title: "Быстрый старт — VibeBasket Docs",
      description:
        "Установите свой первый AI context bundle менее чем за 2 минуты. Просмотрите каталог, выберите MCP и skills, сгенерируйте bundle URL и примените его через CLI.",
    },
    metadataCli: {
      title: "CLI Reference — VibeBasket Docs",
      description:
        "Полный справочник по командам vibebasket apply, list, search, doctor, init и rollback. Флаги, scope, dry-run, verification и переменные окружения.",
    },
    metadataAdapters: {
      title: "IDE Adapters — 24 Targets — VibeBasket Docs",
      description:
        "Справочник multi-IDE адаптеров для Cursor, Windsurf, VS Code, Claude Code, GitHub Copilot и ещё 19 целей. Конфиг-пути и поддержка MCP/skills/rules.",
    },
    metadataDelimiters: {
      title: "Block Delimiters — VibeBasket Docs",
      description:
        "Как VibeBasket использует comment-block delimiters для идемпотентного merge в shell-скриптах, markdown и YAML.",
    },
    metadataSecurity: {
      title: "Security — Zero-Trust Model — VibeBasket Docs",
      description:
        "Политика zero-secret, rate limiting, security headers, CSP enforcement и локальный prompt для credentials на платформе VibeBasket.",
    },
    metadataSelfHosting: {
      title: "Self-Hosting Guide — VibeBasket Docs",
      description:
        "Развёртывайте VibeBasket в своей инфраструктуре через Docker, ручную установку Node.js или Kubernetes через Helm. Переменные окружения, backup storage и upgrade-процедуры.",
    },
    guideCards: {
      quickStart: {
        title: "Гайд быстрого старта",
        description:
          "Запустите свой первый AI context bundle менее чем за 2 минуты. Откройте каталог, выберите MCP-серверы и skills, сгенерируйте bundle URL и примените его локально через CLI.",
        linkText: "Читать quickstart",
      },
      cli: {
        title: "Справочник CLI",
        description:
          "Полный справочник по команде vibebasket apply: bundle URL, флаг --force, overrides через --scope, режим preview через --dry-run и verification controls.",
        linkText: "Открыть CLI reference",
      },
      adapters: {
        title: "IDE-адаптеры",
        description:
          "Каждая поддерживаемая IDE-цель, её конфиг-пути, матрица поддержки MCP/skills/rules и заметки по реализации адаптеров.",
        linkText: "Открыть адаптеры",
      },
      delimiters: {
        title: "Block delimiters",
        description:
          "Как VibeBasket использует comment-block delimiters для идемпотентного merge в shell-скриптах, markdown и YAML.",
        linkText: "Изучить delimiters",
      },
      security: {
        title: "Безопасность секретов",
        description:
          "Политика zero-secret в облаке, локальный запрос credentials, архитектура rate limiting и усиленные HTTP security headers.",
        linkText: "Изучить security",
      },
      selfHosting: {
        title: "Гайд по self-hosting",
        description:
          "Запускайте VibeBasket в своей инфраструктуре через Docker, обычный Node.js или Kubernetes. Backup storage, OAuth и upgrade-процедуры.",
        linkText: "Развернуть у себя",
      },
    },
    shell: {
      noResults: "Ничего не найдено по запросу",
      tryDifferentKeyword: "Попробуйте другое ключевое слово.",
      searchPlaceholder: "Поиск по документации…",
      searchAriaLabel: "Поиск по документации",
      mobileSectionLabel: "Раздел документации",
      tabs: {
        hub: "Docs",
        gettingStarted: "Быстрый старт",
        cli: "CLI",
        adapters: "Адаптеры",
        delimiters: "Delimiters",
        security: "Security",
        selfHosting: "Self-hosting",
      },
      docsHome: "Docs",
      architecturalHub: "Архитектурный центр",
      technicalSpecs: "Технические спецификации VibeBasket",
      documentationHub: "Центр документации",
      hubDescription:
        "Всё, что нужно для честной настройки, запуска и сопровождения VibeBasket. Начните с Getting Started для самого короткого пути, Self Hosting — для ожиданий по деплою, а Security — когда готовитесь к публичному запуску.",
      githubRepository: "GitHub-репозиторий",
      npmPackage: "npm-пакет",
    },
  },
  admin: {
    badge: "Админ",
    backToCatalog: "Назад к каталогу",
    title: "Операции системы и метрики",
    description:
      "Аналитика в реальном времени, лидерборды пользовательских стеков и состояние центрального реестра.",
    navAriaLabel: "Разделы админки",
    sections: {
      overview: "Обзор",
      readiness: "Готовность",
      catalogOps: "Операции каталога",
      catalogData: "Данные каталога",
      collectors: "Коллекторы",
      syncRuns: "Запуски sync",
      backups: "Backup’ы",
      storage: "Хранилище",
      schedules: "Расписания",
      systemHealth: "Состояние системы",
      users: "Пользователи",
    },
  },
};
