import type { Metadata } from "next";
import "./globals.css";
import MotionProvider from "@/components/MotionProvider";
import GrainOverlay from "@/components/GrainOverlay";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Colton Tollett - Design Engineer",
  description: "Building polished, technically complex interfaces—blending design + engineering to ship products that feel right.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Restores saved theme before first paint to avoid flash */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('ct-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}` }} />
      </head>
      <body className="antialiased">
        <MotionProvider>
          {children}
        </MotionProvider>
        <GrainOverlay />
        <Analytics />
      </body>
    </html>
  );
}
