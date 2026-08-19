import type { Metadata } from "next";
import { Geist, Patrick_Hand } from "next/font/google";
import "./globals.css";

export const dynamic = "force-static";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const patrickHand = Patrick_Hand({
  variable: "--font-hand",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shewhoknows.github.io/Lease-Me-Alone/"),
  title: "Lease Me Alone — Six-Level Vertical Slice",
  description: "A cozy six-level spatial logic game about matching particular roommates to the right bedrooms.",
  openGraph: {
    title: "Lease Me Alone — Six-Level Vertical Slice",
    description: "Assign every roommate, move them in, and watch the house react across six puzzle levels.",
    type: "website",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "Lease Me Alone illustrated dollhouse apartment" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lease Me Alone — Six-Level Vertical Slice",
    description: "A cozy spatial logic game with six levels about people, rooms, and consequences.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  return (
    <html lang="en">
      <body className={`${geist.variable} ${patrickHand.variable}`}>
        <link rel="preload" as="image" href={`${basePath}/art/lease-me-alone-cutaway.avif`} fetchPriority="high" />
        {children}
      </body>
    </html>
  );
}
