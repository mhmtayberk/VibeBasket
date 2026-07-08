import type { AppDictionary } from "./en";

export const esDictionary: AppDictionary = {
  localeLabel: "Español",
  shared: {
    brand: "VibeBasket",
    navigation: {
      who: "Para quién es",
      how: "Cómo funciona",
      catalog: "Catálogo",
      faq: "FAQ",
      documentation: "Documentación",
      installFlow: "Flujo de instalación",
      buildBasket: "Construye tu cesta",
      login: "Iniciar sesión",
      home: "Inicio",
      back: "Volver",
      backToCatalog: "Volver al catálogo",
      backToBuilder: "Volver al constructor",
      openDocs: "Abrir documentación",
      returnHome: "Volver al inicio",
      selfHostGuide: "Guía de autoalojamiento",
      startBuildingFree: "Empieza gratis",
      viewCatalog: "Ver catálogo",
    },
    auth: {
      signIn: "Iniciar sesión",
      signOut: "Cerrar sesión",
      myStacks: "Mis stacks",
      stacks: "Stacks",
      admin: "Administración",
      signedIn: "Sesión iniciada",
      continueWith: "Continuar con",
      accountSync: "Sincronización de cuenta",
      signInToSaveStacks: "Inicia sesión para guardar tus stacks",
      loginNotConfigured: "El inicio de sesión aún no está configurado.",
      loginNotConfiguredBody:
        "En este entorno no hay ningún proveedor social habilitado. Añade credenciales del proveedor y un AUTH_SECRET para activar el acceso.",
      profileSync: "Sincronización de perfil",
      profileSyncBody: "Los stacks guardados quedan vinculados a tu cuenta.",
      providerChoice: "Elección de proveedor",
      providerChoiceBody: "Solo aparecen los proveedores habilitados en este entorno.",
      safeReturn: "Regreso seguro",
      safeReturnBody: "Después de iniciar sesión vuelves al flujo desde el que empezaste.",
      savedBasketsLead:
        "Mantén tus cestas favoritas vinculadas a tu perfil para volver a abrirlas, compartirlas y reutilizarlas entre sesiones.",
      authenticationRequired: "Autenticación requerida",
      signInToAccessSavedStacks: "Inicia sesión para acceder a tus stacks guardados",
      signInToAccessSavedStacksBody:
        "Los stacks guardados viven en tu perfil, así que esta zona solo está disponible después de autenticarte.",
      savedStacks: "Stacks guardados",
      yourSavedStacks: "Tus stacks guardados",
      yourSavedStacksBody:
        "Reabre las cestas que usas con frecuencia, renómbralas a medida que evoluciona tu flujo de trabajo o elimina configuraciones obsoletas.",
    },
    status: {
      nextStep: "Siguiente paso",
      nextStepBody:
        "Vuelve a una ruta conocida, sigue explorando el catálogo o reabre la documentación.",
      notFoundEyebrow: "404 · Ruta no encontrada",
      notFoundTitle: "Página no encontrada",
      notFoundSummary:
        "Esa ruta ya no está disponible, nunca existió o se escribió mal. Vuelve al catálogo o abre de nuevo la documentación.",
      forbiddenEyebrow: "403 · Acceso restringido",
      forbiddenTitle: "No tienes acceso a esta página",
      forbiddenSummary:
        "Esta zona está reservada para una cuenta autorizada en el entorno actual. Vuelve al catálogo principal o inicia sesión con un perfil de administrador aprobado.",
      openLogin: "Abrir acceso",
    },
    localeSwitcher: {
      label: "Idioma",
    },
  },
  home: {
    metadata: {
      title: "VibeBasket — Paquetes de configuración AI para MCPs, skills y rules",
      description:
        "Agrupa servidores MCP de confianza, skills y rules en una instalación compartible. Elige tu stack, genera un enlace y aplícalo en cada AI IDE y CLI.",
      ogDescription:
        "Comparte un único flujo de instalación para tu stack de desarrollo AI. MCPs, skills y rules de confianza para Cursor, Windsurf, Claude Code y más.",
      twitterDescription:
        "Comparte un único flujo de instalación para MCPs, skills y rules de confianza en todas tus herramientas de AI coding.",
    },
    hero: {
      badge: "Código abierto · 24 objetivos IDE",
      titleMobile: "Agrupa tu configuración de desarrollo AI. Compártela con un solo enlace.",
      titleDesktop: ["Agrupa tu", "configuración AI.", "Compártela con", "un solo enlace."],
      description:
        "Organiza servidores MCP de confianza, skills reutilizables y rules de proyecto. Genera un único comando de instalación que viaje bien entre Cursor, Windsurf, VS Code y el resto de tu stack de AI coding.",
      github: "GitHub",
      npm: "npm",
      livePreview: "Vista previa en vivo",
      previewPrimaryLabel: "contexto del repositorio",
      previewSecondaryLabel: "reglas de código",
      copied: "copiado",
      terminalLines: [
        "> Obteniendo la configuración de la cesta de confianza...",
        "> Escribiendo la configuración MCP para tus objetivos seleccionados...",
        "> Contexto listo en Cursor, Windsurf y VS Code.",
      ],
      trustTitle: "Descubrimiento confiable",
      trustBody: "Registros oficiales y registros curados, deduplicados en un solo catálogo.",
      localSecretsTitle: "Secretos locales",
      localSecretsBody: "Los valores sensibles permanecen en tu máquina durante el apply.",
      safeRerunsTitle: "Reejecuciones seguras",
      safeRerunsBody:
        "Escrituras idempotentes con copias de seguridad para que los cambios sigan siendo reversibles.",
    },
    who: {
      eyebrow: "Para quién es",
      title: "Diseñado para equipos que se mueven rápido.",
      description:
        "Tanto si trabajas solo como si diriges un equipo, VibeBasket elimina la fricción de configurar herramientas de AI coding máquina por máquina.",
      cards: [
        {
          tag: "Desarrollador individual",
          headline: "Un comando, cada editor.",
          body: "Deja de copiar y pegar configuraciones MCP entre Cursor, Windsurf y VS Code. Construye una cesta una vez y aplícala en todas partes con un solo comando npx.",
        },
        {
          tag: "Equipo startup",
          headline: "Onboarding en minutos, no en horas.",
          body: "Comparte una URL de bundle con nuevas incorporaciones. Ejecutan un comando y obtienen exactamente los mismos MCPs, skills y rules que el resto del equipo.",
        },
        {
          tag: "Responsable de plataforma",
          headline: "Curar valores por defecto confiables.",
          body: "Publica servidores MCP verificados y rules de proyecto que tus usuarios puedan instalar sin configuración manual. Controla qué entra en cada entorno sin distribuir archivos de config.",
        },
      ],
    },
    how: {
      eyebrow: "Cómo funciona",
      title: "Tres pasos desde cero hasta configurado.",
      description:
        "Sin archivos de configuración para copiar. Sin buscar ajustes del IDE. Solo navegar, agrupar y aplicar.",
      steps: [
        {
          step: "01",
          title: "Explora componentes de confianza",
          body: "Las entradas del catálogo se extraen de datos curados y fuentes upstream confiables, luego se normalizan y deduplican.",
        },
        {
          step: "02",
          title: "Monta tu cesta",
          body: "Selecciona MCPs, skills y rules directamente desde el constructor. La UI mantiene el estado de la cesta visible y reversible.",
        },
        {
          step: "03",
          title: "Aplica con un solo comando",
          body: "Genera un único comando de instalación y aplica la misma configuración en varios editores sin reconfiguración manual.",
        },
      ],
    },
    command: {
      title: ["Deja de reconfigurar.", "Empieza a programar."],
      terminalLine: "$ npx vibebasket apply <bundle-url>",
      kicker: "Código abierto. Baja fricción. Hecho para equipos que se mueven rápido.",
    },
    faq: {
      eyebrow: "FAQ",
      title: "Las preguntas que suelen aparecer primero.",
      description:
        "Respuestas cortas sobre confianza, instalación y autoalojamiento que la gente suele querer antes de estandarizar un flujo de trabajo alrededor de VibeBasket.",
      entries: [
        {
          question: "¿VibeBasket recibe alguna vez mis claves API de runtime?",
          answer:
            "No. Los manifiestos de bundle no contienen secretos de runtime del usuario final. Cuando un MCP seleccionado necesita credenciales, el CLI resuelve ese valor localmente durante apply y lo escribe en la superficie de configuración de la herramienta de destino en tu máquina.",
        },
        {
          question: "¿Qué ocurre si mi IDE ya tiene MCPs, skills o rules configurados?",
          answer:
            "VibeBasket hace merge en la superficie de configuración soportada por el destino en lugar de asumir que todos los archivos están vacíos. Los bloques existentes permanecen, los gestionados por VibeBasket siguen siendo idempotentes y el estado MCP sin cambios se omite.",
        },
        {
          question: "¿Qué significan Verified, Official y Community?",
          answer:
            "Verified significa que el elemento fue curado por VibeBasket. Official significa que la fuente upstream expuso una señal explícita certificada por el propietario o proveedor. Community es todo lo demás que sigue pasando por la normalización y deduplicación.",
        },
        {
          question: "¿Puedo autoalojar VibeBasket para mi equipo?",
          answer:
            "Sí. La web, el CLI, la sincronización del catálogo, la autenticación, las herramientas de administración y los flujos de copia de seguridad viven en este repositorio. La forma por defecto de autoalojarlo es un VPS, una instancia de la app y una base SQLite con almacenamiento persistente.",
        },
        {
          question: "¿Es seguro volver a ejecutar npx vibebasket apply?",
          answer:
            "Ese es el comportamiento esperado. El CLI tiene en cuenta las copias de seguridad, omite escrituras MCP sin cambios y mantiene el comportamiento específico por destino como idempotente, así que puedes volver a aplicar la misma cesta sin provocar una reescritura destructiva.",
        },
        {
          question: "¿Puedo reutilizar una cesta más adelante después de crearla?",
          answer:
            "Sí. Si inicias sesión, los stacks guardados y el historial de tu cuenta te permiten volver más tarde a la misma configuración. Incluso fuera de ese flujo, una URL de bundle generada puede reutilizarse o compartirse mientras siga disponible en la instancia.",
        },
      ],
    },
    footer: {
      description:
        "Infraestructura de setup impulsada por AI para equipos que quieren contexto reproducible en herramientas modernas de desarrollo.",
      madeWith: "Hecho con",
      by: "por",
      for: "para",
      vibeCoding: "Vibe Coding",
      vibeCoders: "Vibe Coders",
    },
  },
  docs: {
    metadataHub: {
      title: "Documentación de VibeBasket — Infraestructura de setup AI",
      description:
        "Guías del catálogo de VibeBasket, CLI, adaptadores IDE, delimitadores de bloques, modelo de seguridad y despliegue autoalojado.",
    },
    metadataGettingStarted: {
      title: "Primeros pasos — Docs de VibeBasket",
      description:
        "Instala tu primer AI context bundle en menos de 2 minutos. Explora el catálogo, elige MCPs y skills, genera una URL y aplícala con el CLI.",
    },
    metadataCli: {
      title: "Referencia CLI — Docs de VibeBasket",
      description:
        "Referencia completa de vibebasket apply, list, search, doctor, init y rollback. Flags, scopes, dry-run, verificación y variables de entorno.",
    },
    metadataAdapters: {
      title: "Adaptadores IDE — 24 objetivos — Docs de VibeBasket",
      description:
        "Referencia multi-IDE que cubre Cursor, Windsurf, VS Code, Claude Code, GitHub Copilot y 19 más. Rutas de configuración y soporte de MCP/skills/rules por objetivo.",
    },
    metadataDelimiters: {
      title: "Delimitadores de bloque — Docs de VibeBasket",
      description:
        "Cómo VibeBasket usa delimitadores por comentarios para merges idempotentes en scripts shell, markdown y configuraciones YAML.",
    },
    metadataSecurity: {
      title: "Seguridad — Modelo zero-trust — Docs de VibeBasket",
      description:
        "Política zero-secret, rate limiting, cabeceras de seguridad, CSP y solicitud local de credenciales en VibeBasket.",
    },
    metadataSelfHosting: {
      title: "Guía de autoalojamiento — Docs de VibeBasket",
      description:
        "Despliega VibeBasket en tu propia infraestructura con Docker, configuración manual de Node.js o Kubernetes vía Helm. Variables de entorno, copias de seguridad y actualizaciones.",
    },
    guideCards: {
      quickStart: {
        title: "Guía rápida",
        description:
          "Pon en marcha tu primer AI context bundle en menos de 2 minutos. Explora el catálogo, elige servidores MCP y skills, genera una URL y aplícala localmente con el CLI.",
        linkText: "Leer guía rápida",
      },
      cli: {
        title: "Referencia CLI",
        description:
          "Referencia completa del comando vibebasket apply: URLs de bundle, flag --force, overrides --scope, modo --dry-run y controles de verificación.",
        linkText: "Ver referencia CLI",
      },
      adapters: {
        title: "Adaptadores IDE",
        description:
          "Cada objetivo IDE soportado, sus rutas de configuración, matriz de capacidades MCP/skills/rules y notas de implementación.",
        linkText: "Explorar adaptadores",
      },
      delimiters: {
        title: "Delimitadores de bloque",
        description:
          "Cómo usa VibeBasket los delimitadores para merges idempotentes en scripts shell, markdown y YAML.",
        linkText: "Aprender delimitadores",
      },
      security: {
        title: "Seguridad de secretos",
        description:
          "Política zero-secret en la nube, prompting local de credenciales y cabeceras HTTP endurecidas.",
        linkText: "Revisar seguridad",
      },
      selfHosting: {
        title: "Guía de autoalojamiento",
        description:
          "Ejecuta VibeBasket en tu propia infraestructura con Docker, Node.js o Kubernetes. Almacenamiento de copias de seguridad, OAuth y actualizaciones.",
        linkText: "Autoalojar",
      },
    },
    shell: {
      noResults: "No hay resultados para",
      tryDifferentKeyword: "Prueba con otra palabra clave.",
      searchPlaceholder: "Buscar en docs…",
      searchAriaLabel: "Buscar en la documentación",
      mobileSectionLabel: "Sección de documentación",
      tabs: {
        hub: "Docs",
        gettingStarted: "Primeros pasos",
        cli: "CLI",
        adapters: "Adaptadores",
        delimiters: "Delimitadores",
        security: "Seguridad",
        selfHosting: "Autoalojamiento",
      },
      docsHome: "Docs",
      architecturalHub: "Hub arquitectónico",
      technicalSpecs: "Especificaciones técnicas de VibeBasket",
      documentationHub: "Centro de documentación",
      hubDescription:
        "Todo lo que necesitas para configurar, ejecutar y mantener VibeBasket con claridad. Empieza por Primeros pasos, sigue con Autoalojamiento para las expectativas de despliegue y revisa Seguridad cuando prepares un lanzamiento público.",
      githubRepository: "Repositorio GitHub",
      npmPackage: "Paquete npm",
    },
  },
  catalogUi: {
    builderEyebrow: "El constructor",
    builderTitle: "Construye tu stack sin reconfigurarlo todo a mano.",
    builderDescription:
      "Explora componentes confiables, arma tu basket y genera un único comando de instalación para los editores que tu equipo realmente usa.",
    chips: {
      trustedSources: "Fuentes confiables",
      trustAwareDiscovery: "Descubrimiento con contexto de confianza",
      itemsPerPage: "{count} elementos por página",
    },
    tabs: {
      mcps: {
        label: "Servidores MCP",
        eyebrow: "Conectores confiables de runtime",
        empty: "Todavía no hay servidores MCP que coincidan con esta búsqueda.",
      },
      skills: {
        label: "Skills",
        eyebrow: "Capacidades reutilizables para agentes",
        empty: "Todavía no hay skills que coincidan con esta búsqueda.",
      },
      rules: {
        label: "Rules",
        eyebrow: "Convenciones de trabajo portables",
        empty: "Todavía no hay rules que coincidan con esta búsqueda.",
      },
    },
    searchPlaceholder: "Buscar {label}...",
    filters: {
      toggle: "Filtros",
      clear: "Limpiar",
      trust: "Confianza",
      sort: "Orden",
      trustOptions: {
        all: "Toda confianza",
        verified: "Verified",
        official: "Official",
        community: "Community",
      },
      sortOptions: {
        recommended: "Recomendado",
        freshest: "Más reciente",
        name: "A-Z",
      },
    },
    summary: {
      showing: "Mostrando {start}-{end} de {total}",
      page: "Página {page}",
      pageOf: "Página {page} / {totalPages}",
    },
    states: {
      loading: "Cargando catálogo",
      retry: "Reintentar solicitud",
      retryFailed: "El reintento falló",
      emptyHint: "Prueba un término más amplio o cambia a otra categoría del catálogo.",
      performanceHint:
        "Los catálogos grandes siguen siendo rápidos porque solo se carga la página actual y la categoría activa.",
    },
    pagination: {
      previous: "Página anterior",
      next: "Página siguiente",
    },
    itemCard: {
      selected: "Seleccionado",
      details: "Detalles",
      fallbackDescription:
        "Componente confiable del catálogo listo para sumarse a tu setup de AI dev.",
    },
    detail: {
      close: "Cerrar detalles del elemento",
      installCommand: "Comando de instalación",
      source: "Fuente",
      ruleContent: "Contenido de la rule",
      env: "env",
      url: "url",
      requiresSecrets:
        "Requiere secrets: {secrets}. El CLI los solicita localmente. Nunca se envían a servidores.",
      synced: "Sincronizado {date}",
    },
    trust: {
      tiers: {
        verified: "Verified",
        official: "Official",
        community: "Community",
      },
      details: {
        verified:
          "Curado manualmente por el equipo de VibeBasket. Tiene prioridad sobre fuentes upstream.",
        official:
          "Marcado explícitamente como oficial por el propietario del catálogo upstream o el registro, sin heurísticas locales.",
        community: "Descubierto en repositorios comunitarios y directorios públicos de skills.",
      },
      sources: {
        "verified-catalog": "Curado por VibeBasket",
        "official-mcp-registry": "MCP Registry",
        "skills-sh-official": "skills.sh Curado",
        "skills-sh-community": "skills.sh Community",
        community: "Community",
      },
    },
  },
  basketUi: {
    eyebrow: "Tu basket",
    title: "Listo para empaquetar",
    itemsOne: "{count} elemento",
    itemsOther: "{count} elementos",
    closeAria: "Cerrar basket",
    empty: "Selecciona MCPs, skills y rules desde el builder para armar tu setup.",
    typeLabels: {
      mcp: "MCP",
      skill: "Skill",
      rule: "Rule",
      mcps: "MCPs",
      skills: "Skills",
      rules: "Rules",
    },
    removeAria: "Eliminar {name}",
    collapseList: "Contraer lista",
    showMore: "Mostrar {count} más",
    targetIdes: "IDEs objetivo",
    clear: "Limpiar",
    worksToday: "Disponible hoy",
    targetsCount: "{count} objetivos",
    ecosystemWatchlist: "Vigilancia del ecosistema",
    soonCount: "{count} pronto",
    unsupportedTargets: "{targets}: no soporta {capabilities}. Se omitirá durante apply.",
    scopeConflict:
      "Los objetivos seleccionados no comparten un único install scope. Combina objetivos de user-scope o cambia a un conjunto solo de project-scope.",
    signInToSave: "Inicia sesión para guardar stacks reutilizables en tu perfil.",
    bundlePreview: "Vista previa del bundle",
    previewEmpty: "Selecciona elementos para previsualizar tu bundle.",
    previewItems: "{count} elementos: {breakdown}",
    previewItemsOne: "{count} elemento: {breakdown}",
    previewTargets: "{count} objetivos",
    previewTargetsOne: "{count} objetivo",
    previewScope: "scope: {scope}",
    previewAutoSelected: " (seleccionado automáticamente)",
    previewIncompatible: "{targets}: skills/rules omitidos",
    previewBlocked:
      "no hay un scope compartido entre los objetivos seleccionados; la generación del bundle está bloqueada",
    installCommand: "Comando de instalación",
    fetching: "Obteniendo configuración del basket...",
    resolving: "Resolviendo componentes MCP confiables...",
    ready: "Listo para aplicar en tus IDEs seleccionados.",
    generatedCommandWillAppear: "Tu comando generado aparecerá aquí{scopeSuffix}",
    generating: "Generando",
    copyFreshCommand: "Copiar comando nuevo",
    generateInstallCommand: "Generar comando de instalación",
    pickAtLeastOne: "Elige al menos un elemento y un IDE objetivo.",
    sharedScopeRequired:
      "Esos objetivos todavía no comparten un install scope. Elige solo objetivos de user-scope o solo de project-scope juntos.",
    failedToBuild: "No se pudo generar el bundle",
    copiedToClipboard: "Comando de instalación copiado al portapapeles.",
    failedToGenerate: "No se pudo generar el comando del bundle.",
    plannedTarget: "Este objetivo está planificado, pero el motor de apply todavía no lo soporta.",
    basketCleared: "Basket limpiado.",
    open: "Abrir",
  },
  admin: {
    badge: "Administración",
    backToCatalog: "Volver al catálogo",
    title: "Operaciones del sistema y métricas",
    description:
      "Analítica en tiempo real, rankings de stacks guardados y salud del registro central.",
    navAriaLabel: "Secciones de administración",
    sections: {
      overview: "Resumen",
      readiness: "Preparación",
      catalogOps: "Operaciones del catálogo",
      catalogData: "Datos del catálogo",
      collectors: "Recolectores",
      syncRuns: "Ejecuciones de sincronización",
      backups: "Copias de seguridad",
      storage: "Almacenamiento",
      schedules: "Programaciones",
      systemHealth: "Salud del sistema",
      users: "Usuarios",
    },
  },
};
