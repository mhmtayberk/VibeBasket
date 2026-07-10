import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { resolveLocale } from "@/i18n/config";
import { resolvePublicBaseUrl } from "@/lib/public-url";
import { headers } from "next/headers";

export const metadata: Metadata = {
  metadataBase: new URL(resolvePublicBaseUrl()),
  applicationName: "VibeBasket",
  title: "VibeBasket",
  description: "Bundle trusted MCP servers, skills, and rules into one shareable install flow.",
  authors: [{ name: "VibeBasket Team" }],
  icons: {
    icon: [{ url: "/icon", type: "image/png", sizes: "64x64" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "developer tools",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f1512",
  colorScheme: "dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get("x-locale"));

  return (
    <html lang={locale} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
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
