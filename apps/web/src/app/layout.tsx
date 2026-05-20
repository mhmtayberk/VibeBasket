import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vibebasket.dev"),
  applicationName: "VibeBasket",
  title: "VibeBasket | The Ninite for Vibe Coding",
  description:
    "Bundle trusted MCP servers, agent skills, and project rules into one shareable install flow for Cursor, Windsurf, VS Code, Claude Code, Codex CLI, Zed, Gemini CLI, Junie, Kiro, and Cline CLI.",
  keywords: ["AI coding", "MCP server", "Cursor IDE", "Windsurf IDE", "vibe coding", "LLM development", "Claude Desktop", "coding automation"],
  authors: [{ name: "VibeBasket Team" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "VibeBasket | The Ninite for Vibe Coding",
    description:
      "Share one install flow for your AI development stack. Trusted MCPs, skills, and rules for modern AI editors and CLIs.",
    url: "/",
    siteName: "VibeBasket",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeBasket | The Ninite for Vibe Coding",
    description:
      "Share one install flow for trusted MCPs, skills, and rules across your AI coding stack.",
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "developer tools",
};

export const viewport: Viewport = {
  themeColor: "#0f1512",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={true}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
