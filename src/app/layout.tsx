import type { Metadata, Viewport } from "next";
import { Anton_SC, Archivo, Archivo_Black } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import SmoothScroll from "@/components/motion/SmoothScroll";
import { site } from "@/data/content";

const anton = Anton_SC({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo-black",
  display: "swap",
});

const archivo = Archivo({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: site.keywords,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    locale: site.locale,
    url: site.url,
    siteName: `${site.name} — Official Portfolio`,
    title: site.title,
    description: site.description,
    firstName: "Sudhan",
    lastName: "Gurung",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  category: "government",
};

export const viewport: Viewport = {
  themeColor: "#0b1227",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // suppressHydrationWarning: the inline script in <head> adds the `js` class before React hydrates.
  return (
    <html lang="en" className={`${anton.variable} ${archivoBlack.variable} ${archivo.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Stack+Sans+Headline:wght@600;700&family=Stack+Sans+Text:wght@600&display=swap"
          rel="stylesheet"
        />
        {/* Flags that JS is running so motion-hidden elements only hide when they will be animated in. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
