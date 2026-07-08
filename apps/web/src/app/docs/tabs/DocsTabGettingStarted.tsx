import type { AppLocale } from "@/i18n/config";
import { localizePath } from "@/i18n/locale-routing";
import { Info, Play, TerminalSquare } from "lucide-react";
import Link from "next/link";

const GETTING_STARTED_COPY = {
  en: {
    title: "Getting Started",
    intro:
      "Start here if you want the shortest path from zero to your first working bundle. This guide explains what VibeBasket does, how to apply a bundle safely, and what to expect on first run when you are self-hosting.",
    methodology: "Core Methodology",
    lifecycle: "Bundle Lifecycle",
    installation: "Installation",
    overviewBody:
      "VibeBasket is a bundle-and-apply workflow for MCP servers, Skills, and Rules across AI IDEs. You choose items in the catalog, generate a bundle, and then apply that bundle locally with one command. The installer writes idempotently, creates backups before it changes supported configs, and verifies what it wrote when the adapter supports readback checks.",
    lifecycleBody:
      "Anonymous bundles created without an account expire after 48 hours. Registered user bundles persist for 365 days. Expired bundles are automatically purged by the platform's periodic cleanup job. Sign in via GitHub, Google, Apple, or Microsoft Entra ID to preserve your bundles long-term.",
    installLead:
      "Once you have a bundle URL, run the generated command inside the machine or project where you actually want the configuration to land:",
    terminalLabel: "terminal",
    cliUsageTitle: "Global CLI Usage",
    cliUsageBody:
      "The npx command runs the CLI without requiring a global install. Power users can still install it globally with npm i -g vibebasket to invoke vibebasket directly without npx. If you are self-hosting, expect the first catalog sync to be the slowest step in a fresh install.",
  },
  tr: {
    title: "Başlangıç",
    intro:
      "Sıfırdan ilk çalışan bundle’ına en kısa yoldan gitmek istiyorsan buradan başla. Bu rehber VibeBasket’in ne yaptığını, bir bundle’ın nasıl güvenle uygulanacağını ve self-host ilk çalıştırmada ne beklemen gerektiğini açıklar.",
    methodology: "Temel Metodoloji",
    lifecycle: "Bundle Yaşam Döngüsü",
    installation: "Kurulum",
    overviewBody:
      "VibeBasket, AI IDE’ler genelinde MCP server’ları, Skill’ler ve Rule’lar için bundle-and-apply iş akışıdır. Katalogdan öğeleri seçer, bir bundle üretir ve sonra bu bundle’ı tek komutla yerelde uygularsın. Installer idempotent yazar, desteklenen config’leri değiştirmeden önce yedek alır ve adaptör readback kontrolü sunuyorsa yazdığı sonucu yeniden doğrular.",
    lifecycleBody:
      "Hesapsız oluşturulan anonim bundle’lar 48 saat sonra sona erer. Kayıtlı kullanıcı bundle’ları 365 gün boyunca kalır. Süresi dolan bundle’lar platformun periyodik cleanup işi tarafından otomatik temizlenir. Bundle’larını uzun süre korumak için GitHub, Google, Apple veya Microsoft Entra ID ile giriş yap.",
    installLead:
      "Bir bundle URL’in olduğunda, üretilen komutu yapılandırmanın gerçekten yazılmasını istediğin makine veya proje içinde çalıştır:",
    terminalLabel: "terminal",
    cliUsageTitle: "Global CLI Kullanımı",
    cliUsageBody:
      "npx komutu, global kurulum gerektirmeden CLI’ı çalıştırır. İleri kullanıcılar isterse npm i -g vibebasket ile global kurulum yapıp vibebasket komutunu npx olmadan doğrudan kullanabilir. Self-host ediyorsan ilk katalog senkronunun temiz kurulumdaki en yavaş adım olmasını bekle.",
  },
  es: {
    title: "Primeros pasos",
    intro:
      "Empieza aquí si quieres la ruta más corta desde cero hasta tu primer bundle funcional. Esta guía explica qué hace VibeBasket, cómo aplicar un bundle de forma segura y qué esperar en el primer arranque si haces self-host.",
    methodology: "Metodología central",
    lifecycle: "Ciclo de vida del bundle",
    installation: "Instalación",
    overviewBody:
      "VibeBasket es un flujo bundle-and-apply para servidores MCP, Skills y Rules en distintos AI IDEs. Eliges elementos del catálogo, generas un bundle y luego lo aplicas localmente con un solo comando. El instalador escribe de forma idempotente, crea backups antes de cambiar configuraciones compatibles y verifica lo escrito cuando el adaptador soporta readback.",
    lifecycleBody:
      "Los bundles anónimos creados sin cuenta caducan después de 48 horas. Los bundles de usuarios registrados se conservan durante 365 días. Los bundles caducados se eliminan automáticamente mediante la tarea periódica de limpieza de la plataforma. Inicia sesión con GitHub, Google, Apple o Microsoft Entra ID para conservar tus bundles a largo plazo.",
    installLead:
      "Cuando ya tengas una URL de bundle, ejecuta el comando generado dentro de la máquina o proyecto donde realmente quieres que se escriba la configuración:",
    terminalLabel: "terminal",
    cliUsageTitle: "Uso global del CLI",
    cliUsageBody:
      "El comando npx ejecuta el CLI sin requerir una instalación global. Los usuarios avanzados pueden instalarlo globalmente con npm i -g vibebasket para invocar vibebasket directamente sin npx. Si haces self-hosting, espera que la primera sincronización del catálogo sea el paso más lento de una instalación limpia.",
  },
  zh: {
    title: "快速开始",
    intro:
      "如果你想用最短路径从零到第一个可工作的 bundle，就从这里开始。本指南说明 VibeBasket 做什么、如何安全地 apply 一个 bundle，以及在自托管场景下首次运行时应期待什么。",
    methodology: "核心方法",
    lifecycle: "Bundle 生命周期",
    installation: "安装",
    overviewBody:
      "VibeBasket 是一个面向 AI IDE 的 bundle-and-apply 工作流，用于分发 MCP servers、Skills 和 Rules。你在目录中选择条目，生成 bundle，然后用一条命令在本地 apply。安装器以幂等方式写入，在修改受支持的配置前会先做备份，并在 adapter 支持 readback 时验证写入结果。",
    lifecycleBody:
      "未登录用户创建的匿名 bundle 会在 48 小时后过期。已注册用户的 bundle 会保留 365 天。过期 bundle 会由平台的定期清理任务自动删除。使用 GitHub、Google、Apple 或 Microsoft Entra ID 登录即可长期保留 bundle。",
    installLead: "拿到 bundle URL 后，请在你真正希望落盘配置的机器或项目目录中运行生成的命令：",
    terminalLabel: "终端",
    cliUsageTitle: "全局 CLI 用法",
    cliUsageBody:
      "npx 命令无需全局安装即可运行 CLI。高级用户也可以通过 npm i -g vibebasket 全局安装，然后直接运行 vibebasket 而不经过 npx。如果你在自托管环境中使用，首次目录同步通常会是全新安装里最慢的一步。",
  },
  hi: {
    title: "शुरुआत करें",
    intro:
      "यदि आप शून्य से अपने पहले काम करने वाले bundle तक सबसे छोटा रास्ता चाहते हैं, तो यहीं से शुरू करें। यह guide बताती है कि VibeBasket क्या करता है, bundle को सुरक्षित रूप से कैसे apply करना है, और self-hosting की पहली run में क्या अपेक्षा रखनी है।",
    methodology: "मुख्य विधि",
    lifecycle: "Bundle जीवनचक्र",
    installation: "इंस्टॉलेशन",
    overviewBody:
      "VibeBasket AI IDEs में MCP servers, Skills और Rules के लिए bundle-and-apply workflow है। आप catalog से items चुनते हैं, bundle बनाते हैं, और फिर उसे एक command से locally apply करते हैं। Installer idempotent तरीके से लिखता है, supported configs बदलने से पहले backup बनाता है, और adapter readback checks सपोर्ट करता हो तो लिखे गए परिणाम को verify करता है।",
    lifecycleBody:
      "बिना अकाउंट बनाए गए anonymous bundles 48 घंटों बाद expire हो जाते हैं। Registered users के bundles 365 दिनों तक बने रहते हैं। Expired bundles platform की periodic cleanup job द्वारा स्वतः हटा दिए जाते हैं। अपने bundles लंबे समय तक सुरक्षित रखने के लिए GitHub, Google, Apple या Microsoft Entra ID से साइन इन करें।",
    installLead:
      "जब आपके पास bundle URL हो, तो generated command उसी machine या project के अंदर चलाएँ जहाँ आप वास्तव में configuration लिखना चाहते हैं:",
    terminalLabel: "टर्मिनल",
    cliUsageTitle: "Global CLI उपयोग",
    cliUsageBody:
      "npx command बिना global install के CLI चलाता है। Power users चाहें तो npm i -g vibebasket के साथ global install करके vibebasket को सीधे चला सकते हैं। यदि आप self-host कर रहे हैं, तो clean install में पहली catalog sync सबसे धीमा step हो सकती है।",
  },
} as const;

const DOCS_HOME_LABEL = {
  en: "Docs",
  tr: "Dokümanlar",
  es: "Documentación",
  zh: "文档",
  hi: "दस्तावेज़",
} as const;

export function DocsTabGettingStarted({ locale }: { locale: AppLocale }) {
  const copy = GETTING_STARTED_COPY[locale];
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
          <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-6">
            {copy.methodology}
          </h2>
          <p className="text-sm text-[#bdc9c2] leading-relaxed max-w-3xl">{copy.overviewBody}</p>
          <div className="flex gap-4 p-8 border-l-2 border-[#33bbc5] bg-[#33bbc5]/5 rounded-r-[2px] my-10">
            <Info className="h-5 w-5 text-[#33bbc5] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#33bbc5] font-semibold mb-3">
                {copy.lifecycle}
              </h4>
              <p className="text-xs text-[#bdc9c2] leading-relaxed">{copy.lifecycleBody}</p>
            </div>
          </div>
        </section>
        <section id="installation" className="scroll-mt-28">
          <div className="flex items-center gap-2.5 mb-8">
            <Play className="h-6 w-6 text-[#a0fdda] animate-pulse" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {copy.installation}
            </h2>
          </div>
          <div className="prose prose-invert max-w-none text-sm text-[#bdc9c2] leading-relaxed space-y-8">
            <p className="max-w-3xl">{copy.installLead}</p>
            <div className="border border-[#3e4944] rounded-[2px] overflow-hidden bg-[#101412] shadow-xl group relative my-10">
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#3e4944] bg-[#1c211e] select-none">
                <div className="flex items-center gap-2">
                  <TerminalSquare className="h-4 w-4 text-[#a0fdda]" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#bdc9c2]">
                    {copy.terminalLabel}
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase text-[#bdc9c2]/50 select-none">
                  bash
                </span>
              </div>
              <div className="p-8 bg-[#0a0f0d] overflow-x-auto">
                <pre className="font-mono text-xs text-foreground leading-relaxed">
                  <span className="text-[#a0fdda]">npx</span> vibebasket apply{" "}
                  <span className="text-[#a0fdda]/85 font-semibold">
                    https://vibebasket.dev/api/bundle/cj2k9x
                  </span>
                </pre>
              </div>
            </div>
            <div className="flex gap-4 p-8 border-l-2 border-[#a0fdda] bg-[#a0fdda]/5 rounded-r-[2px] my-10">
              <Info className="h-5 w-5 text-[#a0fdda] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#a0fdda] font-semibold mb-3">
                  {copy.cliUsageTitle}
                </h4>
                <p className="text-xs text-[#bdc9c2] leading-relaxed">{copy.cliUsageBody}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
