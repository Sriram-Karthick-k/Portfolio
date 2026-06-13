import type { Metadata } from "next";
import { Inter, Caveat, Kalam } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const kalam = Kalam({
  variable: "--font-kalam",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://portfolio-delta-wine-12.vercel.app"),
  title: "Sriram Karthick K — Software Engineer",
  description:
    "Member of Technical Staff at Zoho building Vani — a real-time infinite-canvas whiteboard platform powered by C++, Skia, WebAssembly, and AI.",
  twitter: {
    card: "summary_large_image",
    title: "Sriram Karthick K — Software Engineer",
    description: "Member of Technical Staff at Zoho building Vani.",
  },
  keywords: [
    "Sriram Karthick K",
    "Software Engineer",
    "Zoho",
    "Vani",
    "C++",
    "WebAssembly",
    "Skia",
    "Chennai",
  ],
  authors: [{ name: "Sriram Karthick K" }],
  openGraph: {
    title: "Sriram Karthick K — Software Engineer",
    description: "Member of Technical Staff at Zoho building Vani.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${caveat.variable} ${kalam.variable} font-sans antialiased bg-[#020817] text-slate-50`}
      >
        {children}
      </body>
    </html>
  );
}
