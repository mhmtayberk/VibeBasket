import type { AppLocale } from "@/i18n/config";
import { localizePath } from "@/i18n/locale-routing";
import { McpSnippetPreview } from "@/components/docs/McpSnippetPreview";
import { ShieldCheck, TerminalSquare, Wrench } from "lucide-react";
import Link from "next/link";

const MCP_COPY = {
  en: {
    title: "Local MCP",
    intro:
      "VibeBasket exposes a local stdio MCP server through the CLI so AI IDEs can discover catalog items, understand target capabilities, plan installs, and apply bundles without leaving the conversation.",
    docsHome: "Docs",
    statusTitle: "What it does today",
    statusBody:
      "This is a strong phase-1 MCP surface: catalog search, item lookup, target guidance, install planning, install apply, backup listing, rollback, and local stack save/load all run through the real CLI service layer.",
    commandTitle: "Start command",
    commandBody:
      "Run the MCP server locally with npx vibebasket mcp serve. The client should connect over stdio, not HTTP.",
    snippetsTitle: "Native config snippets",
    snippetsBody:
      "Ask the local MCP for target-native fragments with targets.get_mcp_snippet. These examples show the exact merge shape for a few representative clients.",
    snippetsFootnote:
      "Each snippet is a merge fragment, not a complete config file. Preserve the rest of the user's config.",
    cursorExample: "Cursor / JSON",
    continueExample: "Continue / YAML",
    codexExample: "Codex CLI / TOML",
    claudeCodeExample: "Claude Code / JSON",
    zedExample: "Zed / JSON",
    gooseExample: "Goose / YAML",
    toolsTitle: "Key tools",
    tools: [
      "session.get_state — discover current API base URL, write policy, and local/cloud stack availability",
      "targets.list / targets.get_setup_guide / targets.get_mcp_snippet — inspect target capabilities, setup guidance, and native MCP config fragments for each IDE",
      "catalog.search / catalog.get_item — search and inspect trusted catalog entries",
      "install.plan / install.apply — dry-run first, then apply through the real adapter pipeline",
      "install.list_backups / install.rollback — inspect and restore local backups",
    ],
    safetyTitle: "Safety model",
    safetyBody:
      "Low-risk tools run directly. Medium- and high-risk tools are policy-gated. Runtime secrets stay local, and the MCP surface does not pretend cloud stack save is linked when it is not.",
    limitationsTitle: "Current limitations",
    limitations: [
      "Cloud/profile-backed stack save is still handled on the website, not inside local MCP.",
      "The MCP server is stdio-only in this phase.",
      "Target guidance is intentionally conservative and follows the current adapter-backed install model.",
    ],
    nextStep:
      "Open the CLI reference if you want the full command surface, or jump back to the catalog to build a bundle first.",
    openCli: "Open CLI reference",
    openCatalog: "Open catalog",
  },
  tr: {
    title: "Yerel MCP",
    intro:
      "VibeBasket, CLI üzerinden yerel bir stdio MCP sunucusu açar; böylece AI IDE’ler katalog öğelerini keşfedebilir, hedef yeteneklerini anlayabilir, kurulum planı çıkarabilir ve konuşmadan çıkmadan bundle uygulayabilir.",
    docsHome: "Dokümanlar",
    statusTitle: "Bugün neler yapıyor",
    statusBody:
      "Bu güçlü bir phase-1 MCP yüzeyi: katalog arama, öğe inceleme, hedef rehberliği, kurulum planlama, kurulum uygulama, yedek listeleme, rollback ve yerel stack kaydetme/yükleme doğrudan gerçek CLI servis katmanı üzerinden çalışır.",
    commandTitle: "Başlatma komutu",
    commandBody:
      "MCP sunucusunu yerelde npx vibebasket mcp serve ile çalıştır. İstemci HTTP değil stdio üzerinden bağlanmalı.",
    snippetsTitle: "Native config snippet'leri",
    snippetsBody:
      "Yerel MCP'den targets.get_mcp_snippet ile hedefe özel fragment'ler iste. Bu örnekler birkaç temsili istemci için tam merge şeklini gösterir.",
    snippetsFootnote:
      "Her snippet tam config dosyası değil, merge fragment'tir. Kullanıcının mevcut config'inin geri kalanını koru.",
    cursorExample: "Cursor / JSON",
    continueExample: "Continue / YAML",
    codexExample: "Codex CLI / TOML",
    claudeCodeExample: "Claude Code / JSON",
    zedExample: "Zed / JSON",
    gooseExample: "Goose / YAML",
    toolsTitle: "Temel araçlar",
    tools: [
      "session.get_state — mevcut API base URL, write policy ve local/cloud stack durumunu öğrenir",
      "targets.list / targets.get_setup_guide / targets.get_mcp_snippet — hedef yeteneklerini, kurulum rehberini ve her IDE için native MCP config fragment'lerini gösterir",
      "catalog.search / catalog.get_item — güvenilir katalog kayıtlarını arar ve inceler",
      "install.plan / install.apply — önce dry-run plan, sonra gerçek adaptör hattı üzerinden apply",
      "install.list_backups / install.rollback — yerel yedekleri inceler ve geri yükler",
    ],
    safetyTitle: "Güvenlik modeli",
    safetyBody:
      "Düşük riskli araçlar doğrudan çalışır. Orta ve yüksek riskli araçlar policy ile korunur. Runtime secret’lar yerelde kalır ve MCP yüzeyi, cloud stack save bağlı değilse bunu varmış gibi göstermez.",
    limitationsTitle: "Mevcut sınırlamalar",
    limitations: [
      "Cloud/profile-backed stack save hâlâ local MCP içinde değil, web sitesi üzerinden yürür.",
      "Bu fazda MCP sunucusu yalnızca stdio çalışır.",
      "Target guidance kasıtlı olarak konservatiftir ve mevcut adaptör destekli kurulum modelini takip eder.",
    ],
    nextStep:
      "Tüm komut yüzeyi için CLI referansını açabilir ya da önce bir bundle oluşturmak için kataloğa dönebilirsin.",
    openCli: "CLI referansını aç",
    openCatalog: "Kataloğu aç",
  },
  es: {
    title: "MCP local",
    intro:
      "VibeBasket expone un servidor MCP local por stdio desde el CLI para que los AI IDEs descubran elementos del catálogo, entiendan capacidades por objetivo, planifiquen instalaciones y apliquen bundles sin salir de la conversación.",
    docsHome: "Docs",
    statusTitle: "Lo que hace hoy",
    statusBody:
      "Es una buena superficie MCP de fase 1: búsqueda de catálogo, lookup por id, guía por objetivo, planificación, apply, listado de backups, rollback y guardado/carga de stacks locales pasan por la misma capa real de servicios del CLI.",
    commandTitle: "Comando de arranque",
    commandBody:
      "Ejecuta el servidor MCP local con npx vibebasket mcp serve. El cliente debe conectarse por stdio, no por HTTP.",
    snippetsTitle: "Snippets nativos de configuración",
    snippetsBody:
      "Pide fragmentos nativos por objetivo con targets.get_mcp_snippet. Estos ejemplos muestran la forma exacta de merge para algunos clientes representativos.",
    snippetsFootnote:
      "Cada snippet es un fragmento de merge, no un archivo de configuración completo. Conserva el resto de la configuración del usuario.",
    cursorExample: "Cursor / JSON",
    continueExample: "Continue / YAML",
    codexExample: "Codex CLI / TOML",
    claudeCodeExample: "Claude Code / JSON",
    zedExample: "Zed / JSON",
    gooseExample: "Goose / YAML",
    toolsTitle: "Herramientas clave",
    tools: [
      "session.get_state — descubre la API base URL actual, la política de escritura y la disponibilidad de stacks locales/cloud",
      "targets.list / targets.get_setup_guide / targets.get_mcp_snippet — inspecciona capacidades por objetivo, guía de integración y fragmentos nativos de configuración MCP por IDE",
      "catalog.search / catalog.get_item — busca e inspecciona entradas confiables del catálogo",
      "install.plan / install.apply — primero dry-run, luego apply por la tubería real de adapters",
      "install.list_backups / install.rollback — inspecciona y restaura backups locales",
    ],
    safetyTitle: "Modelo de seguridad",
    safetyBody:
      "Las herramientas de bajo riesgo corren directamente. Las de riesgo medio o alto quedan protegidas por policy. Los secrets de runtime permanecen locales y la superficie MCP no finge que el guardado cloud está enlazado cuando no lo está.",
    limitationsTitle: "Limitaciones actuales",
    limitations: [
      "El guardado cloud/profile-backed de stacks sigue yendo por el sitio web, no por el MCP local.",
      "En esta fase el servidor MCP es solo stdio.",
      "La guía por objetivo es conservadora y sigue el modelo actual respaldado por adapters.",
    ],
    nextStep:
      "Abre la referencia del CLI si quieres toda la superficie de comandos, o vuelve al catálogo para construir primero un bundle.",
    openCli: "Abrir referencia CLI",
    openCatalog: "Abrir catálogo",
  },
  zh: {
    title: "本地 MCP",
    intro:
      "VibeBasket 通过 CLI 暴露一个本地 stdio MCP 服务，让 AI IDE 可以在不离开对话的情况下发现目录条目、理解目标能力、规划安装并应用 bundle。",
    docsHome: "文档",
    statusTitle: "当前能力",
    statusBody:
      "这是一个扎实的 phase-1 MCP 面：目录搜索、单项查询、目标指导、安装规划、应用、备份列表、rollback，以及本地 stack 的保存与加载，都复用了真实的 CLI 服务层。",
    commandTitle: "启动命令",
    commandBody: "使用 npx vibebasket mcp serve 在本地启动 MCP 服务。客户端应通过 stdio 连接，而不是 HTTP。",
    snippetsTitle: "原生配置片段",
    snippetsBody:
      "通过 targets.get_mcp_snippet 请求目标原生片段。下面这些示例展示了几个代表性客户端的准确 merge 形状。",
    snippetsFootnote:
      "每个 snippet 都是 merge 片段，不是完整配置文件。请保留用户现有配置的其余部分。",
    cursorExample: "Cursor / JSON",
    continueExample: "Continue / YAML",
    codexExample: "Codex CLI / TOML",
    claudeCodeExample: "Claude Code / JSON",
    zedExample: "Zed / JSON",
    gooseExample: "Goose / YAML",
    toolsTitle: "关键工具",
    tools: [
      "session.get_state — 查看当前 API base URL、写策略与本地/云 stack 可用性",
      "targets.list / targets.get_setup_guide / targets.get_mcp_snippet — 查看目标能力、接入指导与每个 IDE 的原生 MCP 配置片段",
      "catalog.search / catalog.get_item — 搜索并查看可信目录条目",
      "install.plan / install.apply — 先 dry-run，再通过真实 adapter 管线 apply",
      "install.list_backups / install.rollback — 查看并恢复本地备份",
    ],
    safetyTitle: "安全模型",
    safetyBody:
      "低风险工具可直接运行。中高风险工具受 policy 保护。Runtime secrets 保持在本机，本地 MCP 也不会假装 cloud stack save 已接通。",
    limitationsTitle: "当前限制",
    limitations: [
      "Cloud/profile-backed stack save 仍在网站路径中，不在本地 MCP 内。",
      "当前阶段 MCP 服务仅支持 stdio。",
      "目标指导刻意保持保守，遵循当前 adapter 支持的安装模型。",
    ],
    nextStep: "如果你想看完整命令面，请打开 CLI 文档；或者先回到目录构建一个 bundle。",
    openCli: "打开 CLI 文档",
    openCatalog: "打开目录",
  },
  hi: {
    title: "लोकल MCP",
    intro:
      "VibeBasket CLI के माध्यम से एक local stdio MCP server देता है, ताकि AI IDEs catalog items खोज सकें, target capabilities समझ सकें, install plan बना सकें, और conversation छोड़े बिना bundles apply कर सकें.",
    docsHome: "दस्तावेज़",
    statusTitle: "यह अभी क्या करता है",
    statusBody:
      "यह एक मजबूत phase-1 MCP surface है: catalog search, single item lookup, target guidance, install planning, apply, backup listing, rollback, और local stack save/load सब वास्तविक CLI service layer से चलते हैं.",
    commandTitle: "शुरू करने का command",
    commandBody:
      "Local MCP server को npx vibebasket mcp serve से चलाएँ। Client को HTTP नहीं, stdio के माध्यम से connect करना चाहिए.",
    snippetsTitle: "Native config snippets",
    snippetsBody:
      "targets.get_mcp_snippet से target-native fragments माँगें। ये examples कुछ representative clients के लिए exact merge shape दिखाते हैं.",
    snippetsFootnote:
      "हर snippet एक merge fragment है, पूरा config file नहीं। User की बाकी config को सुरक्षित रखें.",
    cursorExample: "Cursor / JSON",
    continueExample: "Continue / YAML",
    codexExample: "Codex CLI / TOML",
    claudeCodeExample: "Claude Code / JSON",
    zedExample: "Zed / JSON",
    gooseExample: "Goose / YAML",
    toolsTitle: "मुख्य tools",
    tools: [
      "session.get_state — current API base URL, write policy और local/cloud stack availability दिखाता है",
      "targets.list / targets.get_setup_guide / targets.get_mcp_snippet — target capabilities, setup guidance और हर IDE के लिए native MCP config fragments बताता है",
      "catalog.search / catalog.get_item — trusted catalog entries खोजता और दिखाता है",
      "install.plan / install.apply — पहले dry-run, फिर real adapter pipeline के माध्यम से apply",
      "install.list_backups / install.rollback — local backups दिखाता और restore करता है",
    ],
    safetyTitle: "सुरक्षा मॉडल",
    safetyBody:
      "Low-risk tools सीधे चलते हैं। Medium और high-risk tools policy-gated हैं। Runtime secrets local रहते हैं, और MCP surface cloud stack save linked न होने पर उसका दिखावा नहीं करता.",
    limitationsTitle: "मौजूदा सीमाएँ",
    limitations: [
      "Cloud/profile-backed stack save अभी भी website के रास्ते चलता है, local MCP के अंदर नहीं.",
      "इस phase में MCP server केवल stdio है.",
      "Target guidance जानबूझकर conservative है और current adapter-backed install model को follow करती है.",
    ],
    nextStep:
      "पूरी command surface के लिए CLI reference खोलें, या पहले bundle बनाने के लिए catalog पर लौटें.",
    openCli: "CLI reference खोलें",
    openCatalog: "कैटलॉग खोलें",
  },
  ru: {
    title: "Локальный MCP",
    intro:
      "VibeBasket через CLI поднимает локальный stdio MCP-сервер, чтобы AI IDE могли искать элементы каталога, понимать возможности целей, планировать установку и применять bundle, не выходя из диалога.",
    docsHome: "Документация",
    statusTitle: "Что умеет сейчас",
    statusBody:
      "Это сильная phase-1 MCP-поверхность: поиск по каталогу, lookup по item id, guidance по целям, планирование, apply, список backup’ов, rollback и локальное сохранение/загрузка stack’ов идут через реальный сервисный слой CLI.",
    commandTitle: "Команда запуска",
    commandBody:
      "Запускайте локальный MCP-сервер командой npx vibebasket mcp serve. Клиент должен подключаться по stdio, а не по HTTP.",
    snippetsTitle: "Нативные config snippets",
    snippetsBody:
      "Запрашивайте target-native fragments через targets.get_mcp_snippet. Эти примеры показывают точную merge-форму для нескольких типовых клиентов.",
    snippetsFootnote:
      "Каждый snippet — это merge fragment, а не полный config file. Сохраняйте остальную пользовательскую конфигурацию.",
    cursorExample: "Cursor / JSON",
    continueExample: "Continue / YAML",
    codexExample: "Codex CLI / TOML",
    claudeCodeExample: "Claude Code / JSON",
    zedExample: "Zed / JSON",
    gooseExample: "Goose / YAML",
    toolsTitle: "Ключевые tools",
    tools: [
      "session.get_state — показывает текущий API base URL, write policy и доступность local/cloud stack’ов",
      "targets.list / targets.get_setup_guide / targets.get_mcp_snippet — показывает возможности целей, guidance по настройке и нативные MCP config fragments для каждого IDE",
      "catalog.search / catalog.get_item — ищет и показывает доверенные записи каталога",
      "install.plan / install.apply — сначала dry-run, затем apply через реальный adapter pipeline",
      "install.list_backups / install.rollback — показывает и восстанавливает локальные backup’ы",
    ],
    safetyTitle: "Модель безопасности",
    safetyBody:
      "Low-risk tools запускаются напрямую. Medium- и high-risk tools проходят через policy. Runtime secrets остаются локальными, а MCP-поверхность не делает вид, что cloud stack save уже привязан, если это не так.",
    limitationsTitle: "Текущие ограничения",
    limitations: [
      "Cloud/profile-backed stack save по-прежнему идёт через сайт, а не через local MCP.",
      "На этой фазе MCP-сервер работает только по stdio.",
      "Guidance по целям намеренно консервативен и следует текущей adapter-backed модели установки.",
    ],
    nextStep:
      "Откройте CLI reference, если нужен весь набор команд, или вернитесь в каталог, чтобы сначала собрать bundle.",
    openCli: "Открыть CLI reference",
    openCatalog: "Открыть каталог",
  },
} as const;

const EXAMPLE_TARGETS = [
  { key: "cursorExample", targetId: "cursor" },
  { key: "claudeCodeExample", targetId: "claude-code" },
  { key: "continueExample", targetId: "continue" },
  { key: "codexExample", targetId: "codex" },
  { key: "zedExample", targetId: "zed" },
  { key: "gooseExample", targetId: "goose" },
] as const;

export function DocsTabMcp({ locale }: { locale: AppLocale }) {
  const copy = MCP_COPY[locale as keyof typeof MCP_COPY] ?? MCP_COPY.en;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="mb-12 flex flex-wrap items-center gap-2 break-words font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] select-none">
        <Link
          href={localizePath(locale, "/docs")}
          className="opacity-80 transition-colors hover:text-[#a0fdda]"
        >
          {copy.docsHome}
        </Link>
        <span className="text-[#bdc9c2]/30">/</span>
        <span className="text-foreground">{copy.title}</span>
      </div>

      <div className="mb-20">
        <h1 className="mb-8 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          {copy.title}
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-[#bdc9c2] sm:text-lg">
          {copy.intro}
        </p>
      </div>

      <div className="space-y-10">
        <section className="border border-[#3e4944] bg-[#181d1a] p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <TerminalSquare className="h-5 w-5 text-[#a0fdda]" />
            <h2 className="text-xl font-semibold text-foreground">{copy.commandTitle}</h2>
          </div>
          <code className="mb-4 block overflow-x-auto border border-[#3e4944] bg-[#101412] px-4 py-3 font-mono text-sm text-[#a0fdda]">
            npx vibebasket mcp serve
          </code>
          <p className="text-sm leading-relaxed text-[#bdc9c2]">{copy.commandBody}</p>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="border border-[#3e4944] bg-[#181d1a] p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <Wrench className="h-5 w-5 text-[#33bbc5]" />
              <h2 className="text-xl font-semibold text-foreground">{copy.statusTitle}</h2>
            </div>
            <p className="mb-5 text-sm leading-relaxed text-[#bdc9c2]">{copy.statusBody}</p>
            <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[#a0fdda]">
              {copy.toolsTitle}
            </h3>
            <ul className="space-y-3 text-sm leading-relaxed text-[#bdc9c2]">
              {copy.tools.map((item) => (
                <li key={item} className="border-l border-[#3e4944] pl-4">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-[#3e4944] bg-[#181d1a] p-6 sm:p-8">
            <div className="mb-4 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#e040fb]" />
              <h2 className="text-xl font-semibold text-foreground">{copy.safetyTitle}</h2>
            </div>
            <p className="mb-5 text-sm leading-relaxed text-[#bdc9c2]">{copy.safetyBody}</p>
            <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-[#a0fdda]">
              {copy.limitationsTitle}
            </h3>
            <ul className="space-y-3 text-sm leading-relaxed text-[#bdc9c2]">
              {copy.limitations.map((item) => (
                <li key={item} className="border-l border-[#3e4944] pl-4">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border border-[#3e4944] bg-[#181d1a] p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <Wrench className="h-5 w-5 text-[#7dd3fc]" />
            <h2 className="text-xl font-semibold text-foreground">{copy.snippetsTitle}</h2>
          </div>
          <p className="mb-6 max-w-3xl text-sm leading-relaxed text-[#bdc9c2]">{copy.snippetsBody}</p>
          <McpSnippetPreview
            targets={EXAMPLE_TARGETS.map(({ key, targetId }) => ({
              id: targetId,
              label: copy[key as keyof typeof copy] as string,
            }))}
            footnote={copy.snippetsFootnote}
          />
        </section>

        <section className="border border-[#3e4944] bg-[#181d1a] p-6 sm:p-8">
          <p className="mb-5 max-w-3xl text-sm leading-relaxed text-[#bdc9c2]">{copy.nextStep}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`${localizePath(locale, "/docs")}?tab=cli`}
              className="inline-flex min-h-11 items-center gap-2 border border-[#3e4944] bg-[#101412] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[#bdc9c2] transition-colors hover:border-[#a0fdda]/50 hover:text-[#f4fbf7]"
            >
              {copy.openCli}
            </Link>
            <Link
              href={`${localizePath(locale, "/")}#catalog`}
              className="inline-flex min-h-11 items-center gap-2 border border-accent bg-accent/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {copy.openCatalog}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
