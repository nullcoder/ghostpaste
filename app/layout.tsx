import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { FooterWithBuildInfo } from "@/components/footer";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GhostPaste - Zero-Knowledge Encrypted Code Sharing",
  description:
    "Share code snippets securely with client-side encryption. Your code, your privacy.",
  metadataBase: new URL("https://ghostpaste.dev"),
  openGraph: {
    title: "GhostPaste - Zero-Knowledge Encrypted Code Sharing",
    description:
      "Share code snippets securely with client-side encryption. Your code, your privacy.",
    url: "https://ghostpaste.dev",
    siteName: "GhostPaste",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "GhostPaste - Zero-Knowledge Encrypted Code Sharing",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GhostPaste - Zero-Knowledge Encrypted Code Sharing",
    description:
      "Share code snippets securely with client-side encryption. Your code, your privacy.",
    images: ["/twitter-image.png"],
    creator: "@ghostpaste",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <Header />
            <main id="main-content" className="flex-1">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
            <FooterWithBuildInfo />
          </ErrorBoundary>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
