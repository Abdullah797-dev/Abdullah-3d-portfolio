import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SmoothScroll } from "@/components/effects/smooth-scroll";
import { CounterPreloader } from "@/components/preloader/counter-preloader";
import { GlowCursor } from "@/components/cursor/glow-cursor";
import { ScrollEffects } from "@/components/effects/scroll-effects";
import { ScrollProgressBar } from "@/components/effects/scroll-progress-bar";
import { persona, socials } from "@/lib/portfolio-data";
import { Amiri, Manrope, Playfair_Display } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

// Arabic calligraphy for the "حافظ عبدالله" logo.
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri-face",
  display: "swap",
});

const SITE_URL = "https://hafiz-abdullah-portfolio.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${persona.name} — ${persona.title.split('&')[0].trim()}`,
    template: `%s · ${persona.name}`,
  },
  description: persona.tagline,
  keywords: [
    persona.name,
    "portfolio",
    "3D web",
    "Three.js",
    "React",
    "Next.js",
    "RAG chatbot",
    "full-stack developer",
    "computer science",
    "Karachi",
    "NED University",
    "MERN",
    "PERN",
    "Web 3D",
    "WebGL",
  ],
  authors: [{ name: persona.name }],
  creator: persona.name,
  publisher: persona.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${persona.name} — Interactive 3D Portfolio`,
    description: persona.tagline,
    type: "website",
    url: SITE_URL,
    siteName: `${persona.name} Portfolio`,
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${persona.name} — ${persona.title}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${persona.name} — Interactive 3D Portfolio`,
    description: persona.tagline,
    images: ["/og-image.png"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a120a",
  colorScheme: "dark light",
};

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: persona.name,
  url: SITE_URL,
  email: persona.email,
  sameAs: [socials.github, socials.linkedin].filter(Boolean),
  jobTitle: persona.title,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Karachi",
    addressCountry: "Pakistan",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "NED University of Engineering and Technology",
  },
  knowsAbout: [
    "Web Development",
    "React",
    "Node.js",
    "MERN Stack",
    "PERN Stack",
    "WebGL",
    "Three.js",
    "LangChain",
    "AI Integration",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${playfair.variable} ${amiri.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <SmoothScroll>
            <ScrollProgressBar />
            <CounterPreloader />
            <GlowCursor />
            <ScrollEffects />
            {children}
          </SmoothScroll>
          <Toaster />
          <SonnerToaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
