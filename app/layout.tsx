import type { Metadata } from "next";
import "./globals.css";
import MotionProvider from "@/components/MotionProvider";
import GrainOverlay from "@/components/GrainOverlay";

export const metadata: Metadata = {
  title: "Colton Tollett - Design Engineer",
  description: "Building polished, technically complex interfaces—blending design + engineering to ship products that feel right.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <MotionProvider>
          {children}
        </MotionProvider>
        <GrainOverlay />
      </body>
    </html>
  );
}
