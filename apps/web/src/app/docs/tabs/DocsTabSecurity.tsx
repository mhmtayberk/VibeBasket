import type { AppLocale } from "@/i18n/config";
import { localizePath } from "@/i18n/locale-routing";
import { KeyRound, ShieldAlert } from "lucide-react";
import Link from "next/link";

const SECURITY_COPY = {
  en: {
    title: "Secrets Security",
    intro:
      "Strict secure coding rules, zero-trust cloud storage models, and local secret shielding mechanisms.",
    policy: "Zero-Secret Policy",
    cloud: "Zero-Trust Cloud Policy",
    rateLimiting: "Rate Limiting",
    securityHeaders: "Security Headers",
    adminPanelSecurity: "Admin Panel Security",
    policyLead:
      "Security is a primary directive for VibeBasket. Sensitive keys such as OpenAI or GitHub API tokens used by installed MCP servers never transit to or get cached inside the bundle database.",
    cloudBody:
      "Bundle manifests never contain end-user runtime secrets. The hosted app stores selected catalog metadata and optional encrypted admin backup-storage credentials, but not the API keys that installed MCPs or agent tools use at runtime.",
    localPromptBody:
      "Instead, when applying a bundle locally, the CLI parses target credential keys and safely prompts the operator inside the local terminal to inject them securely. The hosted app never sees those runtime values.",
    adapterSecretBody:
      "Secret handling then depends on the target adapter. Most IDEs require inline MCP env or header values in local config files, so the CLI resolves those secrets on the operator's machine and writes them only into that machine's local IDE config. Codex is a partial exception for remote MCP auth headers: when its native config format supports an environment-key reference, VibeBasket prefers that reference instead of serializing the raw token into TOML.",
    rateLimitingBody:
      "All public API endpoints are protected by a sliding-window rate limiter with per-IP tracking and automatic garbage collection. Proxy-derived IP headers are only trusted when self-hosters explicitly enable proxy trust.",
    rateLimitsAria: "API rate limiting endpoints",
    rateLimitsCaption: "API endpoint rate limits",
    endpointHeader: "Endpoint",
    limitHeader: "Limit",
    securityHeadersBody:
      "All responses include hardened headers. In production, HTML routes receive a nonce-based Content-Security-Policy so Next.js can hydrate safely without opening the door to blanket inline-script execution, and HSTS is enforced across the deployment.",
    headersAria: "HTTP security headers",
    headersCaption: "Security response headers",
    headerHeader: "Header",
    valueHeader: "Value",
    adminLead:
      "The admin dashboard at /admin is gated behind OAuth-authenticated sessions. Access is restricted to email addresses listed in the ADMIN_OAUTH_EMAILS environment variable, and only verified allowlisted emails are promoted to admin.",
    adminAria: "Admin panel security features",
    adminCaption: "Admin panel security controls",
    featureHeader: "Feature",
    descriptionHeader: "Description",
    adminRows: [
      ["Catalog Sync", "Manually trigger registry synchronization from upstream sources."],
      [
        "Backup Mgmt",
        "Create, list, download, and restore database backups to any configured storage backend.",
      ],
      [
        "FTS5 Index Health",
        "Verify the full-text search index row count against the catalog table for integrity.",
      ],
      ["DB Health Check", "Run database integrity diagnostics and detect corruption early."],
      [
        "Force Cleanup",
        "Purge expired bundles, stale sessions, verification tokens, and old sync records, then vacuum.",
      ],
      [
        "User Overview",
        "Inspect registered user counts, saved stack telemetry, and popularity leaderboards.",
      ],
      [
        "Admin Emails",
        "Configure the comma-separated admin email allowlist persisted as site config.",
      ],
    ],
    adminFooter:
      "All admin actions are server-side only and require a verified administrator session. Rate limiting on the /api/admin/stats endpoint is 30 requests per minute.",
  },
  tr: {
    title: "Gizli Bilgi Güvenliği",
    intro:
      "Sıkı güvenli kodlama kuralları, zero-trust bulut depolama modeli ve yerel gizli bilgi koruma mekanizmaları.",
    policy: "Zero-Secret Politikası",
    cloud: "Zero-Trust Bulut Politikası",
    rateLimiting: "Hız Sınırlama",
    securityHeaders: "Güvenlik Başlıkları",
    adminPanelSecurity: "Admin Panel Güvenliği",
    policyLead:
      "Güvenlik, VibeBasket için temel önceliklerden biridir. Kurulan MCP sunucularının kullandığı OpenAI veya GitHub API token’ları gibi hassas anahtarlar bundle veritabanına asla taşınmaz ve burada önbelleğe alınmaz.",
    cloudBody:
      "Bundle manifest’leri son kullanıcı çalışma zamanı gizli bilgilerini içermez. Host edilen uygulama seçilen katalog metadatasını ve isteğe bağlı olarak şifrelenmiş yönetici yedekleme kimlik bilgilerini saklayabilir; ancak kurulan MCP’lerin veya ajan araçlarının çalışma anında kullandığı API anahtarlarını saklamaz.",
    localPromptBody:
      "Bunun yerine bir bundle yerelde uygulanırken CLI, hedefin ihtiyaç duyduğu credential anahtarlarını çözer ve bunları güvenli şekilde eklemek için kullanıcıya yerel terminalde istemde bulunur. Host edilen uygulama bu çalışma zamanı değerlerini hiç görmez.",
    adapterSecretBody:
      "Sonraki secret yönetimi hedef adaptöre göre değişir. Çoğu IDE, yerel config dosyalarında satır içi MCP env veya header değerleri ister; bu nedenle CLI secret’ları operatörün makinesinde çözüp yalnızca o makinenin yerel IDE config’ine yazar. Codex, uzak MCP auth header’ları için kısmi bir istisnadır: doğal config formatı environment-key referansını desteklediğinde VibeBasket ham token’ı TOML içine yazmak yerine bu referansı tercih eder.",
    rateLimitingBody:
      "Tüm açık API endpoint’leri, IP bazlı izleme ve otomatik temizlik içeren sliding-window hız sınırlayıcıyla korunur. Proxy kaynaklı IP başlıklarına yalnızca self-host eden kişi proxy güvenini açıkça etkinleştirirse güvenilir.",
    rateLimitsAria: "API hız sınırı endpoint’leri",
    rateLimitsCaption: "API endpoint hız sınırları",
    endpointHeader: "Endpoint",
    limitHeader: "Limit",
    securityHeadersBody:
      "Tüm yanıtlar sertleştirilmiş güvenlik başlıkları içerir. Production ortamında HTML rotaları nonce tabanlı bir Content-Security-Policy alır; böylece Next.js güvenli biçimde hydrate olurken toplu inline script çalıştırmaya kapı açılmaz. Ayrıca HSTS tüm deployment boyunca etkin tutulur.",
    headersAria: "HTTP güvenlik başlıkları",
    headersCaption: "Güvenlik yanıt başlıkları",
    headerHeader: "Başlık",
    valueHeader: "Değer",
    adminLead:
      " /admin adresindeki yönetim paneli, OAuth ile doğrulanmış oturumların arkasında korunur. Erişim, ADMIN_OAUTH_EMAILS ortam değişkeninde listelenen e-posta adresleriyle sınırlandırılır; yalnızca doğrulanmış ve allowlist’te bulunan hesaplar yönetici olur.",
    adminAria: "Admin panel güvenlik özellikleri",
    adminCaption: "Admin panel güvenlik kontrolleri",
    featureHeader: "Özellik",
    descriptionHeader: "Açıklama",
    adminRows: [
      ["Katalog Senkronu", "Upstream kaynaklardan registry senkronizasyonunu manuel tetikler."],
      [
        "Yedek Yönetimi",
        "Herhangi bir yapılandırılmış depolama altyapısına veritabanı yedekleri oluşturur, listeler, indirir ve geri yükler.",
      ],
      [
        "FTS5 İndeks Sağlığı",
        "Bütünlüğü doğrulamak için full-text arama indeks satır sayısını katalog tablosuyla karşılaştırır.",
      ],
      [
        "Veritabanı Sağlık Kontrolü",
        "Veritabanı bütünlük tanılarını çalıştırır ve bozulmayı erken yakalar.",
      ],
      [
        "Zorla Temizlik",
        "Süresi dolmuş bundle’ları, eski session’ları, verification token’larını ve sync kayıtlarını temizler, ardından vacuum çalıştırır.",
      ],
      [
        "Kullanıcı Özeti",
        "Kayıtlı kullanıcı sayılarını, kaydedilmiş stack telemetrisini ve popülerlik sıralamalarını inceler.",
      ],
      [
        "Yönetici E-postaları",
        "Virgülle ayrılmış yönetici e-posta allowlist’ini site config içinde saklar.",
      ],
    ],
    adminFooter:
      "Tüm yönetici işlemleri yalnızca server-side çalışır ve doğrulanmış bir yönetici oturumu gerektirir. /api/admin/stats endpoint’i için hız sınırı dakikada 30 istektir.",
  },
  es: {
    title: "Seguridad de secretos",
    intro:
      "Reglas estrictas de secure coding, modelos zero-trust para almacenamiento en la nube y mecanismos locales de protección de secretos.",
    policy: "Política zero-secret",
    cloud: "Política zero-trust en la nube",
    rateLimiting: "Limitación de tasa",
    securityHeaders: "Cabeceras de seguridad",
    adminPanelSecurity: "Seguridad del panel de administración",
    policyLead:
      "La seguridad es una directriz principal de VibeBasket. Las claves sensibles, como los tokens de OpenAI o GitHub API usados por los MCP instalados, nunca transitan ni se almacenan en caché dentro de la base de datos de bundles.",
    cloudBody:
      "Los manifiestos de bundle nunca contienen secretos de runtime del usuario final. La app alojada guarda metadatos del catálogo seleccionado y, opcionalmente, credenciales cifradas del almacenamiento de backups para administración, pero no las claves API que los MCP o herramientas agent usan en runtime.",
    localPromptBody:
      "En su lugar, al aplicar un bundle en local, el CLI analiza las claves de credenciales del destino y pide al operador, dentro del terminal local, que las inyecte de forma segura. La app alojada nunca ve esos valores de runtime.",
    adapterSecretBody:
      "A partir de ahí, la gestión de secretos depende del adaptador de destino. La mayoría de IDEs exige valores MCP inline en env o headers dentro de archivos locales de configuración, así que el CLI resuelve esos secretos en la máquina del operador y los escribe solo en la configuración local de ese IDE. Codex es una excepción parcial para los headers de auth de MCP remotos: cuando su formato nativo soporta una referencia a una clave de entorno, VibeBasket prefiere esa referencia en lugar de serializar el token en TOML.",
    rateLimitingBody:
      "Todos los endpoints públicos de la API están protegidos por un rate limiter de ventana deslizante con seguimiento por IP y recolección automática. Las cabeceras IP derivadas de proxy solo se consideran fiables cuando quien autoaloja habilita explícitamente la confianza en proxy.",
    rateLimitsAria: "Endpoints de limitación de tasa de la API",
    rateLimitsCaption: "Límites de tasa de endpoints de la API",
    endpointHeader: "Endpoint",
    limitHeader: "Límite",
    securityHeadersBody:
      "Todas las respuestas incluyen cabeceras endurecidas. En producción, las rutas HTML reciben una Content-Security-Policy basada en nonce para que Next.js pueda hidratar con seguridad sin abrir la puerta a la ejecución masiva de scripts inline, y HSTS se aplica en todo el despliegue.",
    headersAria: "Cabeceras HTTP de seguridad",
    headersCaption: "Cabeceras de respuesta de seguridad",
    headerHeader: "Cabecera",
    valueHeader: "Valor",
    adminLead:
      "El panel de administración en /admin está protegido por sesiones autenticadas con OAuth. El acceso se restringe a direcciones de correo listadas en la variable de entorno ADMIN_OAUTH_EMAILS, y solo las cuentas verificadas incluidas en la allowlist reciben rol de admin.",
    adminAria: "Funciones de seguridad del panel admin",
    adminCaption: "Controles de seguridad del panel admin",
    featureHeader: "Función",
    descriptionHeader: "Descripción",
    adminRows: [
      [
        "Sync del catálogo",
        "Lanza manualmente la sincronización del registry desde fuentes upstream.",
      ],
      [
        "Gestión de backups",
        "Crea, lista, descarga y restaura backups de la base de datos en cualquier backend de almacenamiento configurado.",
      ],
      [
        "Salud del índice FTS5",
        "Verifica el recuento del índice de búsqueda full-text frente a la tabla del catálogo para asegurar integridad.",
      ],
      [
        "Chequeo de BD",
        "Ejecuta diagnósticos de integridad de la base de datos y detecta corrupción de forma temprana.",
      ],
      [
        "Limpieza forzada",
        "Elimina bundles caducados, sesiones obsoletas, tokens de verificación y registros antiguos de sync, y después ejecuta vacuum.",
      ],
      [
        "Resumen de usuarios",
        "Inspecciona los recuentos de usuarios registrados, la telemetría de stacks guardados y los rankings de popularidad.",
      ],
      ["Correos admin", "Configura la allowlist persistida de correos admin separada por comas."],
    ],
    adminFooter:
      "Todas las acciones de administración se ejecutan solo del lado del servidor y requieren una sesión de administrador verificada. El endpoint /api/admin/stats está limitado a 30 solicitudes por minuto.",
  },
  zh: {
    title: "密钥安全",
    intro: "严格的安全编码规则、零信任云存储模型，以及本地密钥保护机制。",
    policy: "Zero-Secret 策略",
    cloud: "零信任云策略",
    rateLimiting: "速率限制",
    securityHeaders: "安全响应头",
    adminPanelSecurity: "管理面板安全",
    policyLead:
      "安全是 VibeBasket 的核心原则之一。已安装 MCP 服务使用的 OpenAI 或 GitHub API token 等敏感密钥不会经过 bundle 数据库，也不会被缓存到其中。",
    cloudBody:
      "Bundle manifest 永远不会包含终端用户的运行时密钥。托管应用会保存所选目录元数据，以及可选的已加密管理员备份存储凭据，但不会保存 MCP 或 agent 工具在运行时使用的 API 密钥。",
    localPromptBody:
      "相反，在本地 apply bundle 时，CLI 会解析目标所需的凭据键，并在本地终端中安全提示操作者注入这些值。托管应用不会看到这些运行时值。",
    adapterSecretBody:
      "之后的密钥处理取决于目标 adapter。大多数 IDE 需要在本地配置文件中写入内联 MCP env 或 header 值，因此 CLI 会在操作者机器上解析这些密钥，并且只写入那台机器的本地 IDE 配置。Codex 对远程 MCP 鉴权 header 属于部分例外：当其原生配置格式支持环境变量键引用时，VibeBasket 会优先写入引用，而不是把原始 token 序列化进 TOML。",
    rateLimitingBody:
      "所有公开 API endpoint 都受到滑动窗口速率限制器的保护，带有按 IP 跟踪与自动垃圾回收。只有在自托管用户明确启用代理信任时，来自代理的 IP header 才会被信任。",
    rateLimitsAria: "API 速率限制端点",
    rateLimitsCaption: "API 端点速率限制",
    endpointHeader: "端点",
    limitHeader: "限制",
    securityHeadersBody:
      "所有响应都附带加固后的安全响应头。在生产环境中，HTML 路由会收到基于 nonce 的 Content-Security-Policy，使 Next.js 能安全完成 hydration，而不会为大范围内联脚本执行打开缺口；同时整套部署都启用了 HSTS。",
    headersAria: "HTTP 安全响应头",
    headersCaption: "安全响应头",
    headerHeader: "响应头",
    valueHeader: "值",
    adminLead:
      "/admin 管理面板位于 OAuth 认证会话之后。访问权限仅授予出现在 ADMIN_OAUTH_EMAILS 环境变量中的邮箱地址，而且只有已验证并加入 allowlist 的账户才会被提升为管理员。",
    adminAria: "管理面板安全功能",
    adminCaption: "管理面板安全控制",
    featureHeader: "功能",
    descriptionHeader: "说明",
    adminRows: [
      ["目录同步", "手动触发来自上游来源的 registry 同步。"],
      ["备份管理", "在任意已配置存储后端上创建、列出、下载并恢复数据库备份。"],
      ["FTS5 索引健康", "将全文搜索索引行数与目录表进行比对，以验证完整性。"],
      ["数据库健康检查", "运行数据库完整性诊断并尽早发现损坏。"],
      ["强制清理", "清理过期 bundle、陈旧 session、验证 token 和旧 sync 记录，然后执行 vacuum。"],
      ["用户概览", "查看注册用户数量、已保存 Stack 遥测数据和流行度排行榜。"],
      ["管理员邮箱", "配置以逗号分隔、持久化为站点配置的管理员邮箱 allowlist。"],
    ],
    adminFooter:
      "所有管理员操作都只在服务端执行，并且需要已验证的管理员会话。/api/admin/stats endpoint 的速率限制为每分钟 30 次请求。",
  },
  hi: {
    title: "सीक्रेट सुरक्षा",
    intro:
      "कड़े secure coding rules, zero-trust cloud storage models, और local secret protection mechanisms.",
    policy: "ज़ीरो-सीक्रेट नीति",
    cloud: "ज़ीरो-ट्रस्ट क्लाउड नीति",
    rateLimiting: "रेट लिमिटिंग",
    securityHeaders: "सुरक्षा हेडर्स",
    adminPanelSecurity: "एडमिन पैनल सुरक्षा",
    policyLead:
      "सुरक्षा VibeBasket की मुख्य प्राथमिकताओं में से एक है। Installed MCP servers द्वारा उपयोग किए जाने वाले OpenAI या GitHub API tokens जैसे संवेदनशील keys कभी भी bundle database के भीतर transit या cache नहीं होते।",
    cloudBody:
      "Bundle manifests कभी भी end-user runtime secrets को शामिल नहीं करते। Hosted app केवल selected catalog metadata और वैकल्पिक रूप से encrypted admin backup-storage credentials रखता है, लेकिन runtime पर MCPs या agent tools द्वारा उपयोग की जाने वाली API keys नहीं रखता।",
    localPromptBody:
      "इसके बजाय, bundle को local apply करते समय CLI target credential keys को parse करता है और operator को local terminal में सुरक्षित रूप से उन्हें inject करने के लिए prompt करता है। Hosted app इन runtime values को कभी नहीं देखता।",
    adapterSecretBody:
      "इसके बाद secret handling target adapter पर निर्भर करती है। अधिकांश IDEs को local config files में inline MCP env या header values चाहिए होती हैं, इसलिए CLI उन secrets को operator की मशीन पर resolve करता है और केवल उसी मशीन की local IDE config में लिखता है। Remote MCP auth headers के लिए Codex आंशिक exception है: जब इसका native config format environment-key reference support करता है, तो VibeBasket raw token को TOML में serialize करने के बजाय वही reference इस्तेमाल करता है।",
    rateLimitingBody:
      "सभी public API endpoints sliding-window rate limiter से संरक्षित हैं, जिसमें per-IP tracking और automatic garbage collection शामिल है। Proxy-derived IP headers पर तभी भरोसा किया जाता है जब self-hoster स्पष्ट रूप से proxy trust सक्षम करे।",
    rateLimitsAria: "API rate limiting endpoints",
    rateLimitsCaption: "API endpoint rate limits",
    endpointHeader: "Endpoint",
    limitHeader: "Limit",
    securityHeadersBody:
      "सभी responses hardened security headers के साथ आते हैं। Production में HTML routes को nonce-based Content-Security-Policy मिलता है, ताकि Next.js सुरक्षित रूप से hydrate हो सके और blanket inline-script execution की गुंजाइश न बने; साथ ही पूरे deployment पर HSTS लागू रहता है।",
    headersAria: "HTTP security headers",
    headersCaption: "Security response headers",
    headerHeader: "Header",
    valueHeader: "Value",
    adminLead:
      "/admin पर मौजूद admin dashboard OAuth-authenticated sessions के पीछे सुरक्षित है। Access केवल ADMIN_OAUTH_EMAILS environment variable में सूचीबद्ध email addresses तक सीमित है, और केवल verified allowlisted emails को admin role मिलता है।",
    adminAria: "Admin panel security features",
    adminCaption: "Admin panel security controls",
    featureHeader: "Feature",
    descriptionHeader: "Description",
    adminRows: [
      ["Catalog Sync", "Upstream sources से registry synchronization को manually trigger करता है।"],
      [
        "Backup Mgmt",
        "किसी भी configured storage backend पर database backups create, list, download और restore करता है।",
      ],
      [
        "FTS5 Index Health",
        "Integrity जाँचने के लिए full-text search index row count को catalog table से compare करता है।",
      ],
      [
        "DB Health Check",
        "Database integrity diagnostics चलाता है और corruption को जल्दी पहचानता है।",
      ],
      [
        "Force Cleanup",
        "Expired bundles, stale sessions, verification tokens और पुराने sync records को purge करके vacuum चलाता है।",
      ],
      [
        "User Overview",
        "Registered user counts, saved stack telemetry और popularity leaderboards का निरीक्षण करता है।",
      ],
      [
        "Admin Emails",
        "Comma-separated admin email allowlist को site config के रूप में persist करता है।",
      ],
    ],
    adminFooter:
      "सभी admin actions केवल server-side चलते हैं और verified administrator session की आवश्यकता होती है। /api/admin/stats endpoint पर rate limit 30 requests प्रति minute है।",
  },
  ru: {
    title: "Безопасность секретов",
    intro:
      "Строгие правила secure coding, zero-trust модель облачного хранения и механизмы защиты локальных секретов.",
    policy: "Zero-Secret Policy",
    cloud: "Zero-Trust Cloud Policy",
    rateLimiting: "Rate limiting",
    securityHeaders: "Security headers",
    adminPanelSecurity: "Безопасность админ-панели",
    policyLead:
      "Безопасность — один из базовых принципов VibeBasket. Чувствительные ключи вроде OpenAI или GitHub API tokens, которые используют установленные MCP-серверы, никогда не проходят через базу bundle’ов и не кэшируются в ней.",
    cloudBody:
      "Bundle manifest’ы никогда не содержат runtime-секреты конечного пользователя. Hosted-приложение хранит выбранные метаданные каталога и, при необходимости, зашифрованные admin credentials для backup storage, но не API keys, которые MCP или agent tools используют во время работы.",
    localPromptBody:
      "Вместо этого при локальном apply bundle CLI анализирует credential keys цели и безопасно запрашивает их у оператора прямо в локальном терминале. Hosted-приложение никогда не видит эти runtime-значения.",
    adapterSecretBody:
      "Дальнейшая обработка secret’ов зависит от целевого адаптера. Большинству IDE нужны inline MCP env или header values в локальных конфиг-файлах, поэтому CLI разрешает эти secrets на машине оператора и записывает их только в локальный IDE config этой машины. Codex — частичное исключение для auth headers удалённых MCP: когда нативный config format поддерживает ссылку на environment-key, VibeBasket предпочитает её, а не сериализацию raw token в TOML.",
    rateLimitingBody:
      "Все публичные API endpoints защищены sliding-window rate limiter’ом с per-IP tracking и автоматической очисткой. Proxy-derived IP headers считаются доверенными только если self-hoster явно включает proxy trust.",
    rateLimitsAria: "API endpoints с rate limiting",
    rateLimitsCaption: "Лимиты API endpoints",
    endpointHeader: "Endpoint",
    limitHeader: "Лимит",
    securityHeadersBody:
      "Все ответы содержат усиленные security headers. В production HTML routes получают nonce-based Content-Security-Policy, чтобы Next.js мог безопасно гидратироваться без открытия двери для массового исполнения inline-скриптов, а HSTS применяется на всём deployment.",
    headersAria: "HTTP security headers",
    headersCaption: "Security response headers",
    headerHeader: "Header",
    valueHeader: "Value",
    adminLead:
      "Админ-панель на /admin защищена OAuth-authenticated sessions. Доступ ограничен адресами из переменной окружения ADMIN_OAUTH_EMAILS, и только подтверждённые email’ы из allowlist получают роль администратора.",
    adminAria: "Функции безопасности админ-панели",
    adminCaption: "Контроли безопасности админ-панели",
    featureHeader: "Функция",
    descriptionHeader: "Описание",
    adminRows: [
      ["Catalog Sync", "Вручную запускает синхронизацию registry из upstream-источников."],
      [
        "Backup Mgmt",
        "Создаёт, показывает, скачивает и восстанавливает backup’ы базы данных в любом настроенном storage backend.",
      ],
      [
        "FTS5 Index Health",
        "Сверяет количество строк в индексе full-text search с таблицей каталога для проверки целостности.",
      ],
      [
        "DB Health Check",
        "Запускает проверки целостности базы данных и помогает рано обнаружить corruption.",
      ],
      [
        "Force Cleanup",
        "Удаляет просроченные bundle’ы, stale sessions, verification tokens и старые sync records, затем выполняет vacuum.",
      ],
      [
        "User Overview",
        "Показывает количество зарегистрированных пользователей, телеметрию saved stacks и рейтинг популярности.",
      ],
      [
        "Admin Emails",
        "Настраивает allowlist админских email’ов, сохранённый в site config в формате comma-separated.",
      ],
    ],
    adminFooter:
      "Все admin actions выполняются только на server-side и требуют подтверждённой admin session. Для endpoint’а /api/admin/stats действует лимит 30 запросов в минуту.",
  },
} as const;

const DOCS_HOME_LABEL = {
  en: "Docs",
  tr: "Dokümanlar",
  es: "Documentación",
  zh: "文档",
  hi: "दस्तावेज़",
  ru: "Документация",
} as const;

export function DocsTabSecurity({ locale }: { locale: AppLocale }) {
  const copy = SECURITY_COPY[locale as keyof typeof SECURITY_COPY] ?? SECURITY_COPY.en;
  const docsHomeLabel =
    DOCS_HOME_LABEL[locale as keyof typeof DOCS_HOME_LABEL] ?? DOCS_HOME_LABEL.en;
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-12 flex items-center gap-2 select-none">
        <Link
          href={localizePath(locale, "/docs")}
          className="opacity-80 hover:text-[#a0fdda] transition-colors cursor-pointer"
        >
          {docsHomeLabel}
        </Link>
        <span className="text-[#bdc9c2]/30">/</span>
        <span className="text-foreground">{copy.title}</span>
      </div>

      <div className="mb-24">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground mb-8 leading-tight">
          {copy.title}
        </h1>
        <p className="text-base sm:text-lg text-[#bdc9c2] max-w-3xl leading-relaxed">
          {copy.intro}
        </p>
      </div>

      <div className="space-y-28 border-t border-[#3e4944]/50 pt-20">
        <section id="security-model" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <KeyRound className="h-6 w-6 text-[#e040fb]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">{copy.policy}</h2>
          </div>

          <div className="prose prose-invert max-w-none text-sm text-[#bdc9c2] leading-relaxed space-y-8">
            <p className="max-w-3xl">{copy.policyLead}</p>

            <div className="flex gap-4 p-8 border-l-2 border-red-500 bg-red-500/5 rounded-r-[2px] my-10">
              <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-widest text-red-400 font-semibold mb-3">
                  {copy.cloud}
                </h4>
                <p className="text-xs text-muted-foreground/90 leading-relaxed">{copy.cloudBody}</p>
              </div>
            </div>

            <p className="max-w-3xl">{copy.localPromptBody}</p>
            <p className="max-w-3xl">{copy.adapterSecretBody}</p>
          </div>
        </section>

        <section id="rate-limiting" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <ShieldAlert className="h-6 w-6 text-[#a0fdda]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {copy.rateLimiting}
            </h2>
          </div>
          <div className="prose prose-invert max-w-none text-sm text-[#bdc9c2] leading-relaxed space-y-8">
            <p className="max-w-3xl">{copy.rateLimitingBody}</p>
            <div className="overflow-x-auto">
              <table className="w-full border border-[#3e4944]" aria-label={copy.rateLimitsAria}>
                <caption className="sr-only">{copy.rateLimitsCaption}</caption>
                <thead className="bg-[#181d1a]">
                  <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-[#bdc9c2]">
                    <th className="p-3 border-b border-[#3e4944] pl-4">{copy.endpointHeader}</th>
                    <th className="p-3 border-b border-[#3e4944]">{copy.limitHeader}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3e4944] font-mono text-[11px] text-[#bdc9c2]">
                  {[
                    ["/api/health", "120/min"],
                    ["/api/catalog", "120/min"],
                    ["/api/auth/*", "60/min"],
                    ["/api/bundle/[id]", "60/min"],
                    ["/api/stacks", "30/min"],
                    ["/api/admin/stats", "30/min"],
                    ["/api/catalog/status", "5/min"],
                    ["/api/bundle POST", "20/min"],
                  ].map(([ep, lim]) => (
                    <tr key={ep} className="hover:bg-[#1c211e]/40 transition-colors">
                      <td className="p-3 pl-4 text-[#a0fdda]">{ep}</td>
                      <td className="p-3">{lim}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="security-headers" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <KeyRound className="h-6 w-6 text-[#e040fb]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {copy.securityHeaders}
            </h2>
          </div>
          <div className="prose prose-invert max-w-none text-sm text-[#bdc9c2] leading-relaxed space-y-8">
            <p className="max-w-3xl">{copy.securityHeadersBody}</p>
            <div className="overflow-x-auto">
              <table className="w-full border border-[#3e4944]" aria-label={copy.headersAria}>
                <caption className="sr-only">{copy.headersCaption}</caption>
                <thead className="bg-[#181d1a]">
                  <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-[#bdc9c2]">
                    <th className="p-3 border-b border-[#3e4944] pl-4">{copy.headerHeader}</th>
                    <th className="p-3 border-b border-[#3e4944]">{copy.valueHeader}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3e4944] font-mono text-[11px] text-[#bdc9c2]">
                  {[
                    ["X-Frame-Options", "DENY"],
                    ["X-Content-Type-Options", "nosniff"],
                    ["Referrer-Policy", "strict-origin-when-cross-origin"],
                    ["X-Permitted-Cross-Domain-Policies", "none"],
                    ["X-Download-Options", "noopen"],
                    ["Permissions-Policy", "camera=(), microphone=(), geolocation=()"],
                    ["Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload"],
                    [
                      "Content-Security-Policy",
                      "default-src 'self'; script-src 'self' 'nonce-<request-nonce>' 'strict-dynamic' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; object-src 'none'; manifest-src 'self'; frame-ancestors 'none'",
                    ],
                  ].map(([h, v]) => (
                    <tr key={h} className="hover:bg-[#1c211e]/40 transition-colors">
                      <td className="p-3 pl-4 text-[#a0fdda]">{h}</td>
                      <td className="p-3">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section id="admin-panel" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <ShieldAlert className="h-6 w-6 text-[#ffb300]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {copy.adminPanelSecurity}
            </h2>
          </div>
          <div className="prose prose-invert max-w-none text-sm text-[#bdc9c2] leading-relaxed space-y-8">
            <p className="max-w-3xl">
              {copy.adminLead.split("/admin")[0]}
              <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                /admin
              </code>{" "}
              {copy.adminLead.split("/admin")[1]?.split("ADMIN_OAUTH_EMAILS")[0] ?? ""}
              <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                ADMIN_OAUTH_EMAILS
              </code>{" "}
              {copy.adminLead.split("ADMIN_OAUTH_EMAILS")[1] ?? ""}
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border border-[#3e4944]" aria-label={copy.adminAria}>
                <caption className="sr-only">{copy.adminCaption}</caption>
                <thead className="bg-[#181d1a]">
                  <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-[#bdc9c2]">
                    <th className="p-3 border-b border-[#3e4944] pl-4">{copy.featureHeader}</th>
                    <th className="p-3 border-b border-[#3e4944]">{copy.descriptionHeader}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3e4944] font-mono text-[11px] text-[#bdc9c2]">
                  {copy.adminRows.map(([feat, desc]) => (
                    <tr key={feat} className="hover:bg-[#1c211e]/40 transition-colors">
                      <td className="p-3 pl-4 text-[#a0fdda]">{feat}</td>
                      <td className="p-3">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="max-w-3xl mt-6">
              {copy.adminFooter.split("/api/admin/stats")[0]}
              <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                /api/admin/stats
              </code>{" "}
              {copy.adminFooter.split("/api/admin/stats")[1] ?? ""}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
