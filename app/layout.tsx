import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Colton Tollett - Design Engineer",
  description: "Building polished, technically complex interfaces—blending design + engineering to ship products that feel right.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
