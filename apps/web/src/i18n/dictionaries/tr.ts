import type { AppDictionary } from "./en";

export const trDictionary: AppDictionary = {
  localeLabel: "Türkçe",
  shared: {
    brand: "VibeBasket",
    navigation: {
      who: "Kimler için",
      how: "Nasıl çalışır",
      catalog: "Katalog",
      faq: "SSS",
      documentation: "Dokümantasyon",
      installFlow: "Kurulum akışı",
      buildBasket: "Sepetini oluştur",
      login: "Giriş",
      home: "Ana sayfa",
      back: "Geri",
      backToCatalog: "Kataloğa dön",
      backToBuilder: "Oluşturucuya dön",
      openDocs: "Dokümanları aç",
      returnHome: "Ana sayfaya dön",
      selfHostGuide: "Kendi sunucunda çalıştırma rehberi",
      startBuildingFree: "Ücretsiz oluşturmaya başla",
      viewCatalog: "MCP Server",
    },
    auth: {
      signIn: "Giriş yap",
      signOut: "Çıkış yap",
      myStacks: "Stack’lerim",
      stacks: "Stack’ler",
      admin: "Yönetici",
      signedIn: "Giriş yapıldı",
      continueWith: "Şununla devam et",
      accountSync: "Hesap senkronu",
      signInToSaveStacks: "Stack’lerini kaydetmek için giriş yap",
      loginNotConfigured: "Giriş henüz yapılandırılmadı.",
      loginNotConfiguredBody:
        "Bu ortamda şu anda etkin bir sosyal giriş sağlayıcısı yok. Girişi açmak için sağlayıcı bilgilerini ve AUTH_SECRET ekleyin.",
      profileSync: "Profil senkronu",
      profileSyncBody: "Kaydedilen stack’ler hesabına bağlı kalır.",
      providerChoice: "Sağlayıcı seçimi",
      providerChoiceBody: "Yalnızca bu ortamda etkin olan sağlayıcılar görünür.",
      safeReturn: "Güvenli dönüş",
      safeReturnBody: "Girişten sonra başladığın akışa geri dönersin.",
      savedBasketsLead:
        "En sevdiğin basket’leri profiline bağlı tut; yeniden aç, paylaş ve oturumlar arasında tekrar kullan.",
      authenticationRequired: "Kimlik doğrulama gerekli",
      signInToAccessSavedStacks: "Kaydedilmiş stack’lere erişmek için giriş yap",
      signInToAccessSavedStacksBody:
        "Kaydedilmiş stack’ler profiline bağlıdır; bu alan yalnızca kimlik doğrulamasından sonra kullanılabilir.",
      savedStacks: "Kaydedilmiş stack’ler",
      yourSavedStacks: "Kaydettiğin stack’ler",
      yourSavedStacksBody:
        "Sık kullandığın sepetleri yeniden aç, iş akışın geliştikçe yeniden adlandır ya da artık işine yaramayan kurulumları kaldır.",
    },
    status: {
      nextStep: "Sonraki adım",
      nextStepBody:
        "Bilinen bir rotaya dön, kataloğu gezmeye devam et ya da dokümanları yeniden aç.",
      notFoundEyebrow: "404 · Rota bulunamadı",
      notFoundTitle: "Sayfa bulunamadı",
      notFoundSummary:
        "Bu rota artık mevcut değil, hiç olmadı ya da yanlış yazıldı. Kataloğa geri dön veya dokümanları yeniden aç.",
      forbiddenEyebrow: "403 · Erişim kısıtlı",
      forbiddenTitle: "Bu sayfaya erişimin yok",
      forbiddenSummary:
        "Bu alan mevcut ortamda yetkili bir hesap için ayrılmıştır. Ana kataloğa dön ya da onaylı bir yönetici profiliyle giriş yap.",
      openLogin: "Girişi aç",
    },
    localeSwitcher: {
      label: "Dil",
    },
  },
  home: {
    metadata: {
      title: "VibeBasket — MCP, Skill ve Rule’lar için AI kurulum paketleri",
      description:
        "Güvenilir MCP server’larını, skill’leri ve rule’ları tek paylaşılabilir kurulum akışında birleştir. Stack’ini seç, bağlantı üret, her AI IDE ve CLI’da uygula.",
      ogDescription:
        "AI geliştirme stack’in için tek bir kurulum akışı paylaş. Cursor, Windsurf, Claude Code ve daha fazlası için güvenilir MCP’ler, skill’ler ve rule’lar.",
      twitterDescription:
        "Güvenilir MCP’ler, skill’ler ve rule’lar için tek bir kurulum akışını tüm AI kodlama araçlarında paylaş.",
    },
    hero: {
      badge: "Açık kaynak · 24 IDE hedefi",
      titleMobile: "AI geliştirme kurulumunu paketle. Tek bir bağlantıyla paylaş.",
      titleDesktop: ["AI geliştirme", "kurulumunu paketle.", "Tek bir", "bağlantıyla paylaş."],
      description:
        "Güvenilir MCP server’larını, yeniden kullanılabilir skill’leri ve proje rule’larını düzenle. Cursor, Windsurf, VS Code ve geri kalan AI kodlama stack’inde temiz çalışan tek bir kurulum komutu üret.",
      github: "GitHub",
      npm: "npm",
      livePreview: "Canlı önizleme",
      previewPrimaryLabel: "depo bağlamı",
      previewSecondaryLabel: "kodlama kuralları",
      copied: "kopyalandı",
      terminalLines: [
        "> Güvenilir basket yapılandırması alınıyor...",
        "> Seçtiğin hedefler için MCP yapılandırması yazılıyor...",
        "> Bağlam Cursor, Windsurf ve VS Code içinde hazır.",
      ],
      trustTitle: "Güvenilir keşif",
      trustBody: "Resmi kayıtlar ve küratörlü öğeler tek katalogda birleştirilir.",
      localSecretsTitle: "Yerel gizli bilgiler",
      localSecretsBody: "Hassas değerler apply sırasında senin makinen üzerinde kalır.",
      safeRerunsTitle: "Güvenli tekrar çalıştırma",
      safeRerunsBody:
        "Yedekli ve idempotent yazımlar sayesinde kurulum değişiklikleri geri alınabilir kalır.",
    },
    who: {
      eyebrow: "Kimler için",
      title: "Hızlı hareket eden ekipler için tasarlandı.",
      description:
        "İster tek başına çalış ister bir ekibi yönet, VibeBasket AI kodlama araçlarını makine makine kurma sürtünmesini ortadan kaldırır.",
      cards: [
        {
          tag: "Tekil geliştirici",
          headline: "Her editör için tek komut.",
          body: "Cursor, Windsurf ve VS Code arasında MCP yapılandırmalarını kopyalayıp yapıştırmayı bırak. Bir kez bundle oluştur ve tek bir npx komutuyla her yerde uygula.",
        },
        {
          tag: "Startup ekibi",
          headline: "Saatler değil, dakikalar içinde onboard.",
          body: "Yeni ekibe bir bundle URL paylaş. Tek komut çalıştırıp takımın geri kalanıyla aynı MCP, skill ve rule setine ulaşsınlar; manuel kurulum gerekmesin.",
        },
        {
          tag: "Platform sahibi",
          headline: "Güvenilir varsayılanları kürate et.",
          body: "Kullanıcılarının sıfır konfigürasyonla kurabileceği doğrulanmış MCP server’ları ve proje rule’ları yayınla. Yapılandırma dosyası dağıtmadan her ortama ne gireceğini kontrol et.",
        },
      ],
    },
    how: {
      eyebrow: "Nasıl çalışır",
      title: "Sıfırdan yapılandırılmış hale üç adım.",
      description:
        "Kopyalanacak config dosyası yok. IDE ayarı aramak yok. Sadece gez, bundle oluştur ve uygula.",
      steps: [
        {
          step: "01",
          title: "Güvenilir bileşenleri gez",
          body: "Katalog girdileri küratörlü verilerden ve güvenilir upstream kaynaklardan çekilir, sonra normalize edilip deduplikasyondan geçirilir.",
        },
        {
          step: "02",
          title: "Sepetini oluştur",
          body: "MCP’leri, skill’leri ve rule’ları doğrudan builder içinden seç. Arayüz basket durumunu görünür ve geri alınabilir tutar.",
        },
        {
          step: "03",
          title: "Tek komutla uygula",
          body: "Tek bir kurulum komutu üret ve aynı setup’ı manuel yeniden yapılandırma olmadan birden çok editöre uygula.",
        },
      ],
    },
    command: {
      title: ["Yeniden yapılandırmayı bırak.", "Koda başla."],
      terminalLine: "$ npx vibebasket apply <bundle-url>",
      kicker: "Açık kaynak. Düşük tören. Hızlı hareket eden ekipler için üretildi.",
    },
    faq: {
      eyebrow: "SSS",
      title: "İlk gelen soruların kısa cevapları.",
      description:
        "İnsanların VibeBasket etrafında iş akışı standartlaştırmadan önce genelde istediği güven, kurulum ve kendi sunucunda çalıştırma detaylarına kısa cevaplar.",
      entries: [
        {
          question: "VibeBasket çalışma zamanı API anahtarlarımı hiç alıyor mu?",
          answer:
            "Hayır. Bundle manifest’leri son kullanıcı çalışma zamanı gizli bilgilerini taşımaz. Seçilen bir MCP kimlik bilgisi gerektirdiğinde CLI bu değeri apply sırasında yerelde çözer ve makinenizde hedef aracın kendi yapılandırma yüzeyine yazar.",
        },
        {
          question: "IDE’mde zaten MCP, skill veya rule yapılandırmaları varsa ne olur?",
          answer:
            "VibeBasket her dosyanın boş olduğunu varsaymak yerine hedefin desteklediği config yüzeyine merge eder. Mevcut bloklar yerinde kalır, VibeBasket tarafından yönetilen bloklar idempotent kalır ve değişmeyen MCP durumu tekrar apply sırasında yeniden yazılmaz.",
        },
        {
          question: "Verified, Official ve Community ne anlama geliyor?",
          answer:
            "Verified, öğenin VibeBasket tarafından kürate edildiği anlamına gelir. Official, upstream kaynağın açık bir sahip veya üretici tarafından doğrulanmış sinyal sunduğu anlamına gelir. Community ise katalog normalizasyonu ve deduplikasyon hattını geçen diğer tüm öğelerdir.",
        },
        {
          question: "VibeBasket’i ekibim için kendi sunucumda çalıştırabilir miyim?",
          answer:
            "Evet. Web uygulaması, CLI, katalog senkronu, kimlik doğrulama, yönetici araçları ve yedekleme akışları bu repoda bulunur. Varsayılan kurulum şekli tek VPS, tek uygulama örneği ve kalıcı depolama kullanan tek bir SQLite veritabanıdır.",
        },
        {
          question: "npx vibebasket apply komutunu tekrar çalıştırmak güvenli mi?",
          answer:
            "Varsayılan beklenti budur. CLI yedekleme farkındalığına sahiptir, değişiklik yapmayan MCP yazımlarını atlar ve hedefe özgü kurulum davranışını idempotent tutar; böylece aynı basket tekrar uygulandığında yıkıcı bir yeniden yazım gerçekleşmez.",
        },
        {
          question: "Bir bundle oluşturduktan sonra daha sonra tekrar kullanabilir miyim?",
          answer:
            "Evet. Giriş yaparsan kaydedilmiş stack’ler ve hesap seviyesindeki basket geçmişin aynı kuruluma daha sonra geri dönmeni sağlar. Bunun dışında üretilen bundle URL’i bundle erişilebilir kaldığı sürece yeniden kullanılabilir veya paylaşılabilir.",
        },
      ],
    },
    footer: {
      description:
        "Modern kodlama araçlarında tekrar üretilebilir bağlam isteyen ekipler için AI destekli setup altyapısı.",
      madeWith: "Sevgiyle üretildi",
      by: "tarafından",
      for: "için",
      vibeCoding: "Vibe Coding",
      vibeCoders: "Vibe Coders",
    },
  },
  catalogUi: {
    builderEyebrow: "Oluşturucu",
    builderTitle: "Her şeyi elle yeniden yapılandırmadan stack’ini oluştur.",
    builderDescription:
      "Güvenilir bileşenleri keşfet, sepetini oluştur ve ekibinin gerçekten kullandığı editörler için tek bir kurulum komutu üret.",
    chips: {
      trustedSources: "Güvenilir kaynaklar",
      trustAwareDiscovery: "Güven odaklı keşif",
      itemsPerPage: "Sayfa başına {count} öğe",
    },
    tabs: {
      mcps: {
        label: "MCP Sunucuları",
        eyebrow: "Güvenilir çalışma zamanı bağlayıcıları",
        empty: "Bu aramaya uyan bir MCP sunucusu henüz yok.",
      },
      skills: {
        label: "Skill’ler",
        eyebrow: "Yeniden kullanılabilir ajan yetenekleri",
        empty: "Bu aramaya uyan bir skill henüz yok.",
      },
      rules: {
        label: "Rule’lar",
        eyebrow: "Taşınabilir çalışma kuralları",
        empty: "Bu aramaya uyan bir rule henüz yok.",
      },
    },
    searchPlaceholder: "{label} ara...",
    filters: {
      toggle: "Filtreler",
      clear: "Temizle",
      trust: "Güven",
      sort: "Sıralama",
      trustOptions: {
        all: "Tüm güven seviyeleri",
        verified: "Verified",
        official: "Official",
        community: "Community",
      },
      sortOptions: {
        recommended: "Önerilen",
        freshest: "En güncel",
        name: "A-Z",
      },
    },
    summary: {
      showing: "{total} öğeden {start}-{end} arası gösteriliyor",
      page: "Sayfa {page}",
      pageOf: "Sayfa {page} / {totalPages}",
    },
    states: {
      loading: "Katalog yükleniyor",
      retry: "İsteği yeniden dene",
      retryFailed: "Yeniden deneme başarısız oldu",
      emptyHint: "Daha geniş bir arama terimi deneyin veya başka bir katalog kategorisine geçin.",
      performanceHint:
        "Büyük kataloglar yalnızca mevcut sayfa ve aktif kategori yüklenerek hızlı kalır.",
    },
    pagination: {
      previous: "Önceki sayfa",
      next: "Sonraki sayfa",
    },
    itemCard: {
      selected: "Seçildi",
      details: "Detaylar",
      fallbackDescription: "AI geliştirme kurulumuna eklemeye hazır güvenilir katalog bileşeni.",
    },
    detail: {
      close: "Öğe detaylarını kapat",
      installCommand: "Kurulum Komutu",
      source: "Kaynak",
      ruleContent: "Rule İçeriği",
      env: "env",
      url: "url",
      requiresSecrets:
        "Gerekli secret’lar: {secrets}. CLI bunları yerelde sorar. Sunuculara gönderilmez.",
      synced: "Senkronize edildi: {date}",
    },
    trust: {
      tiers: {
        verified: "Verified",
        official: "Official",
        community: "Community",
      },
      details: {
        verified:
          "VibeBasket ekibi tarafından elle kürate edildi. Upstream kaynakların önüne geçer.",
        official:
          "Yerel sezgisel kurallar olmadan, upstream katalog sahibi veya kayıt tarafından açıkça resmi olarak işaretlendi.",
        community: "Topluluk depoları ve herkese açık skill dizinlerinden keşfedildi.",
      },
      sources: {
        "verified-catalog": "VibeBasket tarafından kürate edildi",
        "official-mcp-registry": "MCP Registry",
        "skills-sh-official": "skills.sh Küratörlü",
        "skills-sh-community": "skills.sh Community",
        community: "Community",
      },
    },
  },
  basketUi: {
    eyebrow: "Sepetin",
    title: "Paketlemeye hazır",
    itemsOne: "{count} öğe",
    itemsOther: "{count} öğe",
    closeAria: "Sepeti kapat",
    empty: "Kurulumunu oluşturmak için builder’dan MCP, skill ve rule seç.",
    typeLabels: {
      mcp: "MCP",
      skill: "Skill",
      rule: "Rule",
      mcps: "MCP’ler",
      skills: "Skill’ler",
      rules: "Rule’lar",
    },
    removeAria: "{name} öğesini kaldır",
    collapseList: "Listeyi daralt",
    showMore: "{count} tane daha göster",
    targetIdes: "Hedef IDE’ler",
    clear: "Temizle",
    worksToday: "Bugün çalışanlar",
    targetsCount: "{count} hedef",
    ecosystemWatchlist: "Ekosistem izleme listesi",
    soonCount: "{count} yakında",
    unsupportedTargets: "{targets}: {capabilities} desteği yok. Apply sırasında bunlar atlanacak.",
    scopeConflict:
      "Seçili hedefler ortak bir kurulum scope’u paylaşmıyor. User-scope hedefleri birlikte seçin ya da yalnızca project-scope hedeflerden oluşan bir sete geçin.",
    signInToSave: "Yeniden kullanılabilir stack’leri profiline kaydetmek için giriş yap.",
    bundlePreview: "Bundle Önizlemesi",
    previewEmpty: "Bundle önizlemesini görmek için öğe seç.",
    previewItems: "{count} öğe: {breakdown}",
    previewItemsOne: "{count} öğe: {breakdown}",
    previewTargets: "{count} hedef",
    previewTargetsOne: "{count} hedef",
    previewScope: "scope: {scope}",
    previewAutoSelected: " (otomatik seçildi)",
    previewIncompatible: "{targets}: skill/rule atlandı",
    previewBlocked: "seçili hedefler arasında ortak scope yok; bundle üretimi engellendi",
    installCommand: "Kurulum Komutu",
    fetching: "Basket yapılandırması alınıyor...",
    resolving: "Güvenilir MCP bileşenleri çözümleniyor...",
    ready: "Seçtiğin IDE’lerde apply etmeye hazır.",
    generatedCommandWillAppear: "Üretilen komutun burada görünecek{scopeSuffix}",
    generating: "Üretiliyor",
    copyFreshCommand: "Yeni Komutu Kopyala",
    generateInstallCommand: "Kurulum Komutu Üret",
    pickAtLeastOne: "En az bir öğe ve bir hedef IDE seç.",
    sharedScopeRequired:
      "Bu hedefler henüz ortak bir kurulum scope’u paylaşmıyor. Sadece user-scope veya sadece project-scope hedefleri birlikte seçin.",
    failedToBuild: "Bundle oluşturulamadı",
    copiedToClipboard: "Kurulum komutu panoya kopyalandı.",
    failedToGenerate: "Bundle komutu üretilemedi.",
    plannedTarget:
      "Bu hedef planlanmış durumda, ancak apply engine tarafından henüz desteklenmiyor.",
    basketCleared: "Sepet temizlendi.",
    open: "Aç",
  },
  docs: {
    metadataHub: {
      title: "VibeBasket Dokümantasyonu — AI geliştirme setup altyapısı",
      description:
        "VibeBasket katalog yapısı, CLI, IDE adaptörleri, blok ayraçları, güvenlik modeli ve kendi sunucunda çalıştırma rehberleri.",
    },
    metadataGettingStarted: {
      title: "Başlangıç — VibeBasket Dokümanları",
      description:
        "İlk AI context bundle’ını 2 dakikanın altında kur. Kataloğu gez, MCP ve skill seç, bundle URL oluştur ve CLI ile uygula.",
    },
    metadataCli: {
      title: "CLI Referansı — VibeBasket Dokümanları",
      description:
        "vibebasket apply, list, search, doctor, init ve rollback komutları için tam referans. Flag’ler, scope’lar, dry-run, doğrulama ve environment değişkenleri.",
    },
    metadataMcp: {
      title: "Yerel MCP — VibeBasket Dokümanları",
      description:
        "Yerel VibeBasket MCP sunucusunun nasıl çalıştığı: stdio taşıması, hedef rehberliği, katalog arama, kurulum planlama, apply, rollback ve mevcut phase-1 sınırları.",
    },
    metadataAdapters: {
      title: "IDE Adaptörleri — 24 Hedef — VibeBasket Dokümanları",
      description:
        "Cursor, Windsurf, VS Code, Claude Code, GitHub Copilot ve 19 fazlasını kapsayan çoklu IDE adaptör referansı. Config yolları ve MCP/skill/rule destek matrisi.",
    },
    metadataDelimiters: {
      title: "Blok Delimiter’ları — VibeBasket Dokümanları",
      description:
        "VibeBasket’in shell script, markdown ve YAML yapılandırma dosyalarında idempotent dosya birleştirmesi için blok ayraçlarını nasıl kullandığı.",
    },
    metadataSecurity: {
      title: "Güvenlik — Zero-Trust Modeli — VibeBasket Dokümanları",
      description:
        "VibeBasket platformu için zero-secret politikası, hız sınırlama, güvenlik başlıkları, CSP zorlaması ve yerel kimlik bilgisi isteme akışı.",
    },
    metadataSelfHosting: {
      title: "Kendi Sunucunda Çalıştırma Rehberi — VibeBasket Dokümanları",
      description:
        "VibeBasket’i Docker, manuel Node.js kurulumu veya Helm ile kendi altyapında yayınla. Ortam değişkenleri, yedek depolama ve güncelleme prosedürleri.",
    },
    guideCards: {
      quickStart: {
        title: "Hızlı Başlangıç",
        description:
          "İlk AI context bundle’ını 2 dakikanın altında ayağa kaldır. Kataloğu gez, MCP server’ları ve skill’leri seç, bundle URL üret ve CLI ile yerelde uygula.",
        linkText: "Hızlı başlangıcı oku",
      },
      cli: {
        title: "CLI Referansı",
        description:
          "vibebasket apply komutu için tam referans: bundle URL’leri, --force, --scope, --dry-run ve doğrulama kontrolleri.",
        linkText: "CLI referansını aç",
      },
      mcp: {
        title: "Yerel MCP",
        description:
          "VibeBasket’i AI IDE’ler içinde yerel stdio MCP sunucusu olarak bağla; hedef rehberliği, katalog arama, kurulum planlama ve apply araçlarını konuşmadan çıkmadan kullan.",
        linkText: "MCP rehberini aç",
      },
      adapters: {
        title: "IDE Adaptörleri",
        description:
          "Desteklenen her IDE hedefi, config yolu, MCP/skill/rule yetenek matrisi ve adaptör notları.",
        linkText: "Adaptörleri incele",
      },
      delimiters: {
        title: "Blok Delimiter’ları",
        description:
          "VibeBasket’in shell script, markdown ve YAML üzerinde idempotent dosya birleştirmesi için blok ayraçlarını nasıl kullandığı.",
        linkText: "Delimiter’ları öğren",
      },
      security: {
        title: "Gizli Bilgi Güvenliği",
        description:
          "Zero-secret bulut politikası, yerel kimlik bilgisi isteme mimarisi ve sertleştirilmiş HTTP güvenlik başlıkları.",
        linkText: "Güvenliği gözden geçir",
      },
      selfHosting: {
        title: "Kendi Sunucunda Çalıştırma Rehberi",
        description:
          "VibeBasket’i Docker, plain Node.js veya Kubernetes ile kendi altyapında çalıştır. Yedek depolama, OAuth ve güncelleme prosedürleri.",
        linkText: "Rehberi aç",
      },
    },
    shell: {
      noResults: "Şu sorgu için sonuç yok:",
      tryDifferentKeyword: "Farklı bir anahtar kelime dene.",
      searchPlaceholder: "Dokümanlarda ara…",
      searchAriaLabel: "Dokümantasyonda ara",
      mobileSectionLabel: "Dokümantasyon bölümü",
      tabs: {
        hub: "Dokümanlar",
        gettingStarted: "Başlangıç",
        cli: "CLI",
        mcp: "MCP",
        adapters: "Adaptörler",
        delimiters: "Delimiter’lar",
        security: "Güvenlik",
        selfHosting: "Kendi sunucunda çalıştırma",
      },
      docsHome: "Dokümanlar",
      architecturalHub: "Mimari Merkez",
      technicalSpecs: "VibeBasket Teknik Spesifikasyonları",
      documentationHub: "Dokümantasyon Merkezi",
      hubDescription:
        "VibeBasket’i açık ve net biçimde yapılandırmak, çalıştırmak ve sürdürmek için ihtiyaç duyduğun her şey. En kısa yol için Başlangıç, yayınlama beklentileri için Kendi Sunucunda Çalıştırma ve halka açık lansman öncesi Güvenlik ile başla.",
      githubRepository: "GitHub Reposu",
      npmPackage: "npm Paketi",
    },
  },
  admin: {
    badge: "Yönetici",
    backToCatalog: "Kataloğa dön",
    title: "Sistem Operasyonları ve Metrikler",
    description:
      "Gerçek zamanlı analizler, kaydedilmiş stack liderlik tabloları ve merkezi registry sağlığı.",
    navAriaLabel: "Yönetici bölümleri",
    sections: {
      overview: "Genel Bakış",
      readiness: "Hazırlık",
      catalogOps: "Katalog Operasyonları",
      catalogData: "Katalog Verisi",
      collectors: "Toplayıcılar",
      syncRuns: "Senkronizasyon çalışmaları",
      backups: "Yedekler",
      storage: "Depolama",
      schedules: "Zamanlamalar",
      systemHealth: "Sistem Sağlığı",
      users: "Kullanıcılar",
    },
  },
};
