import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VibeBasket | The Ninite for Vibe Coding",
  description: "Configure your entire AI development environment in seconds. Bundle MCP servers, Claude Skills, and project rules for Cursor, Windsurf, and VS Code with a single shareable command.",
  keywords: ["AI coding", "MCP server", "Cursor IDE", "Windsurf IDE", "vibe coding", "LLM development", "Claude Desktop", "coding automation"],
  authors: [{ name: "VibeBasket Team" }],
  openGraph: {
    title: "VibeBasket | The Ninite for Vibe Coding",
    description: "One link to rule all your IDE configs. Bundle MCPs and Skills effortlessly.",
    url: "https://vibebasket.dev",
    siteName: "VibeBasket",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeBasket | The Ninite for Vibe Coding",
    description: "One link to rule all your IDE configs. Bundle MCPs and Skills effortlessly.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
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
