import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://flatmates-night-owl.prateekranka.chatgpt.site"),
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
  return (
    <html lang="en">
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
