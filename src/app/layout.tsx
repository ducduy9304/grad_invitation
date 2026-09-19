import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Playfair_Display, Be_Vietnam_Pro } from "next/font/google";
import { content } from "@/data/content";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
  display: "swap",
});

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-be-vietnam",
  display: "swap",
});

// Short name, and no subtitle: the preview card in a chat app is two lines of
// room, and the photo already carries the rest.
const title = `Thiệp mời tốt nghiệp — ${content.shortName}`;

// Real domain after deploying, so link previews resolve the OG image absolutely
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  openGraph: {
    title,
    type: "website",
    images: ["/images/og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f4ee",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${playfair.variable} ${beVietnam.variable}`}>
      <body className="antialiased">
        {children}
        {/*
         * Visit counting, read from the Vercel dashboard. No cookie and no
         * local storage, so there is nothing to disclose to a guest and
         * nothing of theirs left behind: a visit is one hashed, day-scoped
         * number that cannot be traced back to a person or joined to the RSVP
         * sheet. It answers how many opened the link, from which app, on what
         * kind of device -- never who.
         */}
        <Analytics />
      </body>
    </html>
  );
}
