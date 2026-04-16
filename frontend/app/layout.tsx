import "./globals.css";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALE_COOKIE, SUPPORTED_LOCALES } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Story Forge",
  description: "Generate a polished mobile story from your images, context and Spotify taste."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = SUPPORTED_LOCALES.includes(cookieLocale as (typeof SUPPORTED_LOCALES)[number])
    ? cookieLocale
    : DEFAULT_LOCALE;

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}

