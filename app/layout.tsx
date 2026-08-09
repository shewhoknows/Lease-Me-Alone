import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://flatmates-night-owl.prateekranka.chatgpt.site"),
  title: "Flatmates — The Night Owl Problem",
  description: "A cozy spatial logic game about finding the one living arrangement that keeps everyone happy.",
  openGraph: {
    title: "Flatmates — The Night Owl Problem",
    description: "Three bedrooms. Three very particular people. One arrangement that might preserve the group chat.",
    type: "website",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "Flatmates illustrated dollhouse apartment" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flatmates — The Night Owl Problem",
    description: "A cozy spatial logic game about people, space and consequences.",
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
