import type { AppLocale } from "@/i18n/config";
import { localizePath } from "@/i18n/locale-routing";
import { AlertTriangle, Info, KeyRound, Server, TerminalSquare } from "lucide-react";
import Link from "next/link";

const SELF_HOSTING_COPY = {
  en: {
    title: "Self-Hosting Guide",
    intro:
      "Run VibeBasket on your own infrastructure with the single-node deployment shape the product is currently optimized for: one app process, one SQLite database, optional OAuth, and optional encrypted backup storage.",
    docker: "Docker (recommended)",
    manualInstallation: "Manual Installation",
    environmentVariables: "Environment Variables",
    bundleLifecycle: "Bundle TTL & Cleanup",
    adminDashboard: "Admin Dashboard",
    helmDeployment: "Helm Deployment",
    sqliteWalMode: "SQLite WAL Mode",
    dockerLead:
      "The easiest way to self-host VibeBasket. The image is a lean multi-stage build based on Node.js 22 Alpine. The SQLite database file is persisted through a named Docker volume so your data survives container restarts and upgrades.",
    step1: "Step 1 — Clone & configure",
    step2: "Step 2 — Start with Docker Compose",
    step3: "Step 3 — Seed the catalog",
    upgrading: "Upgrading",
    helmLead:
      "A fully-featured Helm chart is available in charts/vibebasket/. The chart deploys a single-replica Deployment with a ClusterIP Service, optional Ingress, and a PersistentVolumeClaim for the SQLite database. Non-secret runtime values belong under .Values.env, while secrets such as AUTH_SECRET and OAuth client secrets belong under .Values.secretEnv or an existing Kubernetes Secret.",
    manualLead:
      "Requires Node.js >=20 and pnpm >=9. Suitable for VMs, bare-metal servers, or platforms that do not run Docker.",
    oauthTitle: "OAuth Callback URLs",
    oauthBody:
      "When enabling OAuth authentication, configure the exact redirect callback URL in each provider's developer console:",
    localDevNote: "For local development, replace ${NEXTAUTH_URL} with http://localhost:3000.",
    doNotCommit:
      "Never commit your .env file. The .env file is already listed in .gitignore. In Docker deployments, pass secrets as environment variables or use Docker secrets.",
    cloudflareNote:
      "If you run VibeBasket behind Cloudflare, keep application security headers enabled and disable script-injecting edge features for this site unless you explicitly plan for them. In practice that means turning off Browser Insights, Rocket Loader, and Speed Brain / speculative prefetch features that inject inline or third-party scripts, otherwise the site will log CSP violations by design.",
    variablesHeader: "Variable",
    requiredHeader: "Required",
    descriptionHeader: "Description",
    required: "Required",
    optional: "Optional",
    lifecycleLead:
      "Anonymous bundles expire after 48 hours. Registered user bundles persist for 365 days. The platform periodically purges expired bundles and stale session tokens. Administrators can trigger a manual force cleanup from the admin dashboard under System Health.",
    adminPanelLead:
      "The admin panel at /admin provides catalog sync controls, backup management, FTS5 index health checks, database integrity diagnostics, force cleanup utilities, user overview telemetry, and admin email configuration. Access is gated by the ADMIN_OAUTH_EMAILS environment variable.",
    helmShortLead:
      "A Helm chart is available at charts/vibebasket/ for Kubernetes deployments. The chart includes a Deployment, Service, Ingress, and PersistentVolumeClaim for SQLite storage.",
    helmOpsLead:
      "The deployment uses strategy: Recreate to prevent SQLite corruption during updates. Pod securityContext runs as non-root user 1001 with all capabilities dropped. Production secrets should use existingSecret instead of embedding credentials in values.",
    readinessNote:
      "Before exposing a public domain, walk through the repository's production readiness checklist in docs/PRODUCTION_READINESS_CHECKLIST.md.",
    walBody:
      "VibeBasket enables SQLite WAL (Write-Ahead Logging) mode on startup. This allows concurrent reads during writes and is required for the catalog sync process. Do not mount the database file on a network filesystem (NFS, CIFS) because WAL locking relies on local OS primitives. If you run multiple Node.js replicas, use a load balancer that routes all writes to a single instance, or migrate to a Turso remote database.",
  },
  tr: {
    title: "Self-Hosting Rehberi",
    intro:
      "VibeBasket’i kendi altyapında, ürünün şu anda optimize edildiği tek düğümlü dağıtım şekliyle çalıştır: tek uygulama süreci, tek SQLite veritabanı, isteğe bağlı OAuth ve isteğe bağlı şifreli backup storage.",
    docker: "Docker (önerilen)",
    manualInstallation: "Manuel Kurulum",
    environmentVariables: "Ortam Değişkenleri",
    bundleLifecycle: "Bundle TTL & Temizlik",
    adminDashboard: "Admin Panel",
    helmDeployment: "Helm Dağıtımı",
    sqliteWalMode: "SQLite WAL Modu",
    dockerLead:
      "VibeBasket’i self-host etmek için en kolay yol budur. İmaj, Node.js 22 Alpine tabanlı hafif bir multi-stage build kullanır. SQLite veritabanı dosyası isimlendirilmiş bir Docker volume üzerinde tutulur; böylece veri, container yeniden başlatmaları ve güncellemeler sırasında korunur.",
    step1: "Adım 1 — Klonla ve yapılandır",
    step2: "Adım 2 — Docker Compose ile başlat",
    step3: "Adım 3 — Kataloğu seed et",
    upgrading: "Güncelleme",
    helmLead:
      "Tam özellikli Helm chart’ı charts/vibebasket/ içinde bulunur. Chart; SQLite veritabanı için tek replikalı Deployment, ClusterIP Service, isteğe bağlı Ingress ve bir PersistentVolumeClaim kurar. Secret olmayan çalışma zamanı değerleri .Values.env altında, AUTH_SECRET ve OAuth client secret’ları gibi hassas değerler ise .Values.secretEnv altında veya mevcut bir Kubernetes Secret içinde tutulmalıdır.",
    manualLead:
      "Node.js >=20 ve pnpm >=9 gerektirir. VM’ler, bare-metal sunucular veya Docker çalıştırmayan platformlar için uygundur.",
    oauthTitle: "OAuth Callback URL’leri",
    oauthBody:
      "OAuth kimlik doğrulamasını açarken, her sağlayıcının geliştirici panelinde tam redirect callback URL’ini yapılandırmalısın:",
    localDevNote: "Yerel geliştirme için ${NEXTAUTH_URL} yerine http://localhost:3000 kullan.",
    doNotCommit:
      ".env dosyanı asla commit etme. .env zaten .gitignore içinde listelenmiştir. Docker dağıtımlarında secret’ları ortam değişkeni olarak geç veya Docker secrets kullan.",
    cloudflareNote:
      "VibeBasket’i Cloudflare arkasında çalıştırıyorsan uygulama güvenlik başlıklarını açık tut ve özellikle planlamadığın sürece bu site için script enjekte eden edge özelliklerini kapat. Pratikte bu; Browser Insights, Rocket Loader ve inline ya da üçüncü taraf script ekleyen Speed Brain / speculative prefetch özelliklerini devre dışı bırakmak anlamına gelir. Aksi halde site tasarım gereği CSP ihlalleri loglar.",
    variablesHeader: "Değişken",
    requiredHeader: "Zorunlu",
    descriptionHeader: "Açıklama",
    required: "Zorunlu",
    optional: "İsteğe bağlı",
    lifecycleLead:
      "Anonim bundle’lar 48 saat sonra sona erer. Kayıtlı kullanıcı bundle’ları 365 gün boyunca kalır. Platform süresi dolan bundle’ları ve eski session token’larını periyodik olarak temizler. Yöneticiler, Admin Panel içindeki System Health bölümünden manuel force cleanup tetikleyebilir.",
    adminPanelLead:
      "/admin üzerindeki yönetim paneli; katalog senkronu kontrolleri, yedek yönetimi, FTS5 indeks sağlık kontrolleri, veritabanı bütünlük tanıları, force cleanup yardımcıları, kullanıcı genel görünümü telemetrisi ve yönetici e-posta yapılandırmasını sunar. Erişim, ADMIN_OAUTH_EMAILS ortam değişkeniyle korunur.",
    helmShortLead:
      "Kubernetes dağıtımları için charts/vibebasket/ altında bir Helm chart bulunur. Chart; SQLite depolaması için Deployment, Service, Ingress ve PersistentVolumeClaim içerir.",
    helmOpsLead:
      "Dağıtım, güncellemeler sırasında SQLite bozulmasını önlemek için strategy: Recreate kullanır. Pod securityContext, tüm yetkiler düşürülmüş şekilde root olmayan 1001 kullanıcısıyla çalışır. Production secret’ları values içine gömmek yerine existingSecret ile verilmelidir.",
    readinessNote:
      "Genel erişime açmadan önce depodaki docs/PRODUCTION_READINESS_CHECKLIST.md kontrol listesini adım adım gözden geçir.",
    walBody:
      "VibeBasket başlangıçta SQLite WAL (Write-Ahead Logging) modunu etkinleştirir. Bu sayede yazma sırasında eşzamanlı okumalar mümkün olur ve katalog senkronu için gereklidir. WAL kilitlemesi yerel işletim sistemi ilkelere dayandığından veritabanı dosyasını ağ dosya sistemi (NFS, CIFS) üzerine bağlama. Birden fazla Node.js replikası çalıştırıyorsan tüm yazmaları tek örneğe yönlendiren bir load balancer kullan veya Turso gibi uzak bir veritabanına geç.",
  },
  es: {
    title: "Guía de self-hosting",
    intro:
      "Ejecuta VibeBasket en tu propia infraestructura con la forma de despliegue de nodo único para la que el producto está optimizado: un proceso de app, una base SQLite, OAuth opcional y almacenamiento de backup cifrado opcional.",
    docker: "Docker (recomendado)",
    manualInstallation: "Instalación manual",
    environmentVariables: "Variables de entorno",
    bundleLifecycle: "TTL del bundle y limpieza",
    adminDashboard: "Panel admin",
    helmDeployment: "Despliegue con Helm",
    sqliteWalMode: "Modo WAL de SQLite",
    dockerLead:
      "Es la forma más sencilla de autoalojar VibeBasket. La imagen usa una build multi-stage ligera basada en Node.js 22 Alpine. El archivo SQLite se persiste en un volumen Docker con nombre para que los datos sobrevivan a reinicios y actualizaciones del contenedor.",
    step1: "Paso 1 — Clonar y configurar",
    step2: "Paso 2 — Arrancar con Docker Compose",
    step3: "Paso 3 — Poblar el catálogo",
    upgrading: "Actualización",
    helmLead:
      "Hay un chart Helm completo en charts/vibebasket/. El chart despliega un Deployment de una sola réplica con Service ClusterIP, Ingress opcional y un PersistentVolumeClaim para la base SQLite. Los valores no secretos van bajo .Values.env, mientras que secretos como AUTH_SECRET y los OAuth client secrets deben ir en .Values.secretEnv o en un Kubernetes Secret existente.",
    manualLead:
      "Requiere Node.js >=20 y pnpm >=9. Adecuado para VMs, servidores bare-metal o plataformas que no ejecutan Docker.",
    oauthTitle: "URLs de callback OAuth",
    oauthBody:
      "Al habilitar autenticación OAuth, configura la URL exacta de callback de redirección en la consola de desarrollador de cada proveedor:",
    localDevNote: "Para desarrollo local, sustituye ${NEXTAUTH_URL} por http://localhost:3000.",
    doNotCommit:
      "No hagas commit de tu archivo .env. .env ya está incluido en .gitignore. En despliegues Docker, pasa los secretos como variables de entorno o usa Docker secrets.",
    cloudflareNote:
      "Si ejecutas VibeBasket detrás de Cloudflare, mantén activas las cabeceras de seguridad de la aplicación y desactiva las funciones edge que inyectan scripts para este sitio salvo que las tengas contempladas explícitamente. En la práctica, eso significa apagar Browser Insights, Rocket Loader y Speed Brain / speculative prefetch, ya que inyectan scripts inline o de terceros y provocarían violaciones CSP por diseño.",
    variablesHeader: "Variable",
    requiredHeader: "Obligatoria",
    descriptionHeader: "Descripción",
    required: "Obligatoria",
    optional: "Opcional",
    lifecycleLead:
      "Los bundles anónimos caducan a las 48 horas. Los bundles de usuarios registrados duran 365 días. La plataforma purga periódicamente bundles caducados y tokens de sesión obsoletos. Los administradores pueden lanzar una limpieza forzada manual desde System Health en el panel admin.",
    adminPanelLead:
      "El panel admin en /admin ofrece controles de sync del catálogo, gestión de backups, chequeos de salud del índice FTS5, diagnósticos de integridad de base de datos, utilidades de limpieza forzada, telemetría general de usuarios y configuración de correos admin. El acceso está controlado por la variable de entorno ADMIN_OAUTH_EMAILS.",
    helmShortLead:
      "Hay un chart Helm disponible en charts/vibebasket/ para despliegues en Kubernetes. Incluye Deployment, Service, Ingress y PersistentVolumeClaim para el almacenamiento SQLite.",
    helmOpsLead:
      "El despliegue usa strategy: Recreate para evitar corrupción de SQLite durante actualizaciones. El securityContext del pod se ejecuta como usuario no root 1001 con todas las capacidades retiradas. Los secretos de producción deberían inyectarse mediante existingSecret en lugar de incrustarse en values.",
    readinessNote:
      "Antes de exponer un dominio público, recorre la checklist de preparación para producción del repositorio en docs/PRODUCTION_READINESS_CHECKLIST.md.",
    walBody:
      "VibeBasket habilita el modo SQLite WAL (Write-Ahead Logging) al arrancar. Esto permite lecturas concurrentes durante escrituras y es necesario para la sincronización del catálogo. No montes el archivo de base de datos en un sistema de archivos de red (NFS, CIFS), porque el bloqueo WAL depende de primitivas locales del sistema operativo. Si ejecutas varias réplicas de Node.js, usa un balanceador que dirija todas las escrituras a una sola instancia o migra a una base remota como Turso.",
  },
  zh: {
    title: "自托管指南",
    intro:
      "使用产品当前优化的单节点部署形态在你自己的基础设施上运行 VibeBasket：一个应用进程、一个 SQLite 数据库、可选 OAuth，以及可选的加密备份存储。",
    docker: "Docker（推荐）",
    manualInstallation: "手动安装",
    environmentVariables: "环境变量",
    bundleLifecycle: "Bundle 生命周期与清理",
    adminDashboard: "管理面板",
    helmDeployment: "Helm 部署",
    sqliteWalMode: "SQLite WAL 模式",
    dockerLead:
      "这是自托管 VibeBasket 最简单的方式。镜像使用基于 Node.js 22 Alpine 的轻量 multi-stage build。SQLite 数据库文件持久化到命名 Docker volume 中，因此容器重启或升级后数据仍会保留。",
    step1: "步骤 1 — 克隆并配置",
    step2: "步骤 2 — 用 Docker Compose 启动",
    step3: "步骤 3 — 初始化目录数据",
    upgrading: "升级",
    helmLead:
      "charts/vibebasket/ 中提供了完整的 Helm chart。该 chart 会部署单副本 Deployment、ClusterIP Service、可选 Ingress，以及用于 SQLite 数据库的 PersistentVolumeClaim。非敏感运行时值应放在 .Values.env 下，而 AUTH_SECRET 与 OAuth client secret 这类敏感值应放在 .Values.secretEnv 下，或放入已有 Kubernetes Secret 中。",
    manualLead:
      "需要 Node.js >=20 与 pnpm >=9。适用于虚拟机、裸金属服务器，或无法运行 Docker 的平台。",
    oauthTitle: "OAuth 回调 URL",
    oauthBody: "启用 OAuth 身份验证时，必须在每个提供方的开发者控制台中配置准确的重定向回调 URL：",
    localDevNote: "本地开发时，将 ${NEXTAUTH_URL} 替换为 http://localhost:3000。",
    doNotCommit:
      "永远不要提交 .env 文件。.env 已经在 .gitignore 中。对于 Docker 部署，请通过环境变量传递密钥，或使用 Docker secrets。",
    cloudflareNote:
      "如果你把 VibeBasket 运行在 Cloudflare 后面，请保持应用安全响应头开启，并为该站点关闭会注入脚本的 edge 功能，除非你已经明确为其做了兼容设计。实际操作上，这意味着关闭 Browser Insights、Rocket Loader 以及会注入内联或第三方脚本的 Speed Brain / speculative prefetch，否则站点会按设计记录 CSP 违规。",
    variablesHeader: "变量",
    requiredHeader: "必需",
    descriptionHeader: "说明",
    required: "必需",
    optional: "可选",
    lifecycleLead:
      "匿名 bundle 会在 48 小时后过期。已注册用户的 bundle 会保留 365 天。平台会定期清理过期 bundle 与陈旧 session token。管理员可在管理面板的 System Health 区域手动触发强制清理。",
    adminPanelLead:
      "/admin 管理面板提供目录同步控制、备份管理、FTS5 索引健康检查、数据库完整性诊断、强制清理工具、用户概览遥测以及管理员邮箱配置。访问受 ADMIN_OAUTH_EMAILS 环境变量控制。",
    helmShortLead:
      "charts/vibebasket/ 下提供 Kubernetes 部署用 Helm chart。该 chart 包含 Deployment、Service、Ingress，以及 SQLite 存储所需的 PersistentVolumeClaim。",
    helmOpsLead:
      "为防止更新期间 SQLite 损坏，部署使用 strategy: Recreate。Pod securityContext 以非 root 的 1001 用户运行，并移除全部 capabilities。生产环境 secret 应通过 existingSecret 提供，而不是直接写入 values。",
    readinessNote:
      "在公开域名之前，请先完成仓库中 docs/PRODUCTION_READINESS_CHECKLIST.md 的生产就绪检查。",
    walBody:
      "VibeBasket 在启动时会启用 SQLite WAL（Write-Ahead Logging）模式。这允许在写入期间进行并发读取，也是目录同步流程所必需的。不要把数据库文件挂载到网络文件系统（NFS、CIFS）上，因为 WAL 锁依赖本地操作系统原语。如果你运行多个 Node.js 副本，请使用负载均衡把所有写入路由到单个实例，或迁移到 Turso 这类远程数据库。",
  },
  hi: {
    title: "सेल्फ-होस्टिंग गाइड",
    intro:
      "VibeBasket को अपनी infrastructure पर उसी single-node deployment shape में चलाएँ जिसके लिए product अभी optimized है: एक app process, एक SQLite database, optional OAuth, और optional encrypted backup storage.",
    docker: "Docker (अनुशंसित)",
    manualInstallation: "मैनुअल इंस्टॉलेशन",
    environmentVariables: "एनवायरनमेंट वैरिएबल्स",
    bundleLifecycle: "Bundle TTL और cleanup",
    adminDashboard: "एडमिन डैशबोर्ड",
    helmDeployment: "Helm deployment",
    sqliteWalMode: "SQLite WAL mode",
    dockerLead:
      "VibeBasket को self-host करने का सबसे आसान तरीका यही है। Image, Node.js 22 Alpine पर आधारित lean multi-stage build का उपयोग करती है। SQLite database file एक named Docker volume में persist होती है, इसलिए container restart या upgrade के बाद भी data सुरक्षित रहता है।",
    step1: "स्टेप 1 — Clone और configure करें",
    step2: "स्टेप 2 — Docker Compose के साथ शुरू करें",
    step3: "स्टेप 3 — Catalog seed करें",
    upgrading: "अपग्रेड करना",
    helmLead:
      "charts/vibebasket/ में एक fully-featured Helm chart उपलब्ध है। यह chart single-replica Deployment, ClusterIP Service, optional Ingress, और SQLite database के लिए PersistentVolumeClaim deploy करता है। Non-secret runtime values को .Values.env में, जबकि AUTH_SECRET और OAuth client secrets जैसे secrets को .Values.secretEnv या existing Kubernetes Secret में रखना चाहिए।",
    manualLead:
      "Node.js >=20 और pnpm >=9 की आवश्यकता है। यह VMs, bare-metal servers, या उन platforms के लिए उपयुक्त है जहाँ Docker नहीं चलता।",
    oauthTitle: "OAuth callback URLs",
    oauthBody:
      "OAuth authentication सक्षम करते समय, हर provider के developer console में exact redirect callback URL कॉन्फ़िगर करें:",
    localDevNote: "Local development के लिए ${NEXTAUTH_URL} को http://localhost:3000 से बदलें।",
    doNotCommit:
      "अपनी .env file को कभी commit न करें। .env पहले से ही .gitignore में शामिल है। Docker deployments में secrets को environment variables के रूप में पास करें या Docker secrets का उपयोग करें।",
    cloudflareNote:
      "यदि आप VibeBasket को Cloudflare के पीछे चला रहे हैं, तो application security headers चालू रखें और इस साइट के लिए script inject करने वाले edge features को बंद रखें, जब तक कि आपने उनके लिए स्पष्ट रूप से योजना न बनाई हो। व्यवहार में इसका मतलब है Browser Insights, Rocket Loader और Speed Brain / speculative prefetch जैसी सुविधाएँ बंद करना, क्योंकि वे inline या third-party scripts inject करती हैं और अन्यथा साइट CSP violations log करेगी।",
    variablesHeader: "Variable",
    requiredHeader: "Required",
    descriptionHeader: "Description",
    required: "Required",
    optional: "Optional",
    lifecycleLead:
      "Anonymous bundles 48 घंटे बाद expire हो जाते हैं। Registered users के bundles 365 दिनों तक बने रहते हैं। Platform समय-समय पर expired bundles और stale session tokens को purge करता है। Administrators System Health के अंतर्गत admin dashboard से manual force cleanup चला सकते हैं।",
    adminPanelLead:
      "/admin पर मौजूद admin panel catalog sync controls, backup management, FTS5 index health checks, database integrity diagnostics, force cleanup utilities, user overview telemetry और admin email configuration प्रदान करता है। Access, ADMIN_OAUTH_EMAILS environment variable द्वारा नियंत्रित है।",
    helmShortLead:
      "Kubernetes deployments के लिए charts/vibebasket/ में Helm chart उपलब्ध है। इसमें SQLite storage के लिए Deployment, Service, Ingress और PersistentVolumeClaim शामिल हैं।",
    helmOpsLead:
      "Deployment, updates के दौरान SQLite corruption रोकने के लिए strategy: Recreate का उपयोग करता है। Pod securityContext non-root user 1001 के रूप में चलता है और सभी capabilities हटाई जाती हैं। Production secrets को values में embed करने के बजाय existingSecret के माध्यम से देना चाहिए।",
    readinessNote:
      "Public domain expose करने से पहले repository की docs/PRODUCTION_READINESS_CHECKLIST.md में दी गई production readiness checklist पूरी करें।",
    walBody:
      "VibeBasket startup पर SQLite WAL (Write-Ahead Logging) mode सक्षम करता है। इससे writes के दौरान concurrent reads संभव होती हैं और catalog sync प्रक्रिया के लिए यह आवश्यक है। Database file को network filesystem (NFS, CIFS) पर mount न करें, क्योंकि WAL locking local OS primitives पर निर्भर करती है। यदि आप multiple Node.js replicas चलाते हैं, तो load balancer का उपयोग करें जो सभी writes को एक ही instance तक route करे, या Turso जैसी remote database पर migrate करें।",
  },
  ru: {
    title: "Гайд по self-hosting",
    intro:
      "Запускайте VibeBasket в собственной инфраструктуре в той single-node deployment-схеме, под которую сейчас лучше всего оптимизирован продукт: один app process, одна SQLite database, optional OAuth и optional encrypted backup storage.",
    docker: "Docker (рекомендуется)",
    manualInstallation: "Ручная установка",
    environmentVariables: "Переменные окружения",
    bundleLifecycle: "Bundle TTL и cleanup",
    adminDashboard: "Админ-панель",
    helmDeployment: "Helm deployment",
    sqliteWalMode: "SQLite WAL mode",
    dockerLead:
      "Это самый простой способ self-host’ить VibeBasket. Образ использует лёгкий multi-stage build на базе Node.js 22 Alpine. SQLite database file хранится в named Docker volume, поэтому данные переживают restart контейнера и upgrade.",
    step1: "Шаг 1 — Клонируйте и настройте",
    step2: "Шаг 2 — Запустите через Docker Compose",
    step3: "Шаг 3 — Засейдите каталог",
    upgrading: "Обновление",
    helmLead:
      "Полноценный Helm chart доступен в charts/vibebasket/. Chart разворачивает single-replica Deployment с ClusterIP Service, optional Ingress и PersistentVolumeClaim для SQLite database. Несекретные runtime values должны храниться в .Values.env, а такие секреты, как AUTH_SECRET и OAuth client secrets, — в .Values.secretEnv или в существующем Kubernetes Secret.",
    manualLead:
      "Требует Node.js >=20 и pnpm >=9. Подходит для VM, bare-metal серверов и платформ, где Docker не используется.",
    oauthTitle: "OAuth callback URLs",
    oauthBody:
      "При включении OAuth-аутентификации настройте точный redirect callback URL в developer console каждого провайдера:",
    localDevNote: "Для локальной разработки замените ${NEXTAUTH_URL} на http://localhost:3000.",
    doNotCommit:
      "Никогда не коммитьте файл .env. Он уже добавлен в .gitignore. В Docker deployment’ах передавайте secrets как environment variables или используйте Docker secrets.",
    cloudflareNote:
      "Если вы запускаете VibeBasket за Cloudflare, оставьте application security headers включёнными и выключите edge-функции, которые внедряют скрипты, если только вы специально не проектировали совместимость с ними. На практике это означает отключить Browser Insights, Rocket Loader и Speed Brain / speculative prefetch, так как они добавляют inline или third-party scripts и по дизайну вызывают CSP violations.",
    variablesHeader: "Переменная",
    requiredHeader: "Обязательна",
    descriptionHeader: "Описание",
    required: "Обязательна",
    optional: "Необязательна",
    lifecycleLead:
      "Анонимные bundle’ы истекают через 48 часов. Bundle’ы зарегистрированных пользователей живут 365 дней. Платформа периодически очищает expired bundles и stale session tokens. Администраторы могут вручную запустить force cleanup из раздела System Health в админке.",
    adminPanelLead:
      "Админ-панель на /admin предоставляет control’ы для sync каталога, backup management, проверки здоровья FTS5 index, диагностики целостности базы, force cleanup utilities, user telemetry overview и конфигурации admin email. Доступ защищён через переменную окружения ADMIN_OAUTH_EMAILS.",
    helmShortLead:
      "Для Kubernetes deployment’ов доступен Helm chart в charts/vibebasket/. Он включает Deployment, Service, Ingress и PersistentVolumeClaim для SQLite storage.",
    helmOpsLead:
      "Deployment использует strategy: Recreate, чтобы избежать SQLite corruption во время обновлений. Pod securityContext работает от non-root user 1001 с удалёнными capabilities. Production secrets лучше передавать через existingSecret, а не встраивать в values.",
    readinessNote:
      "Перед публикацией публичного домена пройдите checklist production readiness из docs/PRODUCTION_READINESS_CHECKLIST.md.",
    walBody:
      "VibeBasket включает SQLite WAL (Write-Ahead Logging) mode при запуске. Это позволяет читать данные во время записи и необходимо для процесса sync каталога. Не размещайте database file на network filesystem (NFS, CIFS), потому что WAL locking опирается на локальные OS primitives. Если вы запускаете несколько реплик Node.js, используйте load balancer, который направляет все writes в один instance, или мигрируйте на удалённую базу вроде Turso.",
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

export function DocsTabSelfHosting({ locale }: { locale: AppLocale }) {
  const copy = SELF_HOSTING_COPY[locale as keyof typeof SELF_HOSTING_COPY] ?? SELF_HOSTING_COPY.en;
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
        <section id="docker" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <Server className="h-6 w-6 text-[#a0fdda]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">{copy.docker}</h2>
          </div>
          <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl mb-8">{copy.dockerLead}</p>

          <div className="space-y-10">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-3">
                {copy.step1}
              </p>
              <pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`git clone https://github.com/mhmtayberk/VibeBasket.git
cd VibeBasket

# Copy the example env file and fill in your values
cp .env.example .env`}</pre>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-3">
                {copy.step2}
              </p>
              <pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`docker compose up -d

# View logs
docker compose logs -f web`}</pre>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-3">
                {copy.step3}
              </p>
              <pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`# Run the catalog sync inside the running container
docker compose exec web node scripts/catalog-sync.mjs`}</pre>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-3">
                {copy.upgrading}
              </p>
              <pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`git pull
docker compose up -d --build`}</pre>
            </div>
          </div>
        </section>

        <section id="helm" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <Server className="h-6 w-6 text-[#33bbc5]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Helm (Kubernetes)
            </h2>
          </div>
          <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl mb-8">
            {copy.helmLead.split("charts/vibebasket/")[0]}
            <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
              charts/vibebasket/
            </code>
            {copy.helmLead.split("charts/vibebasket/")[1]?.split(".Values.env")[0] ?? ""}
            <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
              .Values.env
            </code>
            {copy.helmLead.split(".Values.env")[1]?.split("AUTH_SECRET")[0] ?? ""}
            <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
              AUTH_SECRET
            </code>{" "}
            {copy.helmLead.split("AUTH_SECRET")[1]?.split(".Values.secretEnv")[0] ?? ""}
            <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
              .Values.secretEnv
            </code>{" "}
            {copy.helmLead.split(".Values.secretEnv")[1] ?? ""}
          </p>
          <pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`git clone https://github.com/mhmtayberk/VibeBasket.git
cd VibeBasket

helm install vibebasket ./charts/vibebasket \\
  --set env.NEXTAUTH_URL=https://vibebasket.example.com \\
  --set secretEnv.AUTH_SECRET=$(openssl rand -base64 32) \\
  --set env.AUTH_GITHUB_ID=your-client-id \\
  --set secretEnv.AUTH_GITHUB_SECRET=your-client-secret \\
  --set env.AUTH_GITHUB_ENABLED=true \\
  --set persistence.size=5Gi

# Or install with a custom values file
helm install vibebasket ./charts/vibebasket -f my-values.yaml`}</pre>
        </section>

        <section id="manual" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <TerminalSquare className="h-6 w-6 text-[#33bbc5]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {copy.manualInstallation}
            </h2>
          </div>
          <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl mb-8">{copy.manualLead}</p>
          <pre className="bg-[#0a0f0d] p-6 border border-[#3e4944] font-mono text-xs text-[#bdc9c2] overflow-x-auto rounded-[2px] leading-relaxed">{`git clone https://github.com/mhmtayberk/VibeBasket.git && cd VibeBasket
cp .env.example .env          # fill in values (see below)
pnpm install --frozen-lockfile
pnpm run build
node scripts/catalog-sync.mjs # seed the database
pnpm --filter web start        # production server on :3000`}</pre>
        </section>

        <section id="env-vars" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <KeyRound className="h-6 w-6 text-[#e040fb]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {copy.environmentVariables}
            </h2>
          </div>

          <div className="flex gap-4 p-6 border-l-2 border-[#33bbc5] bg-[#33bbc5]/5 rounded-r-[2px] mb-8">
            <Info className="h-5 w-5 text-[#33bbc5] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#33bbc5] font-semibold mb-3">
                {copy.oauthTitle}
              </h4>
              <p className="text-xs text-muted-foreground/90 leading-relaxed mb-3">
                {copy.oauthBody}
              </p>
              <div className="space-y-2">
                {[
                  { provider: "GitHub", path: "github" },
                  { provider: "Google", path: "google" },
                  { provider: "Apple", path: "apple" },
                  { provider: "Microsoft Entra ID", path: "microsoft-entra-id" },
                ].map((p) => (
                  <div key={p.provider} className="flex items-baseline gap-2">
                    <span className="font-mono text-[10px] text-[#bdc9c2]/60 w-28 shrink-0">
                      {p.provider}
                    </span>
                    <pre className="bg-[#0a0f0d] px-3 py-1 border border-[#3e4944] font-mono text-[10px] text-[#a0fdda] rounded-[2px] leading-relaxed">
                      {`\${NEXTAUTH_URL}/api/auth/callback/${p.path}`}
                    </pre>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#bdc9c2]/60 mt-3">
                {copy.localDevNote.split("${NEXTAUTH_URL}")[0]}
                <code className="font-mono text-[10px] text-foreground bg-card px-1 py-0.5 rounded-[2px] border border-border/50">
                  {"${NEXTAUTH_URL}"}
                </code>{" "}
                {copy.localDevNote.split("${NEXTAUTH_URL}")[1]?.split("http://localhost:3000")[0] ??
                  ""}
                <code className="font-mono text-[10px] text-foreground bg-card px-1 py-0.5 rounded-[2px] border border-border/50">
                  http://localhost:3000
                </code>
                {copy.localDevNote.split("http://localhost:3000")[1] ?? ""}
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-6 border-l-2 border-amber-400 bg-amber-400/5 rounded-r-[2px] mb-8">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-[#bdc9c2] leading-relaxed">
              {copy.doNotCommit.split(".env")[0]}
              <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                .env
              </code>{" "}
              {copy.doNotCommit.split(".env")[1]?.split(".env")[0] ?? ""}
              <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                .env
              </code>{" "}
              {copy.doNotCommit.split(".env")[1]?.split(".gitignore")[0]?.split(".env")[1] ?? ""}
              <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                .gitignore
              </code>
              {copy.doNotCommit.split(".gitignore")[1] ?? ""}
            </p>
          </div>

          <div className="flex gap-4 p-6 border-l-2 border-[#33bbc5] bg-[#33bbc5]/5 rounded-r-[2px] mb-8">
            <Info className="h-5 w-5 text-[#33bbc5] shrink-0 mt-0.5" />
            <p className="text-xs text-[#bdc9c2] leading-relaxed">{copy.cloudflareNote}</p>
          </div>

          <div className="border border-[#3e4944] rounded-[2px] overflow-hidden">
            <table className="w-full border-collapse text-left text-xs leading-relaxed">
              <thead>
                <tr className="bg-[#1c211e] border-b border-[#3e4944] font-mono uppercase tracking-wider text-[10px] text-foreground">
                  <th className="p-4 pl-6 font-semibold">{copy.variablesHeader}</th>
                  <th className="p-4 font-semibold">{copy.requiredHeader}</th>
                  <th className="p-4 pr-6 font-semibold">{copy.descriptionHeader}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3e4944] font-mono text-[#bdc9c2]">
                {[
                  {
                    name: "DATABASE_URL",
                    req: true,
                    desc: "SQLite connection string. Use file:/data/vibebasket.db for Docker (volume mount) or an absolute path for manual installs.",
                  },
                  {
                    name: "AUTH_SECRET",
                    req: true,
                    desc: "Random 32-byte secret used to sign Next-Auth session tokens. Generate with: openssl rand -base64 32",
                  },
                  {
                    name: "NEXTAUTH_URL",
                    req: true,
                    desc: "The public canonical URL of your deployment, e.g. https://vibebasket.example.com. Required for OAuth redirects.",
                  },
                  {
                    name: "AUTH_TRUST_HOST",
                    req: false,
                    desc: "Set to true when running behind a reverse proxy such as Coolify, Nginx, or Cloudflare. Strongly recommended for production OAuth callback reliability.",
                  },
                  {
                    name: "AUTH_GITHUB_ID / SECRET",
                    req: false,
                    desc: "GitHub OAuth App credentials. Set AUTH_GITHUB_ENABLED=true to enable.",
                  },
                  {
                    name: "AUTH_GOOGLE_ID / SECRET",
                    req: false,
                    desc: "Google OAuth credentials. Set AUTH_GOOGLE_ENABLED=true to enable.",
                  },
                  {
                    name: "AUTH_APPLE_ID / SECRET",
                    req: false,
                    desc: "Apple Sign-In credentials. Set AUTH_APPLE_ENABLED=true to enable.",
                  },
                  {
                    name: "AUTH_MICROSOFT_ENTRA_ID_ID / SECRET",
                    req: false,
                    desc: "Microsoft Entra ID (Azure AD) credentials. Set AUTH_MICROSOFT_ENTRA_ID_ENABLED=true. Uses /common/ endpoint by default.",
                  },
                  {
                    name: "ADMIN_OAUTH_EMAILS",
                    req: false,
                    desc: "Comma-separated list of admin emails. Access is granted only when the OAuth account email is allowlisted and verified.",
                  },
                  {
                    name: "TRUST_PROXY",
                    req: false,
                    desc: "Set to true when running behind Cloudflare, Nginx, or another trusted reverse proxy. Proxy IP headers are ignored otherwise.",
                  },
                  {
                    name: "CATALOG_REFRESH_TOKEN",
                    req: false,
                    desc: "Optional token required for authenticated production callers that use /api/catalog?refresh=1.",
                  },
                  {
                    name: "BACKUP_STORAGE_BACKEND",
                    req: false,
                    desc: "Backup storage backend: local, s3, r2, spaces, azure, or gcs. Defaults to local. Can also be set via admin panel.",
                  },
                  {
                    name: "BACKUP_S3_* / R2_* / SPACES_*",
                    req: false,
                    desc: "S3-compatible storage credentials (endpoint, region, bucket, access key, secret key). Covers AWS S3, Cloudflare R2, and DigitalOcean Spaces.",
                  },
                  {
                    name: "BACKUP_AZURE_CONNECTION_STRING / CONTAINER",
                    req: false,
                    desc: "Azure Blob Storage connection string and container name.",
                  },
                  {
                    name: "BACKUP_GCS_BUCKET / PROJECT_ID",
                    req: false,
                    desc: "Google Cloud Storage bucket name and GCP project ID.",
                  },
                ].map((v) => (
                  <tr key={v.name} className="hover:bg-[#1c211e]/40 transition-colors">
                    <td className="p-4 pl-6 text-[#a0fdda] font-semibold text-[10px]">{v.name}</td>
                    <td className="p-4 text-[10px]">
                      {v.req ? (
                        <span className="text-red-400">{copy.required}</span>
                      ) : (
                        <span className="text-[#bdc9c2]/50">{copy.optional}</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 font-sans text-[#bdc9c2]/80 leading-relaxed">
                      {v.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="bundle-ttl" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <Info className="h-6 w-6 text-[#a0fdda]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {copy.bundleLifecycle}
            </h2>
          </div>
          <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl mb-8">
            {copy.lifecycleLead}
          </p>
          <div className="flex gap-4 p-6 border-l-2 border-[#33bbc5] bg-[#33bbc5]/5 rounded-r-[2px]">
            <Info className="h-5 w-5 text-[#33bbc5] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#33bbc5] font-semibold mb-2">
                {copy.adminDashboard}
              </h4>
              <p className="text-xs text-muted-foreground/90 leading-relaxed">
                {copy.adminPanelLead.split("/admin")[0]}
                <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                  /admin
                </code>{" "}
                {copy.adminPanelLead.split("/admin")[1]?.split("ADMIN_OAUTH_EMAILS")[0] ?? ""}
                <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                  ADMIN_OAUTH_EMAILS
                </code>{" "}
                {copy.adminPanelLead.split("ADMIN_OAUTH_EMAILS")[1] ?? ""}
              </p>
            </div>
          </div>
        </section>

        <section id="helm-deployment" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <Server className="h-6 w-6 text-[#a0fdda]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {copy.helmDeployment}
            </h2>
          </div>
          <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl mb-6">
            {copy.helmShortLead.split("charts/vibebasket/")[0]}
            <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
              charts/vibebasket/
            </code>{" "}
            {copy.helmShortLead.split("charts/vibebasket/")[1] ?? ""}
          </p>
          <div className="border border-[#3e4944] bg-[#101412]/80 p-4 font-mono text-[11px] text-[#bdc9c2] mb-6">
            <div>
              <span className="text-[#a0fdda]">$</span> helm install vibebasket ./charts/vibebasket
              \
            </div>
            <div> --set env.NEXTAUTH_URL=https://vibebasket.example.com \</div>
            <div> --set secretEnv.AUTH_SECRET=&lt;generated-secret&gt;</div>
          </div>
          <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl mb-4">
            {copy.helmOpsLead.split("strategy: Recreate")[0]}
            <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
              strategy: Recreate
            </code>{" "}
            {copy.helmOpsLead.split("strategy: Recreate")[1]?.split("securityContext")[0] ?? ""}
            <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
              securityContext
            </code>{" "}
            {copy.helmOpsLead.split("securityContext")[1]?.split("existingSecret")[0] ?? ""}
            <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
              existingSecret
            </code>{" "}
            {copy.helmOpsLead.split("existingSecret")[1] ?? ""}
          </p>
          <p className="text-xs text-[#bdc9c2]/70 leading-relaxed max-w-3xl">
            {copy.readinessNote.split("docs/PRODUCTION_READINESS_CHECKLIST.md")[0]}
            <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
              docs/PRODUCTION_READINESS_CHECKLIST.md
            </code>
            {copy.readinessNote.split("docs/PRODUCTION_READINESS_CHECKLIST.md")[1] ?? ""}
          </p>
        </section>

        <section id="wal-mode" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <AlertTriangle className="h-6 w-6 text-amber-400" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {copy.sqliteWalMode}
            </h2>
          </div>
          <div className="flex gap-4 p-8 border-l-2 border-amber-400 bg-amber-400/5 rounded-r-[2px]">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground/90 leading-relaxed">{copy.walBody}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
