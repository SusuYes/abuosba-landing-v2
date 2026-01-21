import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const themeInitScript = `
(() => {
  const storageKey = "abuosba.theme";
  const getStored = () => {
    try { return localStorage.getItem(storageKey); } catch { return null; }
  };
  const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
  const systemDark = () => (mql ? mql.matches : false);
  const resolve = (t) => (t === "dark" ? true : t === "light" ? false : systemDark());
  const apply = (isDark) => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    root.dataset.theme = isDark ? "dark" : "light";
  };

  const stored = getStored();
  apply(resolve(stored || "system"));

  if ((stored || "system") === "system" && mql?.addEventListener) {
    mql.addEventListener("change", () => apply(resolve("system")));
  }
})();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Suhail Abuosba | Data, Systems & Student Experience",
  description: "Data, systems and student experience with clarity. Suhail Abuosba — builder, engineer, technologist.",
  keywords: ["data", "systems", "student experience", "higher education", "Tasmania"],
  authors: [{ name: "Suhail Abuosba" }],
  openGraph: {
    title: "Suhail Abuosba",
    description: "Data, systems and student experience with clarity.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme init script - static string, safe to inline */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
