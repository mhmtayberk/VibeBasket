import type { AppLocale } from "@/i18n/config";
import { localizePath } from "@/i18n/locale-routing";
import { Cpu, TerminalSquare } from "lucide-react";
import Link from "next/link";

const DELIMITER_COPY = {
  en: {
    title: "Block Delimiters",
    intro:
      "Idempotent local file merging specifications with high-fidelity block-level delimiters.",
    section: "Idempotent Safe Merging",
    bodyLead:
      "When writing rulesets, instructions, or custom skill profiles into codebases, the CLI prevents file pollution by wrapping managed updates inside strict delimiters",
    terminalLabel: "rules format",
    bodyEnd:
      "This block model makes repeat applies safe. If the boundary already exists, VibeBasket replaces only the managed block. If it does not exist yet, it appends the block and leaves everything outside the delimiters untouched.",
  },
  tr: {
    title: "Blok Delimiter’ları",
    intro:
      "Yüksek doğruluklu blok delimiter’larıyla idempotent yerel dosya birleştirme spesifikasyonları.",
    section: "İdempotent Güvenli Birleştirme",
    bodyLead:
      "Rule set’lerini, talimatları veya özel skill profillerini kod tabanına yazarken CLI, yönettiği güncellemeleri katı delimiter’lar içine alarak dosya kirliliğini önler",
    terminalLabel: "rule formatı",
    bodyEnd:
      "Bu blok modeli tekrar apply işlemlerini güvenli kılar. Sınır zaten varsa VibeBasket yalnızca yönettiği bloğu değiştirir. Henüz yoksa bloğu ekler ve delimiter dışındaki her şeyi olduğu gibi bırakır.",
  },
  es: {
    title: "Delimitadores de bloque",
    intro:
      "Especificaciones de merge local idempotente con delimitadores de bloque de alta fidelidad.",
    section: "Merge seguro e idempotente",
    bodyLead:
      "Al escribir rulesets, instrucciones o perfiles de skill personalizados dentro del código, el CLI evita contaminar los archivos envolviendo las actualizaciones gestionadas dentro de delimitadores estrictos",
    terminalLabel: "formato de rules",
    bodyEnd:
      "Este modelo por bloques hace seguras las reaplicaciones. Si el límite ya existe, VibeBasket sustituye solo el bloque gestionado. Si todavía no existe, lo añade y deja intacto todo lo que está fuera de los delimitadores.",
  },
  zh: {
    title: "块分隔符",
    intro: "使用高保真块级分隔符实现幂等的本地文件合并规范。",
    section: "幂等且安全的合并",
    bodyLead:
      "当把规则集、指令或自定义 skill 配置写入代码库时，CLI 会把受管更新包裹在严格的分隔块内，从而避免污染原始文件",
    terminalLabel: "rules 格式",
    bodyEnd:
      "这种块模型让重复 apply 变得安全。如果边界已经存在，VibeBasket 只替换受管块；如果边界还不存在，它会追加新块，并保持分隔符之外的内容完全不变。",
  },
  hi: {
    title: "ब्लॉक डिलिमिटर्स",
    intro: "उच्च fidelity वाले block delimiters के साथ idempotent local file merging specifications.",
    section: "Idempotent और सुरक्षित merging",
    bodyLead:
      "जब rulesets, instructions या custom skill profiles को codebase में लिखा जाता है, CLI managed updates को सख्त delimiters के भीतर रखकर file pollution रोकता है",
    terminalLabel: "rules format",
    bodyEnd:
      "यह block model repeated apply को सुरक्षित बनाता है। यदि boundary पहले से मौजूद है, तो VibeBasket केवल managed block को replace करता है। यदि boundary नहीं है, तो वह block append करता है और delimiters के बाहर की सामग्री को जस का तस छोड़ देता है।",
  },
  ru: {
    title: "Блочные delimiters",
    intro:
      "Спецификация идемпотентного локального merge файлов с высокоточным разграничением на уровне блоков.",
    section: "Идемпотентный безопасный merge",
    bodyLead:
      "Когда CLI записывает rulesets, инструкции или кастомные skill-профили в codebase, он предотвращает загрязнение файлов, оборачивая управляемые обновления в строгие delimiters",
    terminalLabel: "формат rules",
    bodyEnd:
      "Такая блочная модель делает повторные apply безопасными. Если граница уже существует, VibeBasket заменяет только управляемый блок. Если её ещё нет, он добавляет блок и оставляет всё за пределами delimiters нетронутым.",
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

export function DocsTabDelimiters({ locale }: { locale: AppLocale }) {
  const copy = DELIMITER_COPY[locale as keyof typeof DELIMITER_COPY] ?? DELIMITER_COPY.en;
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
        <section id="delimiters" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <Cpu className="h-6 w-6 text-[#ffb300]" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {copy.section}
            </h2>
          </div>

          <div className="prose prose-invert max-w-none text-sm text-[#bdc9c2] leading-relaxed space-y-8">
            <p className="max-w-3xl">
              {copy.bodyLead} (for files like{" "}
              <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                .clinerules
              </code>
              ,{" "}
              <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                .hermesrules
              </code>
              ,{" "}
              <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                .voidrules
              </code>
              ,{" "}
              <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                .openclawrules
              </code>
              , or{" "}
              <code className="font-mono text-[11px] text-foreground bg-card px-1.5 py-0.5 rounded-[2px] border border-[#3e4944]">
                .aiderinstructions.md
              </code>
              ):
            </p>

            <div className="border border-[#3e4944] rounded-[2px] overflow-hidden bg-[#101412] shadow-xl group relative my-10">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#3e4944] bg-[#1c211e] select-none">
                <div className="flex items-center gap-2">
                  <TerminalSquare className="h-4 w-4 text-[#a0fdda]" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#bdc9c2]">
                    {copy.terminalLabel}
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase text-[#bdc9c2]/50 select-none">
                  rules
                </span>
              </div>
              <div className="p-8 bg-[#0a0f0d] overflow-x-auto">
                <pre className="font-mono text-xs text-muted-foreground/75 leading-relaxed">
                  <span className="text-amber-400">
                    {"# >>> VIBEBASKET START: custom-skill-id <<<"}
                  </span>
                  <br />
                  {"# Skill: Custom Skill (custom-skill-id)"}
                  <br />
                  {"... custom developer prompts and instructions ..."}
                  <br />
                  <span className="text-amber-400">
                    {"# >>> VIBEBASKET END: custom-skill-id <<<"}
                  </span>
                </pre>
              </div>
            </div>

            <p className="max-w-3xl">{copy.bodyEnd}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
