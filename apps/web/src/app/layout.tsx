import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  applicationName: "VibeBasket",
  title: "VibeBasket | The Ninite for Vibe Coding",
  description:
    "Bundle trusted MCP servers, skills, and rules into one shareable install. Pick your stack, generate a link, and apply it across every AI IDE and CLI.",
  keywords: [
    "AI coding",
    "MCP server",
    "Cursor IDE",
    "Windsurf IDE",
    "vibe coding",
    "LLM development",
    "Claude Desktop",
    "coding automation",
  ],
  authors: [{ name: "VibeBasket Team" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "VibeBasket | The Ninite for Vibe Coding",
    description:
      "Share one install flow for your AI dev stack. Trusted MCPs, skills, and rules for Cursor, Windsurf, Claude Code, and more.",
    url: "/",
    siteName: "VibeBasket",
    locale: "en_US",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeBasket | The Ninite for Vibe Coding",
    description:
      "Share one install flow for trusted MCPs, skills, and rules across every AI coding tool.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
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
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
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
