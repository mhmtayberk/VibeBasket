import type { AppLocale } from "@/i18n/config";
import { localizePath } from "@/i18n/locale-routing";
import { SUPPORTED_TARGET_COUNT } from "@/lib/targets";
import { TerminalSquare } from "lucide-react";
import Link from "next/link";

const CLI_COPY = {
  en: {
    title: "CLI Reference",
    intro:
      "Reference for the local installer and inspection commands. The CLI is designed to run on the operator's machine, apply bundles idempotently, and avoid pretending support that an adapter does not actually implement.",
    architecture: "Core Architecture",
    commands: "Available Commands",
    scope: "Current scope",
    architectureBody:
      "The vibebasket CLI works as an idempotent local installer. When a bundle URL or local manifest file is passed, it fetches the manifest, applies only the capabilities the target adapter really supports, skips targets or MCP entries it cannot represent safely, writes backups before mutating known config files when a real config change is required, and verifies the written result when readback is implemented for that target.",
    applyDescription:
      "The primary command. Accepts a hosted bundle URL or a local JSON manifest file, validates its manifest, and applies each item (MCP servers, skills, rules) to every compatible local adapter. Adapters back up existing config files only when an MCP config mutation is actually needed and merge entries idempotently, so running apply twice is safe. If a target cannot support part of the bundle cleanly, the CLI reports that target as skipped instead of pretending the install succeeded.",
    scopeBody:
      "apply remains the primary install path. Supporting commands such as list, search, doctor, init, and rollback are available today.",
    flagsTitle: "apply — Flags",
    otherCommands: "Other Commands",
    flagColumn: "Flag",
    typeColumn: "Type",
    descriptionColumn: "Description",
    forceDescription:
      "Skips the interactive trust confirmation and lets adapter MCP merges overwrite an existing MCP entry when the same id is already present.",
    scopeDescription:
      "Overrides the bundle's scope. user installs in home directory, project installs relative to the working directory.",
    dryRunDescription:
      "Previews pending config changes without writing to disk. Shows the target configuration that would be applied.",
    noVerifyDescription:
      "Skips the post-install readback checks. Useful only for debugging or unusual local environments where readback is temporarily unreliable.",
    listDescription:
      "Scans all {TARGETS} IDE targets and reports installed MCP servers, skills, and rules per target.",
    searchDescription:
      "Searches the VibeBasket catalog from the terminal using the FTS5 full-text index. Returns up to 10 matching items from the hosted catalog across MCPs, Skills, and Rules. The current terminal surface is intentionally lightweight and best for quick catalog discovery rather than full visual browsing.",
    initDescription:
      "Scaffolds a .vibebasket/ workspace structure plus a local .vibebasket.env file template for project-scoped secrets and assets.",
    doctorDescription:
      "Diagnoses the local environment: checks for .vibebasket project structure, inspects adapter config presence, reports MCP counts where readable, and prints a concise environment summary for the current machine.",
    rollbackDescription:
      "Opens an interactive restore flow, lets you choose from recent timestamped backups, and then restores the selected adapter config snapshot. For project-scoped backups, run it from the same project root you want to restore into.",
  },
  tr: {
    title: "CLI Referansı",
    intro:
      "Yerel kurulum ve inceleme komutları için referans. CLI operatörün makinesinde çalışacak, bundle’ları idempotent uygulayacak ve bir adaptörün gerçekten uygulamadığı desteği varmış gibi göstermeyecek şekilde tasarlanmıştır.",
    architecture: "Temel Mimari",
    commands: "Mevcut Komutlar",
    scope: "Mevcut kapsam",
    architectureBody:
      "vibebasket CLI, idempotent bir yerel installer olarak çalışır. Bir bundle URL’i veya yerel manifest dosyası verildiğinde manifest’i alır, yalnızca hedef adaptörün gerçekten desteklediği yetenekleri uygular, güvenli şekilde temsil edemediği hedef veya MCP girdilerini atlar, gerçek bir config değişikliği gerektiğinde bilinen config dosyalarını değiştirmeden önce yedek alır ve o hedefte readback uygulanmışsa yazılan sonucu doğrular.",
    applyDescription:
      "Ana komuttur. Host edilen bir bundle URL’i veya yerel bir JSON manifest dosyasını kabul eder, manifest’i doğrular ve her öğeyi (MCP server’ları, skill’ler, rule’lar) uyumlu tüm yerel adaptörlere uygular. Adaptörler mevcut config dosyalarını yalnızca gerçekten bir MCP config mutasyonu gerekiyorsa yedekler ve girdileri idempotent şekilde merge eder; bu yüzden apply komutunu iki kez çalıştırmak güvenlidir. Bir hedef bundle’ın bir kısmını temiz biçimde destekleyemiyorsa CLI başarılı oldu numarası yapmak yerine o hedefi skipped olarak raporlar.",
    scopeBody:
      "Ana kurulum yolu apply komutudur. list, search, doctor, init ve rollback gibi yardımcı komutlar bugün kullanılabilir durumdadır.",
    flagsTitle: "apply — Bayraklar",
    otherCommands: "Diğer Komutlar",
    flagColumn: "Bayrak",
    typeColumn: "Tip",
    descriptionColumn: "Açıklama",
    forceDescription:
      "Etkileşimli güven onayını atlar ve aynı id zaten varsa adaptör MCP merge işlemlerinin mevcut girdinin üzerine yazmasına izin verir.",
    scopeDescription:
      "Bundle kapsamını override eder. user home dizinine, project ise çalışma dizinine göre kurulum yapar.",
    dryRunDescription:
      "Diske yazmadan bekleyen config değişikliklerini önizler. Uygulanacak hedef yapılandırmayı gösterir.",
    noVerifyDescription:
      "Kurulum sonrası readback kontrollerini atlar. Sadece debug veya readback’in geçici olarak güvenilmez olduğu sıra dışı yerel ortamlarda faydalıdır.",
    listDescription:
      "Tüm {TARGETS} IDE hedefini tarar ve hedef bazında kurulu MCP server’larını, skill’leri ve rule’ları raporlar.",
    searchDescription:
      "Terminalden FTS5 full-text index ile VibeBasket kataloğunu arar. Host edilen katalogdaki MCP, Skill ve Rule kayıtları arasından en fazla 10 eşleşme döndürür. Mevcut terminal yüzeyi kasıtlı olarak hafiftir ve tam görsel gezinmeden çok hızlı katalog keşfi için uygundur.",
    initDescription:
      "Proje kapsamlı secret’lar ve varlıklar için yerel bir .vibebasket.env şablonuyla birlikte .vibebasket/ çalışma alanı yapısını oluşturur.",
    doctorDescription:
      "Yerel ortamı teşhis eder: .vibebasket proje yapısını kontrol eder, adaptör config varlığını inceler, okunabildiğinde MCP sayılarını raporlar ve mevcut makine için kısa bir ortam özeti yazdırır.",
    rollbackDescription:
      "Etkileşimli bir geri yükleme akışı açar, son zaman damgalı yedeklerden seçim yapmanı sağlar ve ardından seçilen adaptör config anlık görüntüsünü geri yükler. Proje kapsamlı yedeklerde, geri yüklemek istediğin aynı proje kökünden çalıştır.",
  },
  es: {
    title: "Referencia CLI",
    intro:
      "Referencia de los comandos locales de instalación e inspección. El CLI está diseñado para ejecutarse en la máquina del operador, aplicar bundles de forma idempotente y no fingir soporte que un adaptador no implementa realmente.",
    architecture: "Arquitectura principal",
    commands: "Comandos disponibles",
    scope: "Alcance actual",
    architectureBody:
      "El CLI de vibebasket funciona como un instalador local idempotente. Cuando recibe una URL de bundle o un archivo de manifiesto local, obtiene el manifiesto, aplica solo las capacidades que el adaptador de destino realmente soporta, omite objetivos o entradas MCP que no puede representar con seguridad, escribe backups antes de mutar archivos de configuración conocidos cuando hace falta un cambio real y verifica el resultado escrito cuando el adaptador implementa readback.",
    applyDescription:
      "Es el comando principal. Acepta una URL de bundle alojada o un archivo local de manifiesto JSON, valida el manifiesto y aplica cada elemento (servidores MCP, skills y rules) a todos los adaptadores locales compatibles. Los adaptadores solo crean backup de archivos de configuración existentes cuando de verdad hace falta mutar la configuración MCP y hacen merge de forma idempotente, así que ejecutar apply dos veces es seguro. Si un objetivo no puede soportar parte del bundle limpiamente, el CLI lo informa como omitido en lugar de fingir que la instalación tuvo éxito.",
    scopeBody:
      "apply sigue siendo la ruta principal de instalación. Hoy también están disponibles comandos de apoyo como list, search, doctor, init y rollback.",
    flagsTitle: "apply — Opciones",
    otherCommands: "Otros comandos",
    flagColumn: "Opción",
    typeColumn: "Tipo",
    descriptionColumn: "Descripción",
    forceDescription:
      "Omite la confirmación interactiva de confianza y permite que los merges MCP del adaptador sobrescriban una entrada MCP existente cuando ya está presente el mismo id.",
    scopeDescription:
      "Sobrescribe el alcance del bundle. user instala en el directorio personal y project instala relativo al directorio de trabajo.",
    dryRunDescription:
      "Previsualiza los cambios de configuración pendientes sin escribir en disco. Muestra la configuración de destino que se aplicaría.",
    noVerifyDescription:
      "Omite las comprobaciones de lectura posteriores a la instalación. Solo es útil para depuración o entornos locales poco habituales donde el readback sea temporalmente poco fiable.",
    listDescription:
      "Escanea los {TARGETS} objetivos IDE y reporta los MCP servers, skills y rules instalados por objetivo.",
    searchDescription:
      "Busca el catálogo de VibeBasket desde la terminal usando el índice FTS5 de texto completo. Devuelve hasta 10 coincidencias del catálogo alojado entre MCPs, Skills y Rules. La superficie actual de terminal es intencionalmente ligera y está pensada más para descubrimiento rápido que para navegación visual completa.",
    initDescription:
      "Genera una estructura de espacio de trabajo .vibebasket/ junto con una plantilla local de archivo .vibebasket.env para secretos y assets con alcance de proyecto.",
    doctorDescription:
      "Diagnostica el entorno local: comprueba la estructura del proyecto .vibebasket, inspecciona la presencia de configuración del adaptador, informa cantidades MCP cuando son legibles y muestra un resumen conciso del entorno de la máquina actual.",
    rollbackDescription:
      "Abre un flujo interactivo de restauración, te permite elegir entre backups recientes con marca temporal y luego restaura la instantánea de configuración del adaptador seleccionada. Para backups con alcance de proyecto, ejecútalo desde la misma raíz de proyecto que quieras restaurar.",
  },
  zh: {
    title: "CLI 参考",
    intro:
      "这里汇总本地安装与检查命令。CLI 设计为在操作者自己的机器上运行，以幂等方式 apply bundles，并且不会假装 adapter 支持它实际上并未实现的能力。",
    architecture: "核心架构",
    commands: "可用命令",
    scope: "当前范围",
    architectureBody:
      "vibebasket CLI 充当一个幂等的本地安装器。当传入 bundle URL 或本地 manifest 文件时，它会获取并验证 manifest，只应用目标 adapter 真正支持的能力，跳过无法安全表达的目标或 MCP 条目，在确实需要修改已知配置文件时先写入备份，并在目标实现了 readback 时验证写入结果。",
    applyDescription:
      "这是主命令。它接受托管的 bundle URL 或本地 JSON manifest 文件，验证 manifest，然后将每个条目（MCP servers、skills、rules）应用到所有兼容的本地 adapters。只有在确实需要更改 MCP 配置时，adapter 才会为已有配置文件创建备份，并以幂等方式合并条目，因此多次运行 apply 是安全的。如果某个目标无法干净地支持 bundle 的某一部分，CLI 会把该目标报告为 skipped，而不是假装安装成功。",
    scopeBody:
      "apply 仍然是主要安装路径。现在也提供 list、search、doctor、init 和 rollback 等辅助命令。",
    flagsTitle: "apply — 参数",
    otherCommands: "其他命令",
    flagColumn: "参数",
    typeColumn: "类型",
    descriptionColumn: "说明",
    forceDescription:
      "跳过交互式信任确认，并允许 adapter 的 MCP 合并在相同 id 已存在时覆盖现有 MCP 条目。",
    scopeDescription: "覆盖 bundle 的范围。user 安装到主目录，project 安装到当前工作目录。",
    dryRunDescription: "预览即将发生的配置变更而不写入磁盘。显示将要应用的目标配置。",
    noVerifyDescription:
      "跳过安装后的 readback 检查。只适用于调试或某些 readback 暂时不可靠的特殊本地环境。",
    listDescription:
      "扫描全部 {TARGETS} 个 IDE 目标，并按目标报告已安装的 MCP servers、skills 和 rules。",
    searchDescription:
      "在终端中使用 FTS5 全文索引搜索 VibeBasket 目录。从托管目录中的 MCP、Skills 和 Rules 里返回最多 10 个匹配项。当前终端界面刻意保持轻量，更适合快速发现，而不是完整的可视化浏览。",
    initDescription:
      "生成 .vibebasket/ 工作区结构，以及一个供项目范围 secret 和资源使用的本地 .vibebasket.env 模板文件。",
    doctorDescription:
      "诊断本地环境：检查 .vibebasket 项目结构，探测 adapter 配置是否存在，在可读取时报告 MCP 数量，并输出当前机器的简明环境摘要。",
    rollbackDescription:
      "打开交互式恢复流程，让你从最近带时间戳的备份中进行选择，然后恢复选定的 adapter 配置快照。对于 project 范围的备份，请从你想恢复的同一个项目根目录中运行它。",
  },
  hi: {
    title: "CLI संदर्भ",
    intro:
      "यह local installation और inspection commands का reference है। CLI को operator की मशीन पर चलने, bundles को idempotent तरीके से apply करने, और adapter द्वारा वास्तव में support न की जाने वाली capability का दिखावा न करने के लिए डिज़ाइन किया गया है।",
    architecture: "मुख्य आर्किटेक्चर",
    commands: "उपलब्ध commands",
    scope: "वर्तमान scope",
    architectureBody:
      "vibebasket CLI एक idempotent local installer की तरह काम करता है। जब bundle URL या local manifest file दी जाती है, यह manifest लाता है, केवल वही capabilities apply करता है जिन्हें target adapter वास्तव में support करता है, unsafe targets या MCP entries को skip करता है, वास्तविक config change ज़रूरी होने पर known config files को mutate करने से पहले backup लिखता है, और target पर readback implement होने पर लिखे गए परिणाम को verify करता है।",
    applyDescription:
      "यह primary command है। यह hosted bundle URL या local JSON manifest file स्वीकार करता है, manifest validate करता है, और हर item (MCP servers, skills, rules) को सभी compatible local adapters पर apply करता है। Adapters existing config files का backup केवल तब बनाते हैं जब MCP config mutation वास्तव में ज़रूरी हो, और entries को idempotent तरीके से merge करते हैं; इसलिए apply को दो बार चलाना सुरक्षित है। यदि कोई target bundle के किसी हिस्से को साफ़ तरीके से support नहीं कर सकता, तो CLI install success का दिखावा करने के बजाय उस target को skipped बताता है।",
    scopeBody:
      "apply मुख्य install path बना रहता है। list, search, doctor, init और rollback जैसे supporting commands आज उपलब्ध हैं।",
    flagsTitle: "apply — Flags",
    otherCommands: "अन्य commands",
    flagColumn: "Flag",
    typeColumn: "Type",
    descriptionColumn: "विवरण",
    forceDescription:
      "Interactive trust confirmation को skip करता है और यदि वही id पहले से मौजूद हो तो adapter MCP merges को existing MCP entry overwrite करने देता है।",
    scopeDescription:
      "Bundle के scope को override करता है। user home directory में install करता है, project working directory के सापेक्ष install करता है।",
    dryRunDescription: "डिस्क पर लिखे बिना pending config changes का preview दिखाता है।",
    noVerifyDescription:
      "Post-install readback checks को skip करता है। यह केवल debugging या ऐसे uncommon local environments के लिए उपयोगी है जहाँ readback अस्थायी रूप से अविश्वसनीय हो।",
    listDescription:
      "सभी {TARGETS} IDE targets को scan करता है और target के अनुसार installed MCP servers, skills और rules बताता है।",
    searchDescription:
      "FTS5 full-text index का उपयोग करके terminal से VibeBasket catalog खोजता है। Hosted catalog में MCPs, Skills और Rules के बीच अधिकतम 10 matching items लौटाता है। वर्तमान terminal surface जानबूझकर हल्का रखा गया है और full visual browsing की बजाय तेज catalog discovery के लिए बेहतर है।",
    initDescription:
      "Project-scoped secrets और assets के लिए local .vibebasket.env file template के साथ .vibebasket/ workspace structure बनाता है।",
    doctorDescription:
      "Local environment का diagnostics करता है: .vibebasket project structure जाँचता है, adapter config presence देखता है, पढ़े जा सकने पर MCP counts रिपोर्ट करता है, और current machine के लिए concise environment summary प्रिंट करता है।",
    rollbackDescription:
      "Interactive restore flow खोलता है, हाल के timestamped backups में से चुनने देता है, और फिर चुना गया adapter config snapshot restore करता है। Project-scoped backups के लिए इसे उसी project root से चलाएँ जहाँ restore करना है।",
  },
} as const;

const DOCS_HOME_LABEL = {
  en: "Docs",
  tr: "Dokümanlar",
  es: "Documentación",
  zh: "文档",
  hi: "दस्तावेज़",
} as const;

export function DocsTabCli({ locale }: { locale: AppLocale }) {
  const copy = CLI_COPY[locale];
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#a0fdda] mb-12 flex items-center gap-2 select-none">
        <Link
          href={localizePath(locale, "/docs")}
          className="opacity-80 hover:text-[#a0fdda] transition-colors cursor-pointer"
        >
          {DOCS_HOME_LABEL[locale]}
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
        <section id="overview" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <TerminalSquare className="h-6 w-6 text-[#33bbc5]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {copy.architecture}
            </h2>
          </div>
          <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl">
            {copy.architectureBody}
          </p>
        </section>

        <section id="commands" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-8">
            {copy.commands}
          </h2>
          <div className="space-y-4">
            <div className="p-8 border border-[#3e4944] bg-[#181d1a] rounded-[2px] hover:border-[#a0fdda] hover:bg-[#202622] hover:shadow-[0_0_20px_rgba(160,253,218,0.15)] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300">
              <code className="font-mono text-[#a0fdda] text-sm font-semibold block mb-2">
                vibebasket apply &lt;url|file&gt;
              </code>
              <p className="text-xs text-[#bdc9c2] leading-relaxed">{copy.applyDescription}</p>
            </div>
          </div>
          <div className="flex gap-4 p-6 border-l-2 border-[#33bbc5] bg-[#33bbc5]/5 rounded-r-[2px] mt-8">
            <TerminalSquare className="h-5 w-5 text-[#33bbc5] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#33bbc5] font-semibold mb-2">
                {copy.scope}
              </h4>
              <p className="text-xs text-[#bdc9c2] leading-relaxed">{copy.scopeBody}</p>
            </div>
          </div>
        </section>

        <section id="flags" className="scroll-mt-28">
          <h2 className="text-2xl font-semibold tracking-tight text-[#dfe4df] mb-8">
            {copy.flagsTitle}
          </h2>
          <div className="border border-[#3e4944] rounded-[2px] overflow-hidden my-10 shadow-sm">
            <table className="w-full border-collapse text-left text-xs leading-relaxed">
              <thead>
                <tr className="bg-[#1c211e] border-b border-[#3e4944] font-mono uppercase tracking-wider text-[10px] text-foreground">
                  <th className="p-5 pl-7 font-semibold">{copy.flagColumn}</th>
                  <th className="p-5 font-semibold">{copy.typeColumn}</th>
                  <th className="p-5 font-semibold pr-7">{copy.descriptionColumn}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3e4944] font-mono text-[#bdc9c2]">
                <tr className="hover:bg-[#1c211e]/40 transition-colors">
                  <td className="p-5 pl-7 text-[#a0fdda] font-semibold">--force / -f</td>
                  <td className="p-5">Boolean</td>
                  <td className="p-5 pr-7 text-xs font-sans text-[#bdc9c2]/90 leading-relaxed">
                    {copy.forceDescription}
                  </td>
                </tr>
                <tr className="hover:bg-[#1c211e]/40 transition-colors">
                  <td className="p-5 pl-7 text-[#a0fdda] font-semibold">--scope / -s</td>
                  <td className="p-5">user | project</td>
                  <td className="p-5 pr-7 text-xs font-sans text-[#bdc9c2]/90 leading-relaxed">
                    {copy.scopeDescription.split("user")[0]}
                    <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                      user
                    </code>{" "}
                    {copy.scopeDescription.includes("user")
                      ? copy.scopeDescription.split("user")[1]?.split("project")[0]
                      : ""}
                    <code className="font-mono text-[10px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                      project
                    </code>{" "}
                    {copy.scopeDescription.includes("project")
                      ? copy.scopeDescription.split("project")[1]
                      : ""}
                  </td>
                </tr>
                <tr className="hover:bg-[#1c211e]/40 transition-colors">
                  <td className="p-5 pl-7 text-[#a0fdda] font-semibold">--dry-run / -d</td>
                  <td className="p-5">Boolean</td>
                  <td className="p-5 pr-7 text-xs font-sans text-[#bdc9c2]/90 leading-relaxed">
                    {copy.dryRunDescription}
                  </td>
                </tr>
                <tr className="hover:bg-[#1c211e]/40 transition-colors">
                  <td className="p-5 pl-7 text-[#a0fdda] font-semibold">--no-verify</td>
                  <td className="p-5">Boolean</td>
                  <td className="p-5 pr-7 text-xs font-sans text-[#bdc9c2]/90 leading-relaxed">
                    {copy.noVerifyDescription}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section id="other-commands" className="scroll-mt-28">
        <div className="flex items-center gap-2.5 mb-8">
          <TerminalSquare className="h-6 w-6 text-[#a0fdda]" />
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {copy.otherCommands}
          </h2>
        </div>
        <div className="space-y-6">
          <div className="border border-[#3e4944] p-6">
            <h3 className="font-mono text-[#a0fdda] text-xs font-semibold mb-3">vibebasket list</h3>
            <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl">
              {copy.listDescription.replace("{TARGETS}", String(SUPPORTED_TARGET_COUNT))}
            </p>
          </div>
          <div className="border border-[#3e4944] p-6">
            <h3 className="font-mono text-[#a0fdda] text-xs font-semibold mb-3">
              vibebasket search &lt;query&gt;
            </h3>
            <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl">
              {copy.searchDescription}
            </p>
          </div>
          <div className="border border-[#3e4944] p-6">
            <h3 className="font-mono text-[#a0fdda] text-xs font-semibold mb-3">vibebasket init</h3>
            <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl">
              {copy.initDescription}
            </p>
          </div>
          <div className="border border-[#3e4944] p-6">
            <h3 className="font-mono text-[#a0fdda] text-xs font-semibold mb-3">
              vibebasket doctor
            </h3>
            <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl">
              {copy.doctorDescription}
            </p>
          </div>
          <div className="border border-[#3e4944] p-6">
            <h3 className="font-mono text-[#a0fdda] text-xs font-semibold mb-3">
              vibebasket rollback
            </h3>
            <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl">
              {copy.rollbackDescription}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
